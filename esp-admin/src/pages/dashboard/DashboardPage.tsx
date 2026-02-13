import { Typography, Card, Row, Col, Statistic } from 'antd';
import {
  ShopOutlined,
  AlertOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

export default function DashboardPage() {
  return (
    <div>
      <Typography.Title level={4}>대시보드</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="전체 매장" value={3} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="정상 운영"
              value={2}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="주의"
              value={1}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="긴급 알람"
              value={0}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 16 }}>
        <Typography.Text type="secondary">
          대시보드 상세 화면은 Phase 1 순서 3~4에서 구현됩니다.
        </Typography.Text>
      </Card>
    </div>
  );
}
