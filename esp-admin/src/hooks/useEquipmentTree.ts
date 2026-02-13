import { useUIStore } from '@/stores/uiStore';

/**
 * Hook for equipment tree data.
 * Will be connected to TanStack Query in Phase 2.
 */
export function useEquipmentTree() {
  const { selectedStoreId, selectedEquipmentId, selectedControllerId } = useUIStore();

  return {
    selectedStoreId,
    selectedEquipmentId,
    selectedControllerId,
    // Placeholder - will use TanStack Query in Phase 2
    treeData: [],
    isLoading: false,
    error: null,
  };
}
