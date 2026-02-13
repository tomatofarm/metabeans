import { Typography, Space, Row, Col, Card, Statistic, Table, Tag, List, Empty } from 'antd';
import {
  ShopOutlined,
  DesktopOutlined,
  ToolOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import {
  useRoleDashboardSummary,
  useRoleDashboardIssues,
  useRoleStoreList,
  useRoleRecentAs,
} from '../../api/dashboard.api';
import type { RoleDashboardSummary, RoleAsRequest } from '../../api/mock/dashboard.mock';
import type { StoreMapItem } from '../../types/dashboard.types';
import IssuePanel from './components/IssuePanel';
import StatusTag from '../../components/common/StatusTag';
import { AS_STATUS_LABELS } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatters';

interface DealerDashboardPageProps {
  onNavigateToStore: (storeId: number) => void;
  onNavigateToEquipment: (equipmentId: number) => void;
}

function DealerSummaryCards({ data, loading }: { data?: RoleDashboardSummary; loading?: boolean }) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={8}>
        <Card loading={loading}>
          <Statistic
            title="관할 매장"
            value={data?.totalStores ?? 0}
            prefix={<ShopOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8}>
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
      <Col xs={24} sm={12} lg={8}>
        <Card loading={loading}>
          <Statistic
            title="미처리 A/S"
            value={data?.pendingAsRequests ?? 0}
            prefix={<ToolOutlined />}
            valueStyle={{ color: data?.pendingAsRequests ? '#faad14' : undefined }}
          />
        </Card>
      </Col>
    </Row>
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

export default function DealerDashboardPage({
  onNavigateToStore,
  onNavigateToEquipment,
}: DealerDashboardPageProps) {
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
          대리점 대시보드
        </Typography.Title>
        <Typography.Text type="secondary">
          관할 매장 현황
        </Typography.Text>
      </div>

      <DealerSummaryCards data={summary} loading={summaryLoading} />

      <IssuePanel
        categories={issues}
        loading={issuesLoading}
        onEquipmentClick={onNavigateToEquipment}
      />

      <Card title="관할 매장 목록" size="small" loading={storesLoading}>
        {stores && stores.length > 0 ? (
          <Table
            dataSource={stores}
            columns={storeColumns(onNavigateToStore)}
            rowKey="storeId"
            size="small"
            pagination={false}
          />
        ) : (
          <Empty description="관할 매장이 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      <Card title="최근 A/S 요청/처리 현황" size="small" loading={asLoading}>
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
