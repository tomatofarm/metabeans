import { Layout, Typography } from 'antd';
import { StoreTree } from '@/components/common/StoreTree';

const { Sider } = Layout;
const { Title } = Typography;

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      collapsedWidth={0}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        overflow: 'auto',
      }}
      breakpoint="lg"
    >
      {!collapsed && (
        <>
          <div style={{ padding: '16px 16px 8px' }}>
            <Title level={5} style={{ margin: 0 }}>
              매장 · 장비
            </Title>
          </div>
          <StoreTree />
        </>
      )}
    </Sider>
  );
}
