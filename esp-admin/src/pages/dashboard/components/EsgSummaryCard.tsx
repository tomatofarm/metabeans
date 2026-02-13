import { Card, Row, Col, Statistic } from 'antd';
import {
  ExperimentOutlined,
  ThunderboltOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import type { EsgSummary } from '../../../types/dashboard.types';

interface EsgSummaryCardProps {
  data?: EsgSummary;
  loading?: boolean;
}

export default function EsgSummaryCard({ data, loading }: EsgSummaryCardProps) {
  return (
    <Card title="ESG 지표 요약" loading={loading}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Statistic
            title="유증기 포집량"
            value={data?.totalOilCollected ?? 0}
            suffix="L"
            prefix={<ExperimentOutlined />}
            precision={1}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="에너지 절감률"
            value={data?.energySavingRate ?? 0}
            suffix="%"
            prefix={<ThunderboltOutlined />}
            precision={1}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="CO2 저감량"
            value={data?.co2Reduction ?? 0}
            suffix="kg"
            prefix={<CloudOutlined />}
            precision={1}
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
      </Row>
    </Card>
  );
}
