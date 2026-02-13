import { useUiStore } from '../../stores/uiStore';
import AdminDashboardPage from './AdminDashboardPage';
import StoreDashboardPage from './StoreDashboardPage';
import EquipmentDashboardPage from './EquipmentDashboardPage';

export default function DashboardPage() {
  const {
    selectedStoreId,
    selectedEquipmentId,
    selectStore,
    selectEquipment,
  } = useUiStore();

  const handleNavigateToStore = (storeId: number) => {
    selectStore(storeId);
  };

  const handleNavigateToEquipment = (equipmentId: number) => {
    selectEquipment(equipmentId);
  };

  // Equipment selected → show equipment dashboard
  if (selectedEquipmentId) {
    return <EquipmentDashboardPage equipmentId={selectedEquipmentId} />;
  }

  // Store selected → show store dashboard
  if (selectedStoreId) {
    return (
      <StoreDashboardPage
        storeId={selectedStoreId}
        onEquipmentClick={handleNavigateToEquipment}
      />
    );
  }

  // No selection → show admin overview dashboard
  return (
    <AdminDashboardPage
      onNavigateToStore={handleNavigateToStore}
      onNavigateToEquipment={handleNavigateToEquipment}
    />
  );
}
