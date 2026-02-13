import { Typography, Card } from 'antd';

export default function EquipmentPage() {
  return (
    <div>
      <Typography.Title level={4}>장비관리</Typography.Title>
      <Card>
        <Typography.Text type="secondary">
          장비 정보, 실시간 모니터링, 장치 제어, 이력 조회 화면은 Phase 1 순서 5~8에서 구현됩니다.
        </Typography.Text>
      </Card>
    </div>
  );
}
