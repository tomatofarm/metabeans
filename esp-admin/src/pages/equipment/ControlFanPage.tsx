import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Card, Button, Tag, Table, Space, Alert, Spin, Empty, Typography,
  Row, Col, InputNumber, Switch, Descriptions, Divider, Radio, message,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined, SwapOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useUiStore } from '../../stores/uiStore';
import { useRealtimeSensorData } from '../../api/monitoring.api';
import { useSendControlCommand, useControlHistory } from '../../api/control.api';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { FAN_ACTIONS, FAN_ACTION_LABELS, CONTROL_TARGET_LABELS } from '../../types/control.types';
import type { ControlCommand, ControlTarget } from '../../types/control.types';
import { FAN_SPEED_LABELS } from '../../utils/constants';
import { formatDateTime, formatVelocity, formatFlow } from '../../utils/formatters';

const { Text, Title } = Typography;

const FanIcon = SwapOutlined;

function getHistoryActionLabel(target: ControlTarget, action: number, value?: number): string {
  if (target === 2) {
    const base = FAN_ACTION_LABELS[action] ?? `action=${action}`;
    if (action === 4) return `${base} (${value === 1 ? '자동' : '수동'})`;
    if (action === 5 && value !== undefined) return `${base} (${value} m/s)`;
    return base;
  }
  return `${CONTROL_TARGET_LABELS[target]} action=${action}`;
}

const FAN_SPEED_OPTIONS = [
  { value: FAN_ACTIONS.OFF, label: 'OFF', color: 'default' },
  { value: FAN_ACTIONS.LOW, label: 'LOW (15Hz)', color: 'blue' },
  { value: FAN_ACTIONS.MID, label: 'MID (30Hz)', color: 'orange' },
  { value: FAN_ACTIONS.HIGH, label: 'HIGH (50Hz)', color: 'red' },
];

