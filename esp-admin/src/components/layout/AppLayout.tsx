import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { Header as AppHeader } from './Header';
import { Sidebar } from './Sidebar';

const { Content } = Layout;

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <AppHeader collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        <Content
          style={{
            margin: '16px',
            padding: '24px',
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
