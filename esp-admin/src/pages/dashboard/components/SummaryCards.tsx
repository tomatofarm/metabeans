import { Row, Col, Card, Statistic } from 'antd';
import {
  ShopOutlined,
  DesktopOutlined,
  ToolOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import type { DashboardSummary } from '../../../types/dashboard.types';

interface SummaryCardsProps {
  data?: DashboardSummary;
  loading?: boolean;
}

export default function SummaryCards({ data, loading }: SummaryCardsProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="전체 매장"
            value={data?.totalStores ?? 0}
            prefix={<ShopOutlined />}
            suffix={
              <span style={{ fontSize: 14, color: '#52c41a' }}>
                / 활성 {data?.activeStores ?? 0}
              </span>
            }
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="전체 장비"
            value={data?.totalEquipments ?? 0}
            prefix={<DesktopOutlined />}
            suffix={
              <span style={{ fontSize: 14, color: '#52c41a' }}>
                / 정상 {data?.normalEquipments ?? 0}
              </span>
            }
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="A/S 요청 (미처리)"
            value={data?.pendingAsRequests ?? 0}
            prefix={<ToolOutlined />}
            valueStyle={{ color: data?.pendingAsRequests ? '#faad14' : undefined }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="긴급 알람"
            value={data?.emergencyAlarms ?? 0}
            prefix={<AlertOutlined />}
            valueStyle={{ color: data?.emergencyAlarms ? '#ff4d4f' : '#52c41a' }}
          />
        </Card>
      </Col>
    </Row>
  );
}
