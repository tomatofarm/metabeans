import { useQuery } from '@tanstack/react-query';
import {
  mockGetDashboardSummary,
  mockGetIssueList,
  mockGetStoreMapData,
  mockGetStoreDashboard,
  mockGetEquipmentDashboard,
  mockGetEsgSummary,
  mockGetEmergencyAlarms,
} from './mock/dashboard.mock';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => mockGetDashboardSummary(),
    staleTime: 30 * 1000,
  });
}

export function useDashboardIssues() {
  return useQuery({
    queryKey: ['dashboard', 'issues'],
    queryFn: () => mockGetIssueList(),
    staleTime: 30 * 1000,
  });
}

export function useStoreMapData() {
  return useQuery({
    queryKey: ['dashboard', 'storeMap'],
    queryFn: () => mockGetStoreMapData(),
    staleTime: 60 * 1000,
  });
}

export function useStoreDashboard(storeId: number | null) {
  return useQuery({
    queryKey: ['dashboard', 'store', storeId],
    queryFn: () => mockGetStoreDashboard(storeId!),
    enabled: storeId !== null,
    staleTime: 30 * 1000,
  });
}

export function useEquipmentDashboard(equipmentId: number | null) {
  return useQuery({
    queryKey: ['dashboard', 'equipment', equipmentId],
    queryFn: () => mockGetEquipmentDashboard(equipmentId!),
    enabled: equipmentId !== null,
    staleTime: 30 * 1000,
  });
}

export function useEsgSummary() {
  return useQuery({
    queryKey: ['dashboard', 'esg'],
    queryFn: () => mockGetEsgSummary(),
    staleTime: 60 * 1000,
  });
}

export function useEmergencyAlarms() {
  return useQuery({
    queryKey: ['dashboard', 'emergencyAlarms'],
    queryFn: () => mockGetEmergencyAlarms(),
    staleTime: 30 * 1000,
  });
}
