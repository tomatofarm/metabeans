import { Card, Progress, Typography } from 'antd';
import { STATUS_COLORS } from '@/utils/constants';
import type { StatusLevel } from '@/utils/constants';

const { Text } = Typography;

interface SensorGaugeProps {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max: number;
  status: StatusLevel;
}

const STATUS_STROKE: Record<StatusLevel, string> = {
  green: STATUS_COLORS.GOOD.color,
  yellow: STATUS_COLORS.WARNING.color,
  red: STATUS_COLORS.DANGER.color,
};

export function SensorGauge({ label, value, unit, min = 0, max, status }: SensorGaugeProps) {
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <Card size="small" style={{ textAlign: 'center' }}>
      <Progress
        type="dashboard"
        percent={percent}
        strokeColor={STATUS_STROKE[status]}
        format={() => (
          <span>
            <Text strong style={{ fontSize: 18 }}>
              {value}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {unit}
            </Text>
          </span>
        )}
        size={120}
      />
      <div style={{ marginTop: 8 }}>
        <Text>{label}</Text>
      </div>
    </Card>
  );
}
