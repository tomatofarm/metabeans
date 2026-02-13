import { Typography, Card } from 'antd';

export default function CustomerPage() {
  return (
    <div>
      <Typography.Title level={4}>고객 현황</Typography.Title>
      <Card>
        <Typography.Text type="secondary">
          고객 목록, 지도, 편집 화면은 Phase 1 순서 11에서 구현됩니다.
        </Typography.Text>
      </Card>
    </div>
  );
}
