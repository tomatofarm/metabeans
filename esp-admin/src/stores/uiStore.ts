import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  selectedStoreId: number | null;
  selectedEquipmentId: number | null;
  selectedControllerId: number | null;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectStore: (storeId: number | null) => void;
  selectEquipment: (equipmentId: number | null) => void;
  selectController: (controllerId: number | null) => void;
  setSelectedStoreId: (storeId: number | null) => void;
  setSelectedEquipmentId: (equipmentId: number | null) => void;
  clearSelection: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  selectedStoreId: null,
  selectedEquipmentId: null,
  selectedControllerId: null,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  selectStore: (storeId) =>
    set({
      selectedStoreId: storeId,
      selectedEquipmentId: null,
      selectedControllerId: null,
    }),

  selectEquipment: (equipmentId) =>
    set({
      selectedEquipmentId: equipmentId,
      selectedControllerId: null,
    }),

  selectController: (controllerId) =>
    set({ selectedControllerId: controllerId }),

  setSelectedStoreId: (storeId) =>
    set({ selectedStoreId: storeId }),

  setSelectedEquipmentId: (equipmentId) =>
    set({ selectedEquipmentId: equipmentId }),

  clearSelection: () =>
    set({
      selectedStoreId: null,
      selectedEquipmentId: null,
      selectedControllerId: null,
    }),
}));

// Alias for backward compatibility
export const useUiStore = useUIStore;
