import { Typography, Space } from 'antd';
import {
  useDashboardSummary,
  useDashboardIssues,
  useStoreMapData,
  useEsgSummary,
} from '../../api/dashboard.api';
import { useUiStore } from '../../stores/uiStore';
import SummaryCards from './components/SummaryCards';
import IssuePanel from './components/IssuePanel';
import EsgSummaryCard from './components/EsgSummaryCard';
import StoreMap from './components/StoreMap';

interface AdminDashboardPageProps {
  onNavigateToStore: (storeId: number) => void;
  onNavigateToEquipment: (equipmentId: number) => void;
}

export default function AdminDashboardPage({
  onNavigateToStore,
  onNavigateToEquipment,
}: AdminDashboardPageProps) {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: issues, isLoading: issuesLoading } = useDashboardIssues();
  const { data: storeMap, isLoading: mapLoading } = useStoreMapData();
  const { data: esg, isLoading: esgLoading } = useEsgSummary();

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        전체 현황 대시보드
      </Typography.Title>

      <SummaryCards data={summary} loading={summaryLoading} />

      <IssuePanel
        categories={issues}
        loading={issuesLoading}
        onEquipmentClick={onNavigateToEquipment}
      />

      <EsgSummaryCard data={esg} loading={esgLoading} />

      <StoreMap
        stores={storeMap}
        loading={mapLoading}
        onStoreClick={onNavigateToStore}
      />
    </Space>
  );
}
