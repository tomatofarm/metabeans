import React from 'react';
import { Layout, Space, Dropdown, Typography } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../api/auth.api';
import RoleBadge from './RoleBadge';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout: clearAuth } = useAuthStore();
  const logoutMutation = useLogout();

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

  const dropdownItems: MenuProps['items'] = [
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
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
        height: 64,
      }}
    >
      <Text strong style={{ fontSize: 18 }}>
        MetaBeans ESP 관제시스템
      </Text>
      {user && (
        <Space size="middle">
          <RoleBadge role={user.role} />
          <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <UserOutlined />
              <Text>{user.name}</Text>
            </Space>
          </Dropdown>
        </Space>
      )}
    </AntHeader>
  );
};

export default Header;
