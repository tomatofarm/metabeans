import { Card, Statistic, Row, Col } from 'antd';
import type { GatewaySensorData } from '../../types/sensor.types';
import { getIAQLevel } from '../../utils/statusHelper';
import { getStatusConfig } from '../../utils/statusHelper';

interface AirQualityCardProps {
  data?: GatewaySensorData | null;
}

export default function AirQualityCard({ data }: AirQualityCardProps) {
  if (!data) {
    return <Card title="실내공기질 (IAQ)">데이터 없음</Card>;
  }

  const items = [
    { label: 'PM2.5', value: data.pm25, unit: 'µg/m³', key: 'pm25' as const },
    { label: 'PM10', value: data.pm100, unit: 'µg/m³', key: 'pm10' as const },
    { label: 'CO2', value: data.co2, unit: 'ppm', key: 'co2' as const },
    { label: 'HCHO', value: data.hcho, unit: 'ppb', key: 'hcho' as const },
    { label: 'CO', value: data.co, unit: 'ppm', key: 'co' as const },
  ];

  return (
    <Card title="실내공기질 (IAQ)" size="small">
      <Row gutter={[16, 8]}>
        {items.map((item) => {
          const level = getIAQLevel(item.key, item.value);
          const config = getStatusConfig(level);
          return (
            <Col span={8} key={item.label}>
              <Statistic
                title={item.label}
                value={item.value}
                suffix={item.unit}
                valueStyle={{ color: config.color, fontSize: 16 }}
              />
            </Col>
          );
        })}
      </Row>
    </Card>
  );
}
