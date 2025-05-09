"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FormOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, message, theme } from "antd";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabaseClient";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";
import "./globals.css";
import { ENTRIES_TABLE_NAME } from "../utils/constants";

const { Header, Sider, Content } = Layout;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    if (window) {
      const isMobile = window.innerWidth < 500;
      setCollapsed(isMobile);
    }
  }, []);

  const getMenuKey = () => {
    if (pathname.startsWith("/data-entry")) return "1";
    if (pathname.startsWith("/dashboard")) return "2";
    return "";
  };

  const fetchData = async () => {
    const { data, error } = await supabase.from(ENTRIES_TABLE_NAME).select("*");
    if (error) {
      messageApi.error({
        type: "error",
        content: "Failed to fetch data",
      });
      return [];
    }
    return data;
  };

  const exportExcel = async () => {
    const data = await fetchData();
    if (!data || data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laundry Entries");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Survey_Data.xlsx";
    link.click();
  };

  return (
    <html lang="en">
      <body>
        <Layout style={{ minHeight: "100vh" }}>
          <Sider trigger={null} collapsible collapsed={collapsed}>
            <div
              className={`d-flex align-items-center ${
                collapsed ? "justify-content-center" : "justify-content-start"
              } px-3 text-white fw-bold`}
              style={{ height: 64, fontSize: collapsed ? "1.5rem" : "1.25rem" }}
            >
              🧺 {!collapsed && <span className="ms-2">LaundryApp</span>}
            </div>

            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[getMenuKey()]}
              items={[
                {
                  key: "1",
                  icon: <FormOutlined />,
                  label: (
                    <Link
                      href="/data-entry"
                      className="text-decoration-none text-white"
                    >
                      Data Entry
                    </Link>
                  ),
                },
                {
                  key: "2",
                  icon: <BarChartOutlined />,
                  label: <span className="text-secondary">Dashboard</span>,
                  disabled: true,
                },
              ]}
            />
          </Sider>

          <Layout>
            <Header
              className="d-flex justify-content-between align-items-center px-3"
              style={{ background: colorBgContainer }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                }}
              />

              <Button type="primary" onClick={exportExcel}>
                Export Excel
              </Button>
            </Header>

            <Content
              className="mx-3 my-4 p-4"
              style={{
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </body>
    </html>
  );
}
