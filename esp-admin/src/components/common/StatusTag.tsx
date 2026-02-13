import { Tag } from 'antd';
import { STATUS_COLORS } from '@/utils/constants';
import type { StatusLevel } from '@/utils/constants';

const LEVEL_MAP: Record<StatusLevel, (typeof STATUS_COLORS)[keyof typeof STATUS_COLORS]> = {
  green: STATUS_COLORS.GOOD,
  yellow: STATUS_COLORS.WARNING,
  red: STATUS_COLORS.DANGER,
};

interface StatusTagProps {
  status: StatusLevel;
  text?: string;
}

export function StatusTag({ status, text }: StatusTagProps) {
  const config = LEVEL_MAP[status];
  return <Tag color={config.color}>{text ?? config.label}</Tag>;
}
