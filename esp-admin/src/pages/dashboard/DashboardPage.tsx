import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import AdminDashboardPage from './AdminDashboardPage';
import DealerDashboardPage from './DealerDashboardPage';
import HQDashboardPage from './HQDashboardPage';
import OwnerDashboardPage from './OwnerDashboardPage';
import StoreDashboardPage from './StoreDashboardPage';
import EquipmentDashboardPage from './EquipmentDashboardPage';

export default function DashboardPage() {
  const {
    selectedStoreId,
    selectedEquipmentId,
    selectStore,
    selectEquipment,
  } = useUiStore();

  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'ADMIN';

  const handleNavigateToStore = (storeId: number) => {
    selectStore(storeId);
  };

  const handleNavigateToEquipment = (equipmentId: number) => {
    selectEquipment(equipmentId);
  };

  // Equipment selected → show equipment dashboard (all roles)
  if (selectedEquipmentId) {
    return <EquipmentDashboardPage equipmentId={selectedEquipmentId} />;
  }

  // Store selected → show store dashboard (all roles)
  if (selectedStoreId) {
    return (
      <StoreDashboardPage
        storeId={selectedStoreId}
        onEquipmentClick={handleNavigateToEquipment}
      />
    );
  }

  // No selection → show role-specific overview dashboard
  switch (role) {
    case 'DEALER':
      return (
        <DealerDashboardPage
          onNavigateToStore={handleNavigateToStore}
          onNavigateToEquipment={handleNavigateToEquipment}
        />
      );
    case 'HQ':
      return (
        <HQDashboardPage
          onNavigateToStore={handleNavigateToStore}
          onNavigateToEquipment={handleNavigateToEquipment}
        />
      );
    case 'OWNER':
      return (
        <OwnerDashboardPage
          onNavigateToEquipment={handleNavigateToEquipment}
        />
      );
    default:
      return (
        <AdminDashboardPage
          onNavigateToStore={handleNavigateToStore}
          onNavigateToEquipment={handleNavigateToEquipment}
        />
      );
  }
}
