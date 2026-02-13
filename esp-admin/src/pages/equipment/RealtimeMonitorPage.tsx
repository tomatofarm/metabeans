import { useRef, useMemo } from 'react';
import { Card, Spin, Empty, Typography, Row, Col, Divider, Tag } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useUiStore } from '../../stores/uiStore';
import { useRealtimeSensorData, useSensorHistory } from '../../api/monitoring.api';
import { SENSOR_INTERVAL_MS } from '../../utils/constants';
import type { StatusLevel } from '../../utils/constants';
import { getFilterCheckLevel } from '../../utils/statusHelper';
import EquipmentSensorSummary from './components/EquipmentSensorSummary';
import ControllerSensorCard from './components/ControllerSensorCard';
import BoardTempChart from '../../components/charts/BoardTempChart';
import SparkChart from '../../components/charts/SparkChart';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import type { TimeSeriesLine } from '../../components/charts/TimeSeriesChart';

const { Text } = Typography;

const CONTROLLER_COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#722ed1'];

export default function RealtimeMonitorPage() {
  const selectedEquipmentId = useUiStore((s) => s.selectedEquipmentId);
  const { data: realtimeData, isLoading, dataUpdatedAt } = useRealtimeSensorData(selectedEquipmentId);
  const { data: historyData } = useSensorHistory(selectedEquipmentId);

  // 이전 필터 상태를 추적 (필터 점검 상태 변경 알림용)
  const prevFilterStatusRef = useRef<Record<number, StatusLevel>>({});

  // 현재 필터 상태 업데이트 및 이전 상태 가져오기
  const prevFilterStatuses = useMemo(() => {
    if (!realtimeData) return {};
    const prev = { ...prevFilterStatusRef.current };
    const next: Record<number, StatusLevel> = {};
    for (const ctrl of realtimeData.controllers) {
      next[ctrl.controllerId] = getFilterCheckLevel(ctrl.sensorData.diffPressure);
    }
    prevFilterStatusRef.current = next;
    return prev;
  }, [realtimeData]);

  // 시계열 차트용 라인 데이터 (PM2.5, 유입온도, 풍량)
  const pm25Lines: TimeSeriesLine[] = useMemo(() => {
    if (!historyData) return [];
    const grouped = new Map<string, { timestamp: number; value: number }[]>();
    for (const point of historyData) {
      if (!grouped.has(point.controllerName)) grouped.set(point.controllerName, []);
      grouped.get(point.controllerName)!.push({ timestamp: point.timestamp, value: point.pm25 });
    }
    return Array.from(grouped.entries()).map(([name, data], idx) => ({
      name,
      data,
      color: CONTROLLER_COLORS[idx % CONTROLLER_COLORS.length],
    }));
  }, [historyData]);

  const inletTempLines: TimeSeriesLine[] = useMemo(() => {
    if (!historyData) return [];
    const grouped = new Map<string, { timestamp: number; value: number }[]>();
    for (const point of historyData) {
      if (!grouped.has(point.controllerName)) grouped.set(point.controllerName, []);
      grouped.get(point.controllerName)!.push({ timestamp: point.timestamp, value: point.inletTemp });
    }
    return Array.from(grouped.entries()).map(([name, data], idx) => ({
      name,
      data,
      color: CONTROLLER_COLORS[idx % CONTROLLER_COLORS.length],
    }));
  }, [historyData]);

  const flowLines: TimeSeriesLine[] = useMemo(() => {
    if (!historyData) return [];
    const grouped = new Map<string, { timestamp: number; value: number }[]>();
    for (const point of historyData) {
      if (!grouped.has(point.controllerName)) grouped.set(point.controllerName, []);
      grouped.get(point.controllerName)!.push({ timestamp: point.timestamp, value: point.flow });
    }
    return Array.from(grouped.entries()).map(([name, data], idx) => ({
      name,
      data,
      color: CONTROLLER_COLORS[idx % CONTROLLER_COLORS.length],
    }));
  }, [historyData]);

  if (!selectedEquipmentId) {
    return <Empty description="좌측 트리에서 장비를 선택하세요" />;
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">센서 데이터를 불러오는 중...</Text>
        </div>
      </div>
    );
  }

  if (!realtimeData) {
    return <Empty description="센서 데이터가 없습니다" />;
  }

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('ko-KR') : '-';

  return (
    <div>
      {/* 헤더: 갱신 주기 안내 */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        <Tag icon={<SyncOutlined spin />} color="processing">
          {SENSOR_INTERVAL_MS / 1000}초 자동 갱신
        </Tag>
        <Text type="secondary" style={{ fontSize: 12 }}>
          마지막 갱신: {lastUpdated}
        </Text>
      </div>

      {/* 장비 요약 */}
      <EquipmentSensorSummary data={realtimeData} />

      {/* 파워팩별 센서 데이터 카드 */}
      <Divider orientation="left" style={{ fontSize: 14, margin: '16px 0 12px' }}>
        파워팩별 센서 데이터
      </Divider>
      {realtimeData.controllers.map((ctrl) => (
        <ControllerSensorCard
          key={ctrl.controllerId}
          controller={ctrl}
          previousFilterStatus={prevFilterStatuses[ctrl.controllerId]}
        />
      ))}

      {/* 시계열 차트 영역 */}
      <Divider orientation="left" style={{ fontSize: 14, margin: '16px 0 12px' }}>
        센서 추이 차트
      </Divider>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <BoardTempChart historyData={historyData ?? []} />
        </Col>
        <Col span={12}>
          <SparkChart historyData={historyData ?? []} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card size="small">
            <TimeSeriesChart
              title="PM2.5 추이"
              lines={pm25Lines}
              yAxisName="µg/m³"
              warningZones={[
                { min: 35, max: 50, color: 'rgba(250,173,20,0.08)' },
                { min: 50, max: 100, color: 'rgba(255,77,79,0.08)' },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small">
            <TimeSeriesChart
              title="유입 온도 추이"
              lines={inletTempLines}
              yAxisName="°C"
              warningZones={[
                { min: 70, max: 100, color: 'rgba(250,173,20,0.08)' },
                { min: 100, max: 150, color: 'rgba(255,77,79,0.08)' },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card size="small">
            <TimeSeriesChart
              title="풍량 추이"
              lines={flowLines}
              yAxisName="CMH"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
