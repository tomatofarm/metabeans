import { create } from 'zustand';

interface UiState {
  /** 사이드바 열림 여부 */
  sidebarCollapsed: boolean;
  /** 선택된 매장 ID */
  selectedStoreId: number | null;
  /** 선택된 장비 ID */
  selectedEquipmentId: number | null;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedStoreId: (storeId: number | null) => void;
  setSelectedEquipmentId: (equipmentId: number | null) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarCollapsed: false,
  selectedStoreId: null,
  selectedEquipmentId: null,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),
  setSelectedStoreId: (storeId) =>
    set({ selectedStoreId: storeId }),
  setSelectedEquipmentId: (equipmentId) =>
    set({ selectedEquipmentId: equipmentId }),
}));
