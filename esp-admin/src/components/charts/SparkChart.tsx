import { Card } from 'antd';

/**
 * 스파크 산점도 차트 (스켈레톤 - 상세 구현은 모니터링 화면에서)
 */
export default function SparkChart() {
  return (
    <Card title="스파크 발생 현황" size="small">
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        차트 영역 (ECharts)
      </div>
    </Card>
  );
}
