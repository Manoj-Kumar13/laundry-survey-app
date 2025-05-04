"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Radio,
  Row,
  Col,
  message,
} from "antd";
import { ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORY_OPTIONS, ENTRIES_TABLE_NAME, STORAGE_BUCKET_NAME } from "@/src/utils/constants";

const { Option } = Select;

const fetchGeolocation = (
  onSuccess: (location: string) => void,
  onError: (error: string) => void
) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        onSuccess(mapsLink);
      },
      (error) => {
        onError(error.message);
      }
    );
  } else {
    onError("Geolocation is not supported by your browser.");
  }
};

const CategoryField: React.FC<{
  category: string;
  onCategoryChange: (value: string) => void;
}> = ({ category, onCategoryChange }) => (
  <>
    <Col xs={24} md={12}>
      <Form.Item
        label="Category of Establishment"
        name="category"
        rules={[{ required: true, message: "This field is required" }]}
      >
        <Select placeholder="Select category" onChange={onCategoryChange}>
          {CATEGORY_OPTIONS.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Col>
    {category === "Others" && (
      <Col xs={24} md={12}>
        <Form.Item
          label="Specify Other Category"
          name="otherCategory"
          rules={[{ required: true, message: "Please specify category" }]}
        >
          <Input placeholder="Enter custom category" />
        </Form.Item>
      </Col>
    )}
  </>
);

const LocationField: React.FC<{ form: any }> = ({ form }) => {
  const handleFetchLocation = () => {
    message.loading({ content: "Fetching location...", key: "location" });
    fetchGeolocation(
      (location) => {
        form.setFieldsValue({ location });
        message.success({ content: "📍 Location updated!", key: "location" });
      },
      (error) => {
        message.error({ content: `❌ ${error}`, key: "location" });
      }
    );
  };

  return (
    <Col xs={24}>
      <Form.Item label="Google Location" required style={{ marginBottom: 0 }}>
        <Input.Group compact>
          <Form.Item
            name="location"
            noStyle
            rules={[
              { required: true, message: "Google location is required" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input style={{ width: "calc(100% - 120px)" }} readOnly disabled />
          </Form.Item>
          <Button onClick={handleFetchLocation} icon={<ReloadOutlined />} />
        </Input.Group>
      </Form.Item>
    </Col>
  );
};

export default function DataEntryPage() {
  const [form] = Form.useForm();
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchGeolocation(
      (location) => form.setFieldsValue({ location }),
      (error) => message.warning(error)
    );
  }, [form]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      let photoPath = null;

      if (values.photo?.originFileObj) {
        const file = values.photo.originFileObj;
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const fullPath = `establishments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET_NAME)
          .upload(fullPath, file);

        if (uploadError) throw uploadError;

        photoPath = fullPath;
      }

      const photoUrl = photoPath
        ? supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(photoPath)
            .data?.publicUrl || ""
        : "";

      const dataToSave = {
        establishment_name: values.establishmentName,
        category:
          values.category === "Others"
            ? `Others - ${values.otherCategory}`
            : values.category,
        gm_name: values.gmName || "",
        gm_phone: values.gmPhone || "",
        hk_name: values.hkName || "",
        hk_phone: values.hkPhone || "",
        location: values.location,
        photo_url: photoUrl,
        in_house_laundry: values.inHouseLaundry === "Yes",
        current_laundry: values.currentLaundry || "",
        lead: values.lead === "Yes",
        lead_detail: values.leadDetail || "",
      };

      const { error } = await supabase
        .from(ENTRIES_TABLE_NAME)
        .insert([dataToSave]);

      if (error) throw error;

      messageApi.open({
        type: "success",
        content: "Form submitted successfully!",
      });
      form.resetFields();
    } catch (err: any) {
      console.error("Error during upload or save:", err.message);
      messageApi.open({
        type: "error",
        content: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: 10 }}>
      {contextHolder}
      <h2 className="mb-4">Laundry Survey - Data Entry</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        scrollToFirstError
        initialValues={{ inHouseLaundry: "No", lead: "No" }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Name of Establishment"
              name="establishmentName"
              rules={[{ required: true, message: "This field is required" }]}
            >
              <Input placeholder="Enter name of establishment" />
            </Form.Item>
          </Col>

          <CategoryField
            category={category}
            onCategoryChange={(value) => {
              setCategory(value);
              if (value !== "Others") {
                form.setFieldsValue({ otherCategory: undefined });
              }
            }}
          />

          <Col xs={24} md={12}>
            <Form.Item label="Name of General Manager/Manager" name="gmName">
              <Input placeholder="Enter name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Phone No. of General Manager/Manager"
              name="gmPhone"
              rules={[
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: "Enter valid 10-digit Indian phone number",
                },
              ]}
            >
              <Input type="number" placeholder="Enter phone number" />
            </Form.Item>
          </Col>

          <LocationField form={form} />

          <Col xs={24} md={12}>
            <Form.Item
              label="Photo of Establishment"
              name="photo"
              valuePropName="file"
              getValueFromEvent={(e) => e && e.fileList[0]}
            >
              <Upload
                listType="picture"
                beforeUpload={() => false}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Select Photo</Button>
              </Upload>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="In-House Laundry Present"
              name="inHouseLaundry"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value="Yes">Yes</Radio>
                <Radio value="No">No</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Laundry Service Currently Used"
              name="currentLaundry"
            >
              <Input placeholder="Enter laundry name (if any)" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Lead" name="lead" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value="Yes">Yes</Radio>
                <Radio value="No">No</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              label="Lead Detail"
              name="leadDetail"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (getFieldValue("lead") === "Yes" && !value) {
                      return Promise.reject(
                        new Error("Please enter lead details")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input.TextArea rows={3} placeholder="Provide lead details" />
            </Form.Item>
          </Col>

          <Col xs={24} className="text-end">
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit Form
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
