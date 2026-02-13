import { Tag } from 'antd';
import type { StatusLevel } from '../../utils/constants';
import { getStatusConfig } from '../../utils/statusHelper';

interface StatusTagProps {
  level: StatusLevel;
  label?: string;
}

export default function StatusTag({ level, label }: StatusTagProps) {
  const config = getStatusConfig(level);
  return <Tag color={config.color}>{label ?? config.label}</Tag>;
}
