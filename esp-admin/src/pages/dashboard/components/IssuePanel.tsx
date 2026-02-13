import type { ReactNode } from 'react';
import { Card, Table, Tag, Badge, Collapse, Space, Typography, Empty } from 'antd';
import {
  WifiOutlined,
  FireOutlined,
  FilterOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import type { DashboardIssueCategory, DashboardIssueItem, DashboardIssueType } from '../../../types/dashboard.types';
import { getStatusConfig } from '../../../utils/statusHelper';
import { formatRelativeTime } from '../../../utils/formatters';

const { Text } = Typography;

interface IssuePanelProps {
  categories?: DashboardIssueCategory[];
  loading?: boolean;
  onEquipmentClick?: (equipmentId: number) => void;
}

const ISSUE_ICONS: Record<DashboardIssueType, ReactNode> = {
  COMM_ERROR: <WifiOutlined />,
  INLET_TEMP: <FireOutlined />,
  FILTER_CHECK: <FilterOutlined />,
  DUST_REMOVAL: <CloudOutlined />,
};

const columns = (onEquipmentClick?: (id: number) => void) => [
  {
    title: '매장',
    dataIndex: 'storeName',
    key: 'storeName',
    width: 100,
  },
  {
    title: '장비',
    dataIndex: 'equipmentName',
    key: 'equipmentName',
    width: 160,
    render: (text: string, record: DashboardIssueItem) => (
      <a onClick={() => onEquipmentClick?.(record.equipmentId)}>{text}</a>
    ),
  },
  {
    title: '컨트롤러',
    dataIndex: 'controllerName',
    key: 'controllerName',
    width: 100,
    render: (text: string | undefined) => text ?? '-',
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

function CategoryHeader({ category }: { category: DashboardIssueCategory }) {
  const total = category.items.length;
  return (
    <Space>
      {ISSUE_ICONS[category.type]}
      <Text strong>{category.label}</Text>
      <Text type="secondary" style={{ fontSize: 12 }}>
        ({category.description})
      </Text>
      {category.redCount > 0 && (
        <Badge count={category.redCount} style={{ backgroundColor: '#ff4d4f' }} />
      )}
      {category.yellowCount > 0 && (
        <Badge count={category.yellowCount} style={{ backgroundColor: '#faad14' }} />
      )}
      {total === 0 && (
        <Tag color="green">이상 없음</Tag>
      )}
    </Space>
  );
}

export default function IssuePanel({ categories, loading, onEquipmentClick }: IssuePanelProps) {
  if (!categories || categories.length === 0) {
    return (
      <Card title="문제 발생 이슈" loading={loading}>
        <Empty description="이슈 없음" />
      </Card>
    );
  }

  const items = categories.map((cat) => ({
    key: cat.type,
    label: <CategoryHeader category={cat} />,
    children:
      cat.items.length > 0 ? (
        <Table
          dataSource={cat.items}
          columns={columns(onEquipmentClick)}
          rowKey="issueId"
          size="small"
          pagination={false}
        />
      ) : (
        <Text type="secondary">해당 이슈가 없습니다.</Text>
      ),
  }));

  return (
    <Card
      title="문제 발생 이슈"
      loading={loading}
      styles={{ body: { padding: '0 0 8px' } }}
    >
      <Collapse
        items={items}
        defaultActiveKey={categories.filter((c) => c.items.length > 0).map((c) => c.type)}
        ghost
      />
    </Card>
  );
}
