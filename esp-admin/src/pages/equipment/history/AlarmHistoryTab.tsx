import { useState } from 'react';
import { Card, DatePicker, Select, Table, Tag, Space, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAlarmHistory } from '../../../api/history.api';
import type { AlarmEvent, AlarmType, AlarmSeverity } from '../../../types/equipment.types';
import { formatDateTime } from '../../../utils/formatters';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const RANGE_PRESETS: { label: string; value: [Dayjs, Dayjs] }[] = [
  { label: '최근 1일', value: [dayjs().subtract(1, 'day'), dayjs()] },
  { label: '최근 7일', value: [dayjs().subtract(7, 'day'), dayjs()] },
  { label: '최근 30일', value: [dayjs().subtract(30, 'day'), dayjs()] },
];

const ALARM_TYPE_OPTIONS: { value: AlarmType | undefined; label: string }[] = [
  { value: undefined, label: '전체' },
  { value: 'COMM_ERROR', label: '통신 오류' },
  { value: 'INLET_TEMP', label: '유입 온도 이상' },
  { value: 'FILTER_CHECK', label: '필터 청소 상태 점검' },
  { value: 'DUST_PERFORMANCE', label: '먼지제거 성능 점검' },
  { value: 'SPARK', label: '스파크 이상' },
  { value: 'OVER_TEMP', label: '보드 과온도' },
];

const ALARM_TYPE_LABELS: Record<AlarmType, string> = {
  COMM_ERROR: '통신 오류',
  INLET_TEMP: '유입 온도 이상',
  FILTER_CHECK: '필터 청소 상태 점검',
  DUST_PERFORMANCE: '먼지제거 성능 점검',
  SPARK: '스파크 이상',
  OVER_TEMP: '보드 과온도',
};

interface AlarmHistoryTabProps {
  equipmentId: number;
}

export default function AlarmHistoryTab({ equipmentId }: AlarmHistoryTabProps) {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [typeFilter, setTypeFilter] = useState<AlarmType | undefined>(undefined);

  const from = dateRange[0].unix();
  const to = dateRange[1].unix();

  const { data, isLoading } = useAlarmHistory(equipmentId, from, to, typeFilter);

  const columns: ColumnsType<AlarmEvent> = [
    {
      title: '발생 시간',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      width: 170,
      render: (v: string) => formatDateTime(v),
      sorter: (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: '알람 유형',
      dataIndex: 'alarmType',
      key: 'alarmType',
      width: 150,
      render: (v: AlarmType) => ALARM_TYPE_LABELS[v] ?? v,
    },
    {
      title: '심각도',
      dataIndex: 'severity',
      key: 'severity',
      width: 90,
      render: (v: AlarmSeverity) => (
        <Tag color={v === 'RED' ? 'error' : 'warning'}>
          {v === 'RED' ? '위험' : '주의'}
        </Tag>
      ),
      filters: [
        { text: '위험', value: 'RED' },
        { text: '주의', value: 'YELLOW' },
      ],
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: '매장명',
      dataIndex: 'storeName',
      key: 'storeName',
      width: 140,
    },
    {
      title: '장비명',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 140,
    },
    {
      title: '파워팩',
      dataIndex: 'controllerName',
      key: 'controllerName',
      width: 100,
      render: (v: string | undefined) => v ?? '-',
    },
    {
      title: '수치',
      dataIndex: 'value',
      key: 'value',
      width: 90,
      render: (v: number | undefined) => (v !== undefined ? String(v) : '-'),
    },
    {
      title: '내용',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '해제 시간',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      width: 170,
      render: (v: string | undefined) => v ? formatDateTime(v) : <Tag color="processing">진행중</Tag>,
    },
  ];

  return (
    <div>
      {/* 필터 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Text strong>기간:</Text>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
            presets={RANGE_PRESETS}
            allowClear={false}
          />
          <Text strong>알람 유형:</Text>
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 180 }}
            options={ALARM_TYPE_OPTIONS}
          />
        </Space>
      </Card>

      {/* 테이블 */}
      <Card size="small" title="알람 이력">
        <Table
          columns={columns}
          dataSource={data ?? []}
          rowKey="alarmId"
          size="small"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          loading={isLoading}
        />
      </Card>
    </div>
  );
}
