import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Card, Button, Tag, Table, Space, Alert, Spin, Empty, Typography,
  Row, Col, Slider, InputNumber, Switch, Descriptions, Divider, message,
} from 'antd';
import {
  ControlOutlined, CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined, SwapOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useUiStore } from '../../stores/uiStore';
import { useRealtimeSensorData } from '../../api/monitoring.api';
import { useSendControlCommand, useControlHistory } from '../../api/control.api';
import { showConfirmModal } from '../../components/common/ConfirmModal';
import { DAMPER_ACTIONS, DAMPER_STEPS, DAMPER_ACTION_LABELS, CONTROL_TARGET_LABELS } from '../../types/control.types';
import type { ControlCommand, ControlTarget } from '../../types/control.types';
import { DAMPER_STEP_MAP } from '../../utils/constants';
import { formatDateTime, formatFlow, formatNumber } from '../../utils/formatters';

const { Text, Title } = Typography;

// 개도율에 가장 가까운 단계를 찾기
function findClosestStep(opening: number): number {
  let closest = 0;
  let minDiff = Infinity;
  for (const s of DAMPER_STEP_MAP) {
    const diff = Math.abs(s.opening - opening);
    if (diff < minDiff) {
      minDiff = diff;
      closest = s.step;
    }
  }
  return closest;
}

// 슬라이더 marks 생성
const sliderMarks: Record<number, string> = {};
for (const s of DAMPER_STEP_MAP) {
  sliderMarks[s.step] = `${s.opening}%`;
}

function getHistoryActionLabel(target: ControlTarget, action: number, value?: number): string {
  if (target === 1) {
    const base = DAMPER_ACTION_LABELS[action] ?? `action=${action}`;
    if (action === 1 && value !== undefined) return `${base} (${value}%)`;
    if (action === 2) return `${base} (${value === 1 ? '자동' : '수동'})`;
    if (action === 3 && value !== undefined) return `${base} (${value} CMH)`;
    return base;
  }
  return `${CONTROL_TARGET_LABELS[target]} action=${action}`;
}

