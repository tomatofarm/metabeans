import { Layout, Menu, Space, Button, Badge, Dropdown } from 'antd';
import {
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAlertStore } from '../../stores/alertStore';
import { getAccessibleMenus, MENU_ITEMS } from '../../utils/roleHelper';
import RoleBadge from './RoleBadge';

const { Header: AntHeader } = Layout;

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const unreadCount = useAlertStore((s) => s.unreadCount);

  const role = user?.role;
  const accessibleMenus = role ? getAccessibleMenus(role) : [];

  const menuItems = MENU_ITEMS.filter((item) => accessibleMenus.includes(item.key)).map(
    (item) => ({
      key: item.key,
      label: item.label,
    }),
  );

  const currentMenuKey =
    MENU_ITEMS.find((item) => location.pathname.startsWith(item.path))?.key ?? 'dashboard';

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = MENU_ITEMS.find((m) => m.key === key);
    if (item) navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <Space>
          <UserOutlined />
          {user?.name ?? '사용자'}
          {role && <RoleBadge role={role} />}
        </Space>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: (
        <Space>
          <LogoutOutlined />
          로그아웃
        </Space>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap' }}>
          MetaBeans ESP
        </h1>
        <Menu
          mode="horizontal"
          selectedKeys={[currentMenuKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', flex: 1 }}
        />
      </div>

      <Space size="middle">
        <Badge count={unreadCount} size="small">
          <Button type="text" icon={<BellOutlined />} />
        </Badge>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" icon={<UserOutlined />}>
            {user?.name}
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
