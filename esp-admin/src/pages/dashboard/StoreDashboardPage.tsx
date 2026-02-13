import { Typography, Space, Row, Col, Card, Table, Tag, List, Empty, Spin } from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { useStoreDashboard } from '../../api/dashboard.api';
import AirQualityCard from '../../components/common/AirQualityCard';
import StatusTag from '../../components/common/StatusTag';
import type { StoreEquipmentStatus, StoreAsRequest, DashboardIssueItem } from '../../types/dashboard.types';
import { getStatusConfig } from '../../utils/statusHelper';
import { formatRelativeTime } from '../../utils/formatters';
import { AS_STATUS_LABELS } from '../../utils/constants';

interface StoreDashboardPageProps {
  storeId: number;
  onEquipmentClick: (equipmentId: number) => void;
}

const equipmentColumns = (onEquipmentClick: (id: number) => void) => [
  {
    title: '장비명',
    dataIndex: 'equipmentName',
    key: 'equipmentName',
    render: (text: string, record: StoreEquipmentStatus) => (
      <a onClick={() => onEquipmentClick(record.equipmentId)}>
        <DesktopOutlined style={{ marginRight: 8 }} />
        {text}
      </a>
    ),
  },
  {
    title: '상태',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (level: StoreEquipmentStatus['status']) => <StatusTag level={level} />,
  },
  {
    title: '연결',
    dataIndex: 'connectionStatus',
    key: 'connectionStatus',
    width: 80,
    render: (status: string) =>
      status === 'ONLINE' ? (
        <Tag color="green" icon={<WifiOutlined />}>연결</Tag>
      ) : (
        <Tag color="red" icon={<DisconnectOutlined />}>끊김</Tag>
      ),
  },
  {
    title: '파워팩',
    key: 'controllers',
    width: 120,
    render: (_: unknown, record: StoreEquipmentStatus) =>
      `${record.normalControllers}/${record.controllerCount} 정상`,
  },
  {
    title: '최근 통신',
    dataIndex: 'lastSeenAt',
    key: 'lastSeenAt',
    width: 120,
    render: (v: string) => formatRelativeTime(v),
  },
];

const issueColumns = [
  { title: '유형', dataIndex: 'issueType', key: 'issueType', width: 120,
    render: (type: string) => {
      const labels: Record<string, string> = {
        COMM_ERROR: '통신 오류',
        INLET_TEMP: '유입 온도',
        FILTER_CHECK: '필터 점검',
        DUST_REMOVAL: '먼지제거',
      };
      return labels[type] ?? type;
    },
  },
  { title: '장비', dataIndex: 'equipmentName', key: 'equipmentName', width: 160 },
  {
    title: '상태',
    dataIndex: 'severity',
    key: 'severity',
    width: 80,
    render: (level: DashboardIssueItem['severity']) => {
      const config = getStatusConfig(level);
      return <Tag color={config.color}>{config.label}</Tag>;
    },
  },
  {
    title: '현재값',
    key: 'currentValue',
    width: 100,
    render: (_: unknown, record: DashboardIssueItem) =>
      record.currentValue !== undefined
        ? `${record.currentValue}${record.unit ? ` ${record.unit}` : ''}`
        : '-',
  },
  { title: '내용', dataIndex: 'message', key: 'message', ellipsis: true },
  {
    title: '발생시간',
    dataIndex: 'occurredAt',
    key: 'occurredAt',
    width: 100,
    render: (v: string) => formatRelativeTime(v),
  },
];

export default function StoreDashboardPage({ storeId, onEquipmentClick }: StoreDashboardPageProps) {
  const { data, isLoading } = useStoreDashboard(storeId);

  if (isLoading) {
    return <Spin tip="매장 데이터 로딩 중..." style={{ display: 'block', marginTop: 100 }} />;
  }

  if (!data) {
    return <Empty description="매장 데이터가 없습니다." />;
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {data.storeName}
        </Typography.Title>
        <Typography.Text type="secondary">
          {data.address} · {data.businessType}
        </Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <AirQualityCard data={data.iaqData} />
        </Col>
        <Col xs={24} lg={12}>
          <Card title="장비 현황" size="small">
            <Table
              dataSource={data.equipments}
              columns={equipmentColumns(onEquipmentClick)}
              rowKey="equipmentId"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Card title="매장 이슈" size="small">
        {data.issues.length > 0 ? (
          <Table
            dataSource={data.issues}
            columns={issueColumns}
            rowKey="issueId"
            size="small"
            pagination={false}
          />
        ) : (
          <Empty description="이슈 없음" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      <Card title="최근 A/S 현황" size="small">
        {data.recentAsRequests.length > 0 ? (
          <List
            dataSource={data.recentAsRequests}
            renderItem={(item: StoreAsRequest) => (
              <List.Item
                extra={
                  <Tag color={item.status === 'COMPLETED' ? 'green' : item.status === 'PENDING' ? 'orange' : 'blue'}>
                    {AS_STATUS_LABELS[item.status] ?? item.status}
                  </Tag>
                }
              >
                <List.Item.Meta
                  title={item.equipmentName ?? '장비 미지정'}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="A/S 내역 없음" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </Space>
  );
}
