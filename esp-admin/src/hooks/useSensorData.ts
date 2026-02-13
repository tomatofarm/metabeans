import { useUIStore } from '@/stores/uiStore';

/**
 * Hook to access sensor data for the selected equipment/controller.
 * Will be connected to TanStack Query in Phase 2.
 */
export function useSensorData() {
  const { selectedStoreId, selectedEquipmentId, selectedControllerId } = useUIStore();

  return {
    selectedStoreId,
    selectedEquipmentId,
    selectedControllerId,
    // Placeholder - will use TanStack Query in Phase 2
    data: null,
    isLoading: false,
    error: null,
  };
}