export default function ControlFanPage() {
  const selectedEquipmentId = useUiStore((s) => s.selectedEquipmentId);
  const { data: realtimeData, isLoading: sensorLoading } = useRealtimeSensorData(selectedEquipmentId);
  const { data: historyData, isLoading: historyLoading } = useControlHistory(selectedEquipmentId);
  const sendCommand = useSendControlCommand();
  const [pendingCmds, setPendingCmds] = useState<Record<string, boolean>>({});
  const [targetVelocityInputs, setTargetVelocityInputs] = useState<Record<string, number>>({});
  const prevFanModes = useRef<Record<number, number>>({});
  const [safetyAlerts, setSafetyAlerts] = useState<Record<number, boolean>>({});

  // 안전 오버라이드 감지 (fan_mode가 1→0으로 변경)
  useEffect(() => {
    if (!realtimeData) return;
    for (const ctrl of realtimeData.controllers) {
      const prevMode = prevFanModes.current[ctrl.controllerId];
      if (prevMode === 1 && ctrl.sensorData.fanMode === 0) {
        setSafetyAlerts((prev) => ({ ...prev, [ctrl.controllerId]: true }));
      }
      prevFanModes.current[ctrl.controllerId] = ctrl.sensorData.fanMode;
    }
  }, [realtimeData]);

  const handleFanSpeed = useCallback(
    (controllerId: string, controllerLabel: string, action: number) => {
      const speedLabel = FAN_SPEED_OPTIONS.find((o) => o.value === action)?.label ?? `action=${action}`;

      showConfirmModal({
        title: '팬 속도 제어',
        content: `${controllerLabel}의 팬 속도를 ${speedLabel}(으)로 설정하시겠습니까?`,
        onOk: () => {
          const key = `${controllerId}-fan`;
          setPendingCmds((prev) => ({ ...prev, [key]: true }));

          sendCommand.mutate(
            {
              target: 2,
              action,
              equipmentId: 'esp-001',
              controllerId,
            },
            {
              onSuccess: (res) => {
                if (res.result === 'SUCCESS') {
                  message.success(`${controllerLabel} 팬 ${speedLabel} 설정 성공`);
                } else {
                  message.error(`팬 제어 실패: ${res.failReason}`);
                }
                setPendingCmds((prev) => ({ ...prev, [key]: false }));
              },
              onError: () => {
                message.error('제어 명령 전송 실패');
                setPendingCmds((prev) => ({ ...prev, [key]: false }));
              },
            },
          );
        },
      });
    },
    [sendCommand],
  );

  const handleModeChange = useCallback(
    (controllerId: string, controllerLabel: string, autoMode: boolean) => {
      const modeLabel = autoMode ? '자동' : '수동';

      showConfirmModal({
        title: '팬 제어 모드 전환',
        content: `${controllerLabel}의 팬 제어 모드를 ${modeLabel}(으)로 전환하시겠습니까?`,
        onOk: () => {
          const key = `${controllerId}-mode`;
          setPendingCmds((prev) => ({ ...prev, [key]: true }));

          sendCommand.mutate(
            {
              target: 2,
              action: FAN_ACTIONS.SET_MODE,
              value: autoMode ? 1 : 0,
              equipmentId: 'esp-001',
              controllerId,
            },
            {
              onSuccess: (res) => {
                if (res.result === 'SUCCESS') {
                  message.success(`${controllerLabel} 팬 ${modeLabel} 모드 전환 성공`);
                } else {
                  message.error(`모드 전환 실패: ${res.failReason}`);
                }
                setPendingCmds((prev) => ({ ...prev, [key]: false }));
              },
              onError: () => {
                message.error('모드 전환 명령 전송 실패');
                setPendingCmds((prev) => ({ ...prev, [key]: false }));
              },
            },
          );
        },
      });
    },
    [sendCommand],
  );

  const handleSetTargetVelocity = useCallback(
    (controllerId: string, controllerLabel: string, targetVelocity: number) => {
      showConfirmModal({
        title: '목표 풍속 설정',
        content: `${controllerLabel}의 목표 풍속을 ${targetVelocity} m/s로 설정하시겠습니까?`,
        onOk: () => {
          const key = `${controllerId}-velocity`;
          setPendingCmds((prev) => ({ ...prev, [key]: true }));

          sendCommand.mutate(
            {
              target: 2,
              action: FAN_ACTIONS.SET_TARGET_VELOCITY,
              value: targetVelocity,
              equipmentId: 'esp-001',
              controllerId,
            },
            {
              onSuccess: (res) => {
                if (res.result === 'SUCCESS') {
                  message.success(`${controllerLabel} 목표 풍속 ${targetVelocity} m/s 설정 성공`);
                } else {
                  message.error(`목표 풍속 설정 실패: ${res.failReason}`);
                }
                setPendingCmds((prev) => ({ ...prev, [key]: false }));
              },
              onError: () => {
                message.error('목표 풍속 설정 명령 전송 실패');
                setPendingCmds((prev) => ({ ...prev, [key]: false }));
              },
            },
          );
        },
      });
    },
    [sendCommand],
  );

  const handleBatchMode = useCallback(
    (autoMode: boolean) => {
      const modeLabel = autoMode ? '자동' : '수동';

      showConfirmModal({
        title: '일괄 팬 모드 전환',
        content: `모든 컨트롤러의 팬 제어 모드를 ${modeLabel}(으)로 전환하시겠습니까?`,
        onOk: () => {
          setPendingCmds((prev) => ({ ...prev, batchMode: true }));
          sendCommand.mutate(
            {
              target: 2,
              action: FAN_ACTIONS.SET_MODE,
              value: autoMode ? 1 : 0,
              equipmentId: 'all',
              controllerId: 'all',
            },
            {
              onSuccess: (res) => {
                if (res.result === 'SUCCESS') {
                  message.success(`일괄 팬 ${modeLabel} 모드 전환 성공`);
                } else {
                  message.error(`일괄 모드 전환 실패: ${res.failReason}`);
                }
                setPendingCmds((prev) => ({ ...prev, batchMode: false }));
              },
              onError: () => {
                message.error('일괄 모드 전환 명령 전송 실패');
                setPendingCmds((prev) => ({ ...prev, batchMode: false }));
              },
            },
          );
        },
      });
    },
    [sendCommand],
  );

  // 팬 제어 이력 필터
  const fanHistory = (historyData ?? []).filter((h) => h.target === 2);

  const historyColumns: ColumnsType<ControlCommand> = [
    {
      title: '시간',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 170,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '대상',
      dataIndex: 'controllerIdMqtt',
      key: 'controllerIdMqtt',
      width: 100,
    },
    {
      title: '명령',
      key: 'action',
      width: 160,
      render: (_: unknown, record: ControlCommand) => getHistoryActionLabel(record.target, record.action, record.value),
    },
    {
      title: '결과',
      dataIndex: 'result',
      key: 'result',
      width: 90,
      render: (result: string) => {
        const colorMap: Record<string, string> = { SUCCESS: 'success', FAIL: 'error', PENDING: 'processing' };
        const labelMap: Record<string, string> = { SUCCESS: '성공', FAIL: '실패', PENDING: '대기중' };
        return <Tag color={colorMap[result] ?? 'default'}>{labelMap[result] ?? result}</Tag>;
      },
    },
    {
      title: '응답 시간',
      dataIndex: 'respondedAt',
      key: 'respondedAt',
      width: 170,
      render: (v: string | undefined) => (v ? formatDateTime(v) : '-'),
    },
  ];

  if (!selectedEquipmentId) {
    return <Empty description="좌측 트리에서 장비를 선택하세요" />;
  }

  if (sensorLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">데이터를 불러오는 중...</Text>
        </div>
      </div>
    );
  }

  if (!realtimeData) {
    return <Empty description="장비 데이터가 없습니다" />;
  }

  return (
    <div>
      {/* 일괄 제어 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={5} style={{ margin: 0 }}>
              <FanIcon /> 일괄 팬 모드 제어
            </Title>
            <Text type="secondary">모든 컨트롤러의 팬 모드를 일괄 전환합니다</Text>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<SwapOutlined />}
                loading={!!pendingCmds['batchMode']}
                onClick={() => handleBatchMode(true)}
              >
                전체 자동
              </Button>
              <Button
                icon={<SwapOutlined />}
                loading={!!pendingCmds['batchMode']}
                onClick={() => handleBatchMode(false)}
              >
                전체 수동
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 컨트롤러별 팬 제어 */}
      {realtimeData.controllers.map((ctrl) => {
        const sd = ctrl.sensorData;
        const isAutoMode = sd.fanMode === 1;
        const isOnline = ctrl.connectionStatus === 'ONLINE';
        const hasSafetyAlert = !!safetyAlerts[ctrl.controllerId];
        const fanKey = `${ctrl.controllerName}-fan`;
        const modeKey = `${ctrl.controllerName}-mode`;
        const velocityKey = `${ctrl.controllerName}-velocity`;
        const velocityInput = targetVelocityInputs[ctrl.controllerName] ?? 5.0;

        return (
          <Card
            key={ctrl.controllerId}
            size="small"
            title={
              <Space>
                <FanIcon />
                <span>{ctrl.controllerName}</span>
                {isOnline ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">연결</Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="error">끊김</Tag>
                )}
                <Tag color={isAutoMode ? 'blue' : 'default'}>
                  {isAutoMode ? '자동 모드' : '수동 모드'}
                </Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            {hasSafetyAlert && (
              <Alert
                type="error"
                icon={<WarningOutlined />}
                message="안전 오버라이드: 비상 상황으로 자동 모드가 해제되었습니다."
                closable
                onClose={() => setSafetyAlerts((prev) => ({ ...prev, [ctrl.controllerId]: false }))}
                style={{ marginBottom: 12 }}
                showIcon
              />
            )}

            {!isOnline && (
              <Alert
                type="warning"
                message="통신 끊김 상태에서는 제어가 불가능할 수 있습니다."
                style={{ marginBottom: 12 }}
                showIcon
              />
            )}

            {/* 현재 상태 */}
            <Descriptions size="small" column={4} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="팬 속도">
                <Tag color={sd.fanSpeed > 0 ? 'blue' : 'default'}>
                  {FAN_SPEED_LABELS[sd.fanSpeed] ?? 'OFF'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="현재 풍속">{formatVelocity(sd.velocity)}</Descriptions.Item>
              <Descriptions.Item label="현재 풍량">{formatFlow(sd.flow)}</Descriptions.Item>
              <Descriptions.Item label="제어 모드">
                <Tag color={isAutoMode ? 'blue' : 'default'}>
                  {isAutoMode ? '자동' : '수동'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* 모드 전환 */}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Text strong>제어 모드:</Text>
              <Switch
                checked={isAutoMode}
                loading={!!pendingCmds[modeKey]}
                checkedChildren="자동"
                unCheckedChildren="수동"
                onChange={(checked) => handleModeChange(ctrl.controllerName, ctrl.controllerName, checked)}
              />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* 수동 제어: 팬 속도 선택 */}
            {!isAutoMode && (
              <div>
                <Text strong>팬 속도 설정</Text>
                <div style={{ marginTop: 8 }}>
                  <Radio.Group
                    value={sd.fanSpeed}
                    buttonStyle="solid"
                    disabled={!!pendingCmds[fanKey]}
                    onChange={(e) => handleFanSpeed(ctrl.controllerName, ctrl.controllerName, e.target.value)}
                  >
                    {FAN_SPEED_OPTIONS.map((opt) => (
                      <Radio.Button key={opt.value} value={opt.value}>
                        {opt.label}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </div>
              </div>
            )}

            {/* 자동 제어: 목표 풍속 입력 */}
            {isAutoMode && (
              <div>
                <Text strong>목표 풍속 (m/s)</Text>
                <Row gutter={12} style={{ marginTop: 8 }} align="middle">
                  <Col>
                    <InputNumber
                      min={0.5}
                      max={20.0}
                      step={0.5}
                      value={velocityInput}
                      addonAfter="m/s"
                      style={{ width: 200 }}
                      onChange={(val) => {
                        if (val !== null) {
                          setTargetVelocityInputs((prev) => ({ ...prev, [ctrl.controllerName]: val }));
                        }
                      }}
                    />
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      loading={!!pendingCmds[velocityKey]}
                      onClick={() => handleSetTargetVelocity(ctrl.controllerName, ctrl.controllerName, velocityInput)}
                    >
                      목표 풍속 적용
                    </Button>
                  </Col>
                </Row>
              </div>
            )}
          </Card>
        );
      })}

      {/* 제어 이력 */}
      <Card size="small" title="팬 제어 이력">
        <Table
          columns={historyColumns}
          dataSource={fanHistory}
          rowKey="commandId"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          loading={historyLoading}
        />
      </Card>
    </div>
  );
}
