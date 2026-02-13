import { Typography, Card } from 'antd';

export default function ASServicePage() {
  return (
    <div>
      <Typography.Title level={4}>A/S 관리</Typography.Title>
      <Card>
        <Typography.Text type="secondary">
          알림 현황, 신청, 처리 현황, 보고서 화면은 Phase 1 순서 9~10에서 구현됩니다.
        </Typography.Text>
      </Card>
    </div>
  );
}
