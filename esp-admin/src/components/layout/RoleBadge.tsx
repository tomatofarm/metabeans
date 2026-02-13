import React from 'react';
import { Tag } from 'antd';
import type { UserRole } from '../../types/auth.types';
import { getRoleLabel } from '../../utils/roleHelper';

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'purple',
  DEALER: 'blue',
  HQ: 'green',
  OWNER: 'orange',
};

interface RoleBadgeProps {
  role: UserRole;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return (
    <Tag color={ROLE_COLORS[role]}>
      {getRoleLabel(role)}
    </Tag>
  );
};

export default RoleBadge;
