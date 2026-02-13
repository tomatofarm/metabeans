import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Dropdown, Space, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
  DashboardOutlined,
  ToolOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuthStore } from '@/stores/authStore';
import { useAlertStore } from '@/stores/alertStore';
import { useLogout } from '@/api/auth.api';
import { getAccessibleMenus, MENU_LABELS, MENU_PATHS } from '@/utils/roleHelper';
import type { MenuKey } from '@/utils/roleHelper';
import { RoleBadge } from './RoleBadge';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const MENU_ICONS: Record<MenuKey, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  equipment: <ToolOutlined />,
  'as-service': <CustomerServiceOutlined />,
  customer: <TeamOutlined />,
  system: <SettingOutlined />,
};

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Header({ collapsed, onToggleCollapse }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout: clearAuth } = useAuthStore();
  const { unreadCount } = useAlertStore();
  const logoutMutation = useLogout();

  const menus = role ? getAccessibleMenus(role) : [];

  const menuItems: MenuProps['items'] = menus.map((key) => ({
    key,
    icon: MENU_ICONS[key],
    label: MENU_LABELS[key],
  }));

  const selectedKey = menus.find((key) => location.pathname.startsWith(MENU_PATHS[key]));

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(MENU_PATHS[key as MenuKey]);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        navigate('/login');
      },
    });
  };

  const handlePasswordChange = () => {
    navigate('/password-change');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'password',
      icon: <LockOutlined />,
      label: '비밀번호 변경',
      onClick: handlePasswordChange,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        {collapsed ? (
          <MenuUnfoldOutlined
            onClick={onToggleCollapse}
            style={{ fontSize: 18, cursor: 'pointer', marginRight: 16 }}
          />
        ) : (
          <MenuFoldOutlined
            onClick={onToggleCollapse}
            style={{ fontSize: 18, cursor: 'pointer', marginRight: 16 }}
          />
        )}
        <Menu
          mode="horizontal"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: 1, border: 'none' }}
        />
      </div>
      <Space size="middle">
        {user && <RoleBadge role={user.role} />}
        <Badge count={unreadCount} size="small">
          <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
        </Badge>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <UserOutlined />
            <Text>{user?.name ?? '사용자'}</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}

export default Header;
