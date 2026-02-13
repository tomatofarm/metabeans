import { useState } from 'react';
import { Table, Card, Space, Select, DatePicker, Button, Tag } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useASAlerts } from '../../api/as-service.api';
import StatusTag from '../../components/common/StatusTag';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';
import type { ASAlert, AlertType, AlertSeverity } from '../../types/as-service.types';
import type { StatusLevel } from '../../utils/constants';

const { RangePicker } = DatePicker;

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  COMM_ERROR: '통신 오류',
  INLET_TEMP: '유입 온도 이상',
  FILTER_CHECK: '필터 청소 점검',
  DUST_REMOVAL: '먼지제거 성능',
  SPARK: '스파크 감지',
};

const SEVERITY_LEVEL_MAP: Record<AlertSeverity, StatusLevel> = {
  WARNING: 'yellow',
  CRITICAL: 'red',
};

const STORE_OPTIONS = [
  { value: 1, label: '강남점 (튀김)' },
  { value: 2, label: '홍대점 (굽기)' },
  { value: 3, label: '신촌점 (커피로스팅)' },
];

export default function ASAlertListPage() {
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState<number | undefined>();
  const [alertType, setAlertType] = useState<AlertType | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const { data, isLoading } = useASAlerts({
    storeId,
    alertType,
    from: dateRange?.[0]?.toISOString(),
    to: dateRange?.[1]?.toISOString(),
  });

  const alerts = data?.data ?? [];
  const totalCount = data?.meta?.totalCount ?? 0;

  const handleASRequest = (alert: ASAlert) => {
    // 알림에서 A/S 신청: 매장/장비 정보를 query params로 전달
    const params = new URLSearchParams();
    params.set('storeId', String(alert.storeId));
    params.set('equipmentId', String(alert.equipmentId));
    params.set('alertType', alert.alertType);
    navigate(`/as-service/request?${params.toString()}`);
  };

  const columns: ColumnsType<ASAlert> = [
    {
      title: '발생 일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val: string) => (
        <span title={formatDateTime(val)}>{formatRelativeTime(val)}</span>
      ),
      sorter: (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
      defaultSortOrder: 'ascend',
    },
    {
      title: '매장명',
      dataIndex: 'storeName',
      key: 'storeName',
      width: 160,
    },
    {
      title: '장비명',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 180,
      render: (val: string, record) =>
        record.controllerName ? `${val} / ${record.controllerName}` : val,
    },
    {
      title: '알림 유형',
      dataIndex: 'alertType',
      key: 'alertType',
      width: 150,
      render: (val: AlertType) => ALERT_TYPE_LABELS[val] ?? val,
    },
    {
      title: '심각도',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (val: AlertSeverity) => (
        <StatusTag
          level={SEVERITY_LEVEL_MAP[val]}
          label={val === 'CRITICAL' ? '위험' : '주의'}
        />
      ),
      filters: [
        { text: '위험', value: 'CRITICAL' },
        { text: '주의', value: 'WARNING' },
      ],
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: '상태',
      dataIndex: 'isResolved',
      key: 'isResolved',
      width: 100,
      render: (val: boolean) =>
        val ? (
          <Tag color="default">해결됨</Tag>
        ) : (
          <Tag color="error">미해결</Tag>
        ),
      filters: [
        { text: '미해결', value: false },
        { text: '해결됨', value: true },
      ],
      onFilter: (value, record) => record.isResolved === value,
    },
    {
      title: '수치',
      key: 'value',
      width: 120,
      render: (_: unknown, record) =>
        record.currentValue !== undefined
          ? `${record.currentValue}${record.unit ?? ''}`
          : '-',
    },
    {
      title: '',
      key: 'action',
      width: 120,
      render: (_: unknown, record) =>
        !record.isResolved && (
          <Button
            type="primary"
            size="small"
            icon={<ToolOutlined />}
            onClick={() => handleASRequest(record)}
          >
            A/S 신청
          </Button>
        ),
    },
  ];

  return (
    <Card>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="매장 선택"
          allowClear
          style={{ width: 180 }}
          options={STORE_OPTIONS}
          value={storeId}
          onChange={(val) => setStoreId(val)}
        />
        <Select
          placeholder="알림 유형"
          allowClear
          style={{ width: 160 }}
          options={Object.entries(ALERT_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
          value={alertType}
          onChange={(val) => setAlertType(val as AlertType | undefined)}
        />
        <RangePicker
          onChange={(dates) =>
            setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)
          }
        />
      </Space>

      <Table<ASAlert>
        rowKey="alertId"
        columns={columns}
        dataSource={alerts}
        loading={isLoading}
        pagination={{
          total: totalCount,
          pageSize: 20,
          showTotal: (total) => `총 ${total}건`,
          showSizeChanger: false,
        }}
        size="middle"
      />
    </Card>
  );
}
