import { Card } from 'antd';

/**
 * 보드온도 라인차트 (스켈레톤 - 상세 구현은 모니터링 화면에서)
 */
export default function BoardTempChart() {
  return (
    <Card title="보드 온도 추이" size="small">
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        차트 영역 (ECharts)
      </div>
    </Card>
  );
}
