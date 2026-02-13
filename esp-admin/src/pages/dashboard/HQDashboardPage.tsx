import { Typography, Space, Row, Col, Card, Statistic, Table, Tag, List, Empty } from 'antd';
import {
  ShopOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import {
  useRoleDashboardSummary,
  useRoleDashboardIssues,
  useRoleStoreList,
  useRoleRecentAs,
  useStoreDashboard,
} from '../../api/dashboard.api';
import type { RoleDashboardSummary, RoleAsRequest } from '../../api/mock/dashboard.mock';
import type { StoreMapItem } from '../../types/dashboard.types';
import IssuePanel from './components/IssuePanel';
import AirQualityCard from '../../components/common/AirQualityCard';
import StatusTag from '../../components/common/StatusTag';
import { AS_STATUS_LABELS } from '../../utils/constants';

interface HQDashboardPageProps {
  onNavigateToStore: (storeId: number) => void;
  onNavigateToEquipment: (equipmentId: number) => void;
}

function HQSummaryCards({ data, loading }: { data?: RoleDashboardSummary; loading?: boolean }) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12}>
        <Card loading={loading}>
          <Statistic
            title="소속 매장"
            value={data?.totalStores ?? 0}
            prefix={<ShopOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12}>
        <Card loading={loading}>
          <Statistic
            title="전체 장비"
            value={data?.totalEquipments ?? 0}
            prefix={<DesktopOutlined />}
            suffix={
              <span style={{ fontSize: 14, color: '#52c41a' }}>
                / 정상 {data?.normalEquipments ?? 0}
              </span>
            }
          />
        </Card>
      </Col>
    </Row>
  );
}

// storeId 문자열 → 숫자 매핑 (HQ 소속 매장 IAQ 확인용)
const STORE_ID_MAP: Record<string, number> = {
  'store-001': 1,
  'store-002': 2,
  'store-003': 3,
};

function IAQOverview({ storeIds }: { storeIds: string[] }) {
  const numericIds = storeIds
    .filter((sid) => sid !== '*')
    .map((sid) => STORE_ID_MAP[sid])
    .filter((id): id is number => id !== undefined);

  // 첫 번째 소속 매장의 IAQ 데이터를 대표로 표시
  const firstStoreId = numericIds[0] ?? null;
  const { data } = useStoreDashboard(firstStoreId);

  if (!data?.iaqData) return null;

  return (
    <AirQualityCard data={data.iaqData} />
  );
}

const storeColumns = (onStoreClick: (storeId: number) => void) => [
  {
    title: '매장명',
    dataIndex: 'storeName',
    key: 'storeName',
    render: (text: string, record: StoreMapItem) => (
      <a onClick={() => onStoreClick(record.storeId)}>
        <ShopOutlined style={{ marginRight: 8 }} />
        {text}
      </a>
    ),
  },
  {
    title: '주소',
    dataIndex: 'address',
    key: 'address',
    ellipsis: true,
  },
  {
    title: '상태',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (level: StoreMapItem['status']) => <StatusTag level={level} />,
  },
  {
    title: '장비',
    dataIndex: 'equipmentCount',
    key: 'equipmentCount',
    width: 80,
    render: (count: number) => `${count}대`,
  },
  {
    title: '이슈',
    dataIndex: 'issueCount',
    key: 'issueCount',
    width: 80,
    render: (count: number) => (
      <span style={{ color: count > 0 ? '#ff4d4f' : undefined }}>{count}건</span>
    ),
  },
];

export default function HQDashboardPage({
  onNavigateToStore,
  onNavigateToEquipment,
}: HQDashboardPageProps) {
  const user = useAuthStore((s) => s.user);
  const storeIds = user?.storeIds ?? [];

  const { data: summary, isLoading: summaryLoading } = useRoleDashboardSummary(storeIds);
  const { data: issues, isLoading: issuesLoading } = useRoleDashboardIssues(storeIds);
  const { data: stores, isLoading: storesLoading } = useRoleStoreList(storeIds);
  const { data: recentAs, isLoading: asLoading } = useRoleRecentAs(storeIds);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          매장 본사 대시보드
        </Typography.Title>
        <Typography.Text type="secondary">
          소속 매장 현황 (읽기 전용)
        </Typography.Text>
      </div>

      <HQSummaryCards data={summary} loading={summaryLoading} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <IAQOverview storeIds={storeIds} />
        </Col>
        <Col xs={24} lg={12}>
          <Card title="소속 매장 목록" size="small" loading={storesLoading}>
            {stores && stores.length > 0 ? (
              <Table
                dataSource={stores}
                columns={storeColumns(onNavigateToStore)}
                rowKey="storeId"
                size="small"
                pagination={false}
              />
            ) : (
              <Empty description="소속 매장이 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>

      <IssuePanel
        categories={issues}
        loading={issuesLoading}
        onEquipmentClick={onNavigateToEquipment}
      />

      <Card title="A/S 현황" size="small" loading={asLoading}>
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
                  title={`${item.storeName} — ${item.equipmentName}`}
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
