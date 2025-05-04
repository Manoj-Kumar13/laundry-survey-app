'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuFoldOutlined, MenuUnfoldOutlined, FormOutlined, BarChartOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, message, theme } from 'antd';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/reset.css';
import './globals.css';
import { ENTRIES_TABLE_NAME } from '../utils/constants';

const { Header, Sider, Content } = Layout;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const getMenuKey = () => {
    if (pathname.startsWith('/data-entry')) return '1';
    if (pathname.startsWith('/dashboard')) return '2';
    return '';
  };

  const fetchData = async () => {
    const { data, error } = await supabase.from(ENTRIES_TABLE_NAME).select('*');
    if (error) {
      messageApi.error({
        type: 'error',
        content: 'Failed to fetch data',
      });
      return [];
    }
    return data;
  };

  // Export data as Excel
  const exportExcel = async () => {
    const data = await fetchData();
    if (!data || data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laundry Entries');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Survey_Data.xlsx';
    link.click();
  };

  return (
    <html lang="en">
      <body>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider trigger={null} collapsible collapsed={collapsed}>
            {/* 👇 Logo & App Title */}
            <div
              style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: '0 16px',
                fontSize: collapsed ? '1.5rem' : '1.25rem',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              🧺{!collapsed && <span style={{ marginLeft: 10 }}>LaundryApp</span>}
            </div>

            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[getMenuKey()]}
              items={[
                {
                  key: '1',
                  icon: <FormOutlined />,
                  label: <Link href="/data-entry">Data Entry</Link>,
                },
                {
                  key: '2',
                  icon: <BarChartOutlined />,
                  label: <span style={{ color: 'gray' }}>Dashboard</span>,
                  disabled: true,
                },
              ]}
            />

            {/* Export Button in Sidebar */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Button
                onClick={exportExcel}
                type="primary"
                style={{
                  marginTop: 16,
                  width: '100%',
                }}
              >
                Export Excel
              </Button>
            </div>
          </Sider>

          <Layout>
            <Header style={{ padding: 0, background: colorBgContainer }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
            </Header>

            <Content
              style={{
                margin: '24px 16px',
                padding: 24,
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
