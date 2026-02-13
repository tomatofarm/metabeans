import { Typography, Card } from 'antd';

export default function SystemPage() {
  return (
    <div>
      <Typography.Title level={4}>시스템 관리</Typography.Title>
      <Card>
        <Typography.Text type="secondary">
          권한, 승인, 사용자, 기준수치 관리 화면은 Phase 1 순서 12에서 구현됩니다.
        </Typography.Text>
      </Card>
    </div>
  );
}
