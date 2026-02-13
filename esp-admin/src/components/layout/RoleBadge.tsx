import { Tag } from 'antd';
import type { UserRole } from '@/types/auth.types';
import { ROLE_LABELS } from '@/utils/constants';

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'red',
  DEALER: 'blue',
  HQ: 'green',
  OWNER: 'orange',
};

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <Tag color={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</Tag>;
}
