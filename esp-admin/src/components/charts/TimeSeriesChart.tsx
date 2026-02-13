import { Card } from 'antd';

/**
 * 범용 시계열 차트 (스켈레톤 - 상세 구현은 모니터링 화면에서)
 * 확대/축소(dataZoom) 지원 예정
 */
export default function TimeSeriesChart() {
  return (
    <Card title="시계열 데이터" size="small">
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        차트 영역 (ECharts + dataZoom)
      </div>
    </Card>
  );
}