export default function ControlDamperPage() {
  const selectedEquipmentId = useUiStore((s) => s.selectedEquipmentId);
  const { data: realtimeData, isLoading: sensorLoading } = useRealtimeSensorData(selectedEquipmentId);
  const { data: historyData, isLoading: historyLoading } = useControlHistory(selectedEquipmentId);
  const sendCommand = useSendControlCommand();
  const [pendingCmds, setPendingCmds] = useState<Record<string, boolean>>({});
  const [targetFlowInputs, setTargetFlowInputs] = useState<Record<string, number>>({});
  const prevDamperModes = useRef<Record<number, number>>({});
  const [safetyAlerts, setSafetyAlerts] = useState<Record<number, boolean>>({});

  // 안전 오버라이드 감지 (damper_mode가 1→0으로 변경)
  useEffect(() => {
    if (!realtimeData) return;
    for (const ctrl of realtimeData.controllers) {
      const prevMode = prevDamperModes.current[ctrl.controllerId];
      if (prevMode === 1 && ctrl.sensorData.damperMode === 0) {
        setSafetyAlerts((prev) => ({ ...prev, [ctrl.controllerId]: true }));
      }
      prevDamperModes.current[ctrl.controllerId] = ctrl.sensorData.damperMode;
    }
  }, [realtimeData]);

  const handleSetOpening = useCallback(
    (controllerId: string, controllerLabel: string, step: number) => {
      const stepInfo = DAMPER_STEPS[step];
      if (!stepInfo) return;

      showConfirmModal({
        title: '댐퍼 개도율 설정',
        content: `${controllerLabel}의 댐퍼 개도율을 ${step}단계 (${stepInfo.opening}%)로 설정하시겠습니까?`,
        onOk: () => {
          const key = `${controllerId}-damper`;
          setPendingCmds((prev) => ({ ...prev, [key]: true }));

          sendCommand.mutate(
            {
              target: 1,
              action: DAMPER_ACTIONS.SET_OPENING,
              value: stepInfo.value,
              equipmentId: 'esp-001',
              controllerId,
            },
            {
              onSuccess: (res) => {
                if (res.result === 'SUCCESS') {
                  message.success(`${controllerLabel} 댐퍼 ${step}단계 (${stepInfo.opening}%) 설정 성공`);
                } else {
                  message.error(`댐퍼 제어 실패: ${res.failReason}`);
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
        title: '댐퍼 제어 모드 전환',
        content: `${controllerLabel}의 댐퍼 제어 모드를 ${modeLabel}(으)로 전환하시겠습니까?`,
        onOk: () => {
          const key = `${controllerId}-mode`;
          setPendingCmds((prev) => ({ ...prev, [key]: true }));

          sendCommand.mutate(
            {
              target: 1,
              action: DAMPER_ACTIONS.SET_MODE,
              value: autoMode ? 1 : 0,
              equipmentId: 'esp-001',
              controllerId,
            },
            {
              onSuccess: (res) => {
                if (res.result === 'SUCCESS') {
                  message.success(`${controllerLabel} 댐퍼 ${modeLabel} 모드 전환 성공`);
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

  const handleSetTargetFlow = useCallback(
    (controllerId: string, controllerLabel: string, targetFlow: number) => {
      showConfirmModal({
        title: '목표 풍량 설정',
        content: `${controllerLabel}의 목표 풍량을 ${targetFlow} CMH로 설정하시겠습니까?`,
        onOk: () => {
          const key = `${controllerId}-flow`;
          setPendingCmds((prev) => ({ ...prev, [key]: true }));

          sendCommand.mutate(
            {
              target: 1,
              action: DAMPER_ACTIONS.SET_TARGET_FLOW,
              value: targetFlow,
              equipmentId: 'esp-001',
              controllerId,
            },
            {
              onSuccess: (res) => {
                if (res.result === 'SUCCESS') {
                  message.success(`${controllerLabel} 목표 풍량 ${targetFlow} CMH 설정 성공`);
                } else {
                  message.error(`목표 풍량 설정 실패: ${res.failReason}`);
                }
                setPendingCmds((prev) => ({ ...prev, [key]: false }));
              },
              onError: () => {
                message.error('목표 풍량 설정 명령 전송 실패');
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
        title: '일괄 댐퍼 모드 전환',
        content: `모든 컨트롤러의 댐퍼 제어 모드를 ${modeLabel}(으)로 전환하시겠습니까?`,
        onOk: () => {
          setPendingCmds((prev) => ({ ...prev, batchMode: true }));
          sendCommand.mutate(
            {
              target: 1,
              action: DAMPER_ACTIONS.SET_MODE,
              value: autoMode ? 1 : 0,
              equipmentId: 'all',
              controllerId: 'all',
            },
            {
              onSuccess: (res) => {
                if (res.result === 'SUCCESS') {
                  message.success(`일괄 댐퍼 ${modeLabel} 모드 전환 성공`);
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

  // 댐퍼 제어 이력 필터
  const damperHistory = (historyData ?? []).filter((h) => h.target === 1);

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
              <ControlOutlined /> 일괄 댐퍼 모드 제어
            </Title>
            <Text type="secondary">모든 컨트롤러의 댐퍼 모드를 일괄 전환합니다</Text>
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

      {/* 컨트롤러별 댐퍼 제어 */}
      {realtimeData.controllers.map((ctrl) => {
        const sd = ctrl.sensorData;
        const isAutoMode = sd.damperMode === 1;
        const isOnline = ctrl.connectionStatus === 'ONLINE';
        const currentStep = findClosestStep(sd.damper);
        const hasSafetyAlert = !!safetyAlerts[ctrl.controllerId];
        const damperKey = `${ctrl.controllerName}-damper`;
        const modeKey = `${ctrl.controllerName}-mode`;
        const flowKey = `${ctrl.controllerName}-flow`;
        const flowInput = targetFlowInputs[ctrl.controllerName] ?? 800;

        return (
          <Card
            key={ctrl.controllerId}
            size="small"
            title={
              <Space>
                <ControlOutlined />
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
              <Descriptions.Item label="현재 개도율">{formatNumber(sd.damper, 1)}%</Descriptions.Item>
              <Descriptions.Item label="현재 풍량">{formatFlow(sd.flow)}</Descriptions.Item>
              <Descriptions.Item label="현재 풍속">{formatNumber(sd.velocity, 1)} m/s</Descriptions.Item>
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

            {/* 수동 제어: 8단계 슬라이더 */}
            {!isAutoMode && (
              <div>
                <Text strong>개도율 설정 (8단계)</Text>
                <div style={{ padding: '8px 16px' }}>
                  <Slider
                    min={0}
                    max={7}
                    step={1}
                    value={currentStep}
                    marks={sliderMarks}
                    disabled={!!pendingCmds[damperKey]}
                    tooltip={{
                      formatter: (val) => {
                        const s = DAMPER_STEP_MAP[val ?? 0];
                        return s ? `${s.label} (${s.opening}%)` : '';
                      },
                    }}
                    onChange={(val) => handleSetOpening(ctrl.controllerName, ctrl.controllerName, val)}
                  />
                </div>
                <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                  {DAMPER_STEP_MAP.map((s) => (
                    <Col key={s.step}>
                      <Button
                        size="small"
                        type={currentStep === s.step ? 'primary' : 'default'}
                        loading={!!pendingCmds[damperKey]}
                        onClick={() => handleSetOpening(ctrl.controllerName, ctrl.controllerName, s.step)}
                      >
                        {s.label} ({s.opening}%)
                      </Button>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* 자동 제어: 목표 풍량 입력 */}
            {isAutoMode && (
              <div>
                <Text strong>목표 풍량 (CMH)</Text>
                <Row gutter={12} style={{ marginTop: 8 }} align="middle">
                  <Col>
                    <InputNumber
                      min={100}
                      max={2000}
                      step={10}
                      value={flowInput}
                      addonAfter="CMH"
                      style={{ width: 200 }}
                      onChange={(val) => {
                        if (val !== null) {
                          setTargetFlowInputs((prev) => ({ ...prev, [ctrl.controllerName]: val }));
                        }
                      }}
                    />
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      loading={!!pendingCmds[flowKey]}
                      onClick={() => handleSetTargetFlow(ctrl.controllerName, ctrl.controllerName, flowInput)}
                    >
                      목표 풍량 적용
                    </Button>
                  </Col>
                </Row>
              </div>
            )}
          </Card>
        );
      })}

      {/* 제어 이력 */}
      <Card size="small" title="댐퍼 제어 이력">
        <Table
          columns={historyColumns}
          dataSource={damperHistory}
          rowKey="commandId"
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          loading={historyLoading}
        />
      </Card>
    </div>
  );
}
