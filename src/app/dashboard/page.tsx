"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { Spin, Card, message } from "antd";
import { supabase } from "@/lib/supabaseClient";
import { ENTRIES_TABLE_NAME } from "@/utils/constants";
import "@/src/app/globals.css";

interface ITableEntry {
  establishment_name: string;
  category: string;
  gm_name: string;
  gm_phone: string;
  hk_name: string;
  hk_phone: string;
  location: string;
  photo_url: string;
  in_house_laundry: boolean;
  current_laundry: string;
  lead: boolean;
  lead_detail: string;
  created_by: string;
}

const columnDefs: ColDef[] = [
  {
    headerName: "Establishment",
    field: "establishment_name",
    sortable: true,
    filter: true,
  },
  {
    headerName: "Category",
    field: "category",
    sortable: true,
    filter: true,
  },
  { headerName: "GM Name", field: "gm_name", sortable: true, filter: true },
  {
    headerName: "GM Phone",
    field: "gm_phone",
    sortable: true,
    filter: true,
  },
  { headerName: "HK Name", field: "hk_name", sortable: true, filter: true },
  {
    headerName: "HK Phone",
    field: "hk_phone",
    sortable: true,
    filter: true,
  },
  {
    headerName: "Location",
    field: "location",
    sortable: true,
    filter: true,
    cellRenderer: (params: any) =>
      params.value ? (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          {params.value}
        </a>
      ) : (
        <span style={{ color: "#aaa", fontStyle: "italic" }}>No Location</span>
      ),
  },
  {
    headerName: "Photo",
    field: "photo_url",
    cellRenderer: (params: any) =>
      params.value ? (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          <img
            src={params.value}
            alt="Photo"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />
        </a>
      ) : (
        <span style={{ color: "#aaa", fontStyle: "italic" }}>No Photo</span>
      ),
  },
  {
    headerName: "In House Laundry",
    field: "in_house_laundry",
    sortable: true,
    filter: true,
    cellRenderer: (params: any) =>
      params.value ? (
        <span style={{ color: "green", fontWeight: 500 }}>✅ Yes</span>
      ) : (
        <span style={{ color: "red", fontWeight: 500 }}>❌ No</span>
      ),
  },
  {
    headerName: "Lead",
    field: "lead",
    sortable: true,
    filter: true,
    cellRenderer: (params: any) =>
      params.value ? (
        <span style={{ color: "green", fontWeight: 500 }}>✅ Yes</span>
      ) : (
        <span style={{ color: "red", fontWeight: 500 }}>❌ No</span>
      ),
  },

  {
    headerName: "Current Laundry",
    field: "current_laundry",
    sortable: true,
    filter: true,
  },
  {
    headerName: "Lead Detail",
    field: "lead_detail",
    sortable: true,
    filter: true,
  },
  {
    headerName: "Created By",
    field: "created_by",
    sortable: true,
    filter: true,
  },
];

const Dashboard: React.FC = () => {
  const [rowData, setRowData] = useState<ITableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from(ENTRIES_TABLE_NAME)
        .select("*");

      if (error) {
        messageApi.open({
        type: "error",
        content: "Something went wrong. Please try again.",
      });
      } else {
        setRowData(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ marginBottom: 24, fontWeight: 600, fontSize: "24px" }}>
        📊 Dashboard
      </h2>

      <Spin spinning={loading} tip="Loading data..." size="large">
        <Card
          variant="outlined"
          className="shadow-lg"
          style={{
            borderRadius: 16,
            backgroundColor: "#fff",
            padding: 16,
          }}
        >
          <div className="ag-theme-alpine" style={{ height: 500 }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              sideBar={{
                toolPanels: ["columns", "filters"],
                defaultToolPanel: "filters",
              }}
            />
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default Dashboard;
