import { Card, Row, Col, Statistic, Tag, Typography } from 'antd';
import {
  ApiOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  FireOutlined,
} from '@ant-design/icons';
import type { RealtimeMonitoringData } from '../../../types/sensor.types';
import {
  getConnectionStatusFromEpoch,
  propagateStatus,
  getBoardTempLevel,
  getSparkLevel,
  getPM25Level,
  getInletTempLevel,
  getStatusConfig,
} from '../../../utils/statusHelper';
import type { StatusLevel } from '../../../utils/constants';

const { Text } = Typography;

interface EquipmentSensorSummaryProps {
  data: RealtimeMonitoringData;
}

export default function EquipmentSensorSummary({ data }: EquipmentSensorSummaryProps) {
  const controllers = data.controllers;

  // 연결 상태 집계
  const onlineCount = controllers.filter(
    (c) => getConnectionStatusFromEpoch(c.sensorData.timestamp) === 'green',
  ).length;
  const totalCount = controllers.length;

  // 각 컨트롤러의 상태 레벨 계산 후 전파
  const controllerStatuses: StatusLevel[] = controllers.map((c) => {
    const sd = c.sensorData;
    return propagateStatus([
      getConnectionStatusFromEpoch(sd.timestamp),
      sd.ppPower === 1 ? 'green' : 'red',
      getBoardTempLevel(sd.ppTemp),
      getSparkLevel(sd.ppSpark),
      getPM25Level(sd.pm25),
      getInletTempLevel(sd.inletTemp),
    ]);
  });
  const equipmentStatus = propagateStatus(controllerStatuses);
  const statusConfig = getStatusConfig(equipmentStatus);

  // 최고/평균 센서값
  const maxPpTemp = Math.max(...controllers.map((c) => c.sensorData.ppTemp));
  const maxSpark = Math.max(...controllers.map((c) => c.sensorData.ppSpark));
  const avgPm25 =
    controllers.reduce((sum, c) => sum + c.sensorData.pm25, 0) / (controllers.length || 1);
  const maxInletTemp = Math.max(...controllers.map((c) => c.sensorData.inletTemp));

  return (
    <Card
      size="small"
      title={
        <span>
          <DashboardOutlined style={{ marginRight: 6 }} />
          장비 요약 — {data.equipmentName}
        </span>
      }
      extra={
        <Tag color={statusConfig.color} style={{ fontSize: 13 }}>
          {statusConfig.label}
        </Tag>
      }
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 8]}>
        <Col span={4}>
          <Statistic
            title={<Text type="secondary"><ApiOutlined /> 연결 상태</Text>}
            value={`${onlineCount} / ${totalCount}`}
            suffix="대"
            valueStyle={{ color: onlineCount === totalCount ? '#52c41a' : '#ff4d4f', fontSize: 20 }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title={<Text type="secondary"><ThunderboltOutlined /> 최고 보드온도</Text>}
            value={maxPpTemp}
            suffix="°C"
            valueStyle={{
              color: getStatusConfig(getBoardTempLevel(maxPpTemp)).color,
              fontSize: 20,
            }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title={<Text type="secondary"><ThunderboltOutlined /> 최고 스파크</Text>}
            value={maxSpark}
            valueStyle={{
              color: getStatusConfig(getSparkLevel(maxSpark)).color,
              fontSize: 20,
            }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title={<Text type="secondary">PM2.5 평균</Text>}
            value={avgPm25.toFixed(1)}
            suffix="µg/m³"
            valueStyle={{
              color: getStatusConfig(getPM25Level(avgPm25)).color,
              fontSize: 20,
            }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title={<Text type="secondary"><FireOutlined /> 최고 유입온도</Text>}
            value={maxInletTemp.toFixed(1)}
            suffix="°C"
            valueStyle={{
              color: getStatusConfig(getInletTempLevel(maxInletTemp)).color,
              fontSize: 20,
            }}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title={<Text type="secondary">매장</Text>}
            value={data.storeName}
            valueStyle={{ fontSize: 16, color: '#595959' }}
          />
        </Col>
      </Row>
    </Card>
  );
}
