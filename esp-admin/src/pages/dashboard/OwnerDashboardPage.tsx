import { Typography, Space, Row, Col, Card, Table, Tag, List, Empty, Spin } from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import {
  useRoleDashboardIssues,
  useRoleRecentAs,
  useStoreDashboard,
} from '../../api/dashboard.api';
import type { RoleAsRequest } from '../../api/mock/dashboard.mock';
import type { StoreEquipmentStatus, DashboardIssueItem } from '../../types/dashboard.types';
import AirQualityCard from '../../components/common/AirQualityCard';
import StatusTag from '../../components/common/StatusTag';
import { getStatusConfig } from '../../utils/statusHelper';
import { formatRelativeTime } from '../../utils/formatters';
import { AS_STATUS_LABELS } from '../../utils/constants';

interface OwnerDashboardPageProps {
  onNavigateToEquipment: (equipmentId: number) => void;
}

// storeId 문자열 → 숫자 매핑
const STORE_ID_MAP: Record<string, number> = {
  'store-001': 1,
  'store-002': 2,
  'store-003': 3,
};

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
  {
    title: '유형',
    dataIndex: 'issueType',
    key: 'issueType',
    width: 120,
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
  {
    title: '장비',
    dataIndex: 'equipmentName',
    key: 'equipmentName',
    width: 160,
  },
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
  {
    title: '내용',
    dataIndex: 'message',
    key: 'message',
    ellipsis: true,
  },
  {
    title: '발생시간',
    dataIndex: 'occurredAt',
    key: 'occurredAt',
    width: 100,
    render: (v: string) => formatRelativeTime(v),
  },
];

export default function OwnerDashboardPage({ onNavigateToEquipment }: OwnerDashboardPageProps) {
  const user = useAuthStore((s) => s.user);
  const storeIds = user?.storeIds ?? [];

  // OWNER는 매장 1개 → 첫 번째 storeId의 숫자 ID
  const numericStoreId = storeIds
    .map((sid) => STORE_ID_MAP[sid])
    .filter((id): id is number => id !== undefined)[0] ?? null;

  const { data: storeData, isLoading: storeLoading } = useStoreDashboard(numericStoreId);
  const { data: issues, isLoading: issuesLoading } = useRoleDashboardIssues(storeIds);
  const { data: recentAs, isLoading: asLoading } = useRoleRecentAs(storeIds);

  if (storeLoading) {
    return <Spin tip="매장 데이터 로딩 중..." style={{ display: 'block', marginTop: 100 }} />;
  }

  // 이슈 카테고리에서 전체 아이템 추출
  const allIssueItems = issues?.flatMap((cat) => cat.items) ?? [];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          내 매장 대시보드
        </Typography.Title>
        {storeData && (
          <Typography.Text type="secondary">
            {storeData.storeName} · {storeData.address}
          </Typography.Text>
        )}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <AirQualityCard data={storeData?.iaqData} />
        </Col>
        <Col xs={24} lg={12}>
          <Card title="장비 상태" size="small">
            {storeData && storeData.equipments.length > 0 ? (
              <Table
                dataSource={storeData.equipments}
                columns={equipmentColumns(onNavigateToEquipment)}
                rowKey="equipmentId"
                size="small"
                pagination={false}
              />
            ) : (
              <Empty description="장비가 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="이슈 알림" size="small" loading={issuesLoading}>
        {allIssueItems.length > 0 ? (
          <Table
            dataSource={allIssueItems}
            columns={issueColumns}
            rowKey="issueId"
            size="small"
            pagination={false}
          />
        ) : (
          <Empty description="이슈 없음" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      <Card title="최근 A/S 신청 이력" size="small" loading={asLoading}>
        {recentAs && recentAs.length > 0 ? (
          <List
            dataSource={recentAs}
            renderItem={(item: RoleAsRequest) => (
              <List.Item
                extra={
                  <Tag color={item.status === 'COMPLETED' ? 'green' : item.status === 'PENDING' ? 'orange' : 'blue'}>
                    {AS_STATUS_LABELS[item.status as keyof typeof AS_STATUS_LABELS] ?? item.status}
                  </Tag>
                }
              >
                <List.Item.Meta
                  title={item.equipmentName}
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
