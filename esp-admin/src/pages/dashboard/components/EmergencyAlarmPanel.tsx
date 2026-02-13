import { Badge, Button, Popover, List, Tag, Typography, Empty, Space } from 'antd';
import { BellOutlined, WarningOutlined } from '@ant-design/icons';
import { useEmergencyAlarms } from '../../../api/dashboard.api';
import { useAlertStore } from '../../../stores/alertStore';
import type { EmergencyAlarm } from '../../../types/dashboard.types';
import { formatRelativeTime } from '../../../utils/formatters';
import { useEffect } from 'react';

const { Text } = Typography;

interface EmergencyAlarmPanelProps {
  onAlarmClick?: (equipmentId: number) => void;
}

const ALARM_TYPE_LABELS: Record<string, string> = {
  COMM_ERROR: '통신 끊김',
  INLET_TEMP_ABNORMAL: '유입 온도 위험',
};

function AlarmItem({ alarm, onClick }: { alarm: EmergencyAlarm; onClick?: () => void }) {
  return (
    <List.Item
      style={{ cursor: 'pointer', padding: '8px 0' }}
      onClick={onClick}
    >
      <List.Item.Meta
        avatar={<WarningOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />}
        title={
          <Space size={4}>
            <Text strong style={{ fontSize: 13 }}>{alarm.storeName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {alarm.equipmentName}
            </Text>
          </Space>
        }
        description={
          <div>
            <Tag color="red" style={{ marginBottom: 2 }}>
              {ALARM_TYPE_LABELS[alarm.alarmType] ?? alarm.alarmType}
            </Tag>
            <div style={{ fontSize: 12 }}>{alarm.message}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {formatRelativeTime(alarm.occurredAt)}
            </Text>
          </div>
        }
      />
    </List.Item>
  );
}

export default function EmergencyAlarmPanel({ onAlarmClick }: EmergencyAlarmPanelProps) {
  const { data: alarms } = useEmergencyAlarms();
  const { setAlerts, unreadCount } = useAlertStore();

  // Sync alarm data to alertStore
  useEffect(() => {
    if (alarms && alarms.length > 0) {
      setAlerts(
        alarms.map((a: EmergencyAlarm) => ({
          alarmId: a.alarmId,
          storeId: a.storeId,
          equipmentId: a.equipmentId,
          controllerId: a.controllerId,
          alarmType: a.alarmType,
          severity: a.severity,
          message: a.message,
          occurredAt: a.occurredAt,
          status: a.status,
        })),
      );
    }
  }, [alarms, setAlerts]);

  const count = alarms?.length ?? unreadCount;

  const content = (
    <div style={{ width: 360, maxHeight: 400, overflow: 'auto' }}>
      <div style={{ padding: '8px 0 4px', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
        <Text strong style={{ fontSize: 14 }}>
          긴급 알람 <Tag color="red">{count}건</Tag>
        </Text>
        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
          Red 알람만 표시 (이메일 발송 대상)
        </Text>
      </div>
      {alarms && alarms.length > 0 ? (
        <List
          dataSource={alarms}
          renderItem={(alarm: EmergencyAlarm) => (
            <AlarmItem
              alarm={alarm}
              onClick={() => onAlarmClick?.(alarm.equipmentId)}
            />
          )}
        />
      ) : (
        <Empty
          description="긴급 알람 없음"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: 24 }}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      placement="bottomRight"
    >
      <Badge count={count} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={count > 0 ? { color: '#ff4d4f' } : undefined}
        />
      </Badge>
    </Popover>
  );
}
