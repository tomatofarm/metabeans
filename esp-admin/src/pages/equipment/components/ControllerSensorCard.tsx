import { Card, Row, Col, Tag, Typography, Alert, Descriptions } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { RealtimeControllerData } from '../../../types/sensor.types';
import type { StatusLevel } from '../../../utils/constants';
import { FAN_SPEED_LABELS } from '../../../utils/constants';
import {
  getConnectionStatusFromEpoch,
  getPowerStatus,
  getBoardTempLevel,
  getSparkLevel,
  getPM25Level,
  getPM10Level,
  getFilterCheckLevel,
  getInletTempLevel,
  getStatusConfig,
  propagateStatus,
  FILTER_CHECK_MESSAGE,
} from '../../../utils/statusHelper';
import {
  formatTemp,
  formatFlow,
  formatVelocity,
  formatPressure,
  formatNumber,
} from '../../../utils/formatters';

const { Text } = Typography;

interface ControllerSensorCardProps {
  controller: RealtimeControllerData;
  previousFilterStatus?: StatusLevel;
}

function StatusDot({ level }: { level: StatusLevel }) {
  const config = getStatusConfig(level);
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: config.color,
        marginRight: 6,
      }}
    />
  );
}

function SensorItem({
  label,
  value,
  level,
  suffix,
}: {
  label: string;
  value: string | number;
  level?: StatusLevel;
  suffix?: string;
}) {
  const config = level ? getStatusConfig(level) : null;
  return (
    <div style={{ textAlign: 'center', padding: '8px 4px' }}>
      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
        {label}
      </Text>
      <div style={{ fontSize: 18, fontWeight: 600, color: config?.color ?? '#262626' }}>
        {value}
      </div>
      {suffix && (
        <Text type="secondary" style={{ fontSize: 10 }}>
          {suffix}
        </Text>
      )}
    </div>
  );
}

export default function ControllerSensorCard({
  controller,
  previousFilterStatus,
}: ControllerSensorCardProps) {
  const { sensorData: sd, controllerName } = controller;

  // 상태 판정
  const connectionLevel = getConnectionStatusFromEpoch(sd.timestamp);
  const powerLevel = getPowerStatus(sd.ppPower);
  const boardTempLevel = getBoardTempLevel(sd.ppTemp);
  const sparkLevel = getSparkLevel(sd.ppSpark);
  const pm25Level = getPM25Level(sd.pm25);
  const pm10Level = getPM10Level(sd.pm10);
  const filterLevel = getFilterCheckLevel(sd.diffPressure);
  const inletTempLevel = getInletTempLevel(sd.inletTemp);

  // 전체 컨트롤러 상태 (상태 전파)
  const overallStatus = propagateStatus([
    connectionLevel,
    powerLevel,
    boardTempLevel,
    sparkLevel,
    pm25Level,
    pm10Level,
    filterLevel,
    inletTempLevel,
  ]);
  const overallConfig = getStatusConfig(overallStatus);

  // 필터 상태 변경 알림 (정상 → 점검 필요)
  const showFilterAlert = previousFilterStatus === 'green' && filterLevel === 'yellow';

  // 폐유 수집량 (유증기 포집량 × 2, 임시 랜덤)
  const oilCollection = parseFloat((sd.oilLevel * 2).toFixed(1));

  return (
    <Card
      size="small"
      title={
        <span>
          <ThunderboltOutlined style={{ marginRight: 6 }} />
          {controllerName}
        </span>
      }
      extra={
        <Tag color={overallConfig.color}>{overallConfig.label}</Tag>
      }
      style={{ marginBottom: 16 }}
    >
      {showFilterAlert && (
        <Alert
          type="warning"
          message={FILTER_CHECK_MESSAGE}
          showIcon
          closable
          style={{ marginBottom: 12 }}
        />
      )}

      {/* 연결/전원 상태 + 제어 모드 */}
      <Descriptions size="small" column={4} style={{ marginBottom: 12 }}>
        <Descriptions.Item label="연결 상태">
          {connectionLevel === 'green' ? (
            <Tag icon={<CheckCircleOutlined />} color="success">연결</Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="error">끊김</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="전원 상태">
          {powerLevel === 'green' ? (
            <Tag color="success">ON</Tag>
          ) : (
            <Tag color="error">OFF</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="팬 모드">
          <Tag icon={<SettingOutlined />} color={sd.fanMode === 1 ? 'blue' : 'default'}>
            {sd.fanMode === 1 ? '자동' : '수동'}
            {sd.fanMode === 0 && ` (${FAN_SPEED_LABELS[sd.fanSpeed] ?? 'OFF'})`}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="댐퍼 모드">
          <Tag icon={<SettingOutlined />} color={sd.damperMode === 1 ? 'blue' : 'default'}>
            {sd.damperMode === 1 ? '자동' : '수동'}
            {sd.damperMode === 0 && ` (${formatNumber(sd.damper, 1)}%)`}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      {/* 센서 데이터 그리드 */}
      <Row gutter={[8, 8]}>
        {/* 상태 색상 있는 항목 */}
        <Col span={4}>
          <SensorItem label="보드 온도" value={formatTemp(sd.ppTemp, 0)} level={boardTempLevel} />
        </Col>
        <Col span={4}>
          <SensorItem label="스파크" value={sd.ppSpark} level={sparkLevel} />
        </Col>
        <Col span={4}>
          <SensorItem label="PM2.5" value={formatNumber(sd.pm25, 1)} level={pm25Level} suffix="µg/m³" />
        </Col>
        <Col span={4}>
          <SensorItem label="PM10" value={formatNumber(sd.pm10, 1)} level={pm10Level} suffix="µg/m³" />
        </Col>
        <Col span={4}>
          <SensorItem
            label="필터 점검"
            value={filterLevel === 'green' ? '정상' : '점검 필요'}
            level={filterLevel}
            suffix={`${formatNumber(sd.diffPressure, 1)} Pa`}
          />
        </Col>
        <Col span={4}>
          <SensorItem label="유입 온도" value={formatTemp(sd.inletTemp, 1)} level={inletTempLevel} />
        </Col>

        {/* 수치만 표시 (색상 없음) — 순서: 유입온도 → 풍량 → 풍속 → 덕트 차압 */}
        <Col span={4}>
          <SensorItem label="풍량" value={formatFlow(sd.flow)} />
        </Col>
        <Col span={4}>
          <SensorItem label="풍속" value={formatVelocity(sd.velocity)} />
        </Col>
        <Col span={4}>
          <SensorItem label="덕트 차압" value={formatPressure(sd.ductDp)} />
        </Col>
        <Col span={4}>
          <SensorItem label="폐유 수집량" value={`${oilCollection} L`} />
        </Col>
      </Row>
    </Card>
  );
}
