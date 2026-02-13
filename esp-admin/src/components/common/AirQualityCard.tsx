import { Card, Row, Col, Statistic } from 'antd';
import type { IAQData } from '@/types/sensor.types';
import { getIAQStatus } from '@/utils/statusHelper';
import { STATUS_COLORS } from '@/utils/constants';

interface AirQualityCardProps {
  data: IAQData | null;
  title?: string;
}

const IAQ_ITEMS: {
  key: keyof IAQData;
  label: string;
  unit: string;
  hasThreshold: boolean;
  thresholdKey?: 'pm2_5' | 'pm10' | 'co2' | 'hcho' | 'co';
}[] = [
  { key: 'pm2_5', label: 'PM2.5', unit: 'µg/m³', hasThreshold: true, thresholdKey: 'pm2_5' },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³', hasThreshold: true, thresholdKey: 'pm10' },
  { key: 'co2', label: 'CO₂', unit: 'ppm', hasThreshold: true, thresholdKey: 'co2' },
  { key: 'hcho', label: 'HCHO', unit: 'ppb', hasThreshold: true, thresholdKey: 'hcho' },
  { key: 'co', label: 'CO', unit: 'ppm', hasThreshold: true, thresholdKey: 'co' },
  { key: 'temperature', label: '온도', unit: '°C', hasThreshold: false },
  { key: 'humidity', label: '습도', unit: '%', hasThreshold: false },
  { key: 'vocIndex', label: 'VOC', unit: '', hasThreshold: false },
];

export function AirQualityCard({ data, title = '실내공기질 (IAQ)' }: AirQualityCardProps) {
  return (
    <Card title={title} size="small">
      <Row gutter={[16, 16]}>
        {IAQ_ITEMS.map((item) => {
          const value = data ? data[item.key] : null;
          const status =
            item.hasThreshold && item.thresholdKey && value != null
              ? getIAQStatus(item.thresholdKey, value as number)
              : null;
          const colorConfig = status
            ? status === 'red'
              ? STATUS_COLORS.DANGER
              : status === 'yellow'
                ? STATUS_COLORS.WARNING
                : STATUS_COLORS.GOOD
            : null;

          return (
            <Col span={6} key={item.key}>
              <Statistic
                title={item.label}
                value={value ?? '-'}
                suffix={value != null ? item.unit : ''}
                valueStyle={colorConfig ? { color: colorConfig.color, fontSize: 16 } : { fontSize: 16 }}
              />
            </Col>
          );
        })}
      </Row>
    </Card>
  );
}
