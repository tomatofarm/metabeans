import { useQuery } from '@tanstack/react-query';
import { mockGetDashboardSummary, mockGetDashboardIssues, mockGetEmergencyAlarms } from './mock/dashboard.mock';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => mockGetDashboardSummary(),
    staleTime: 30 * 1000,
  });
};

export const useDashboardIssues = () => {
  return useQuery({
    queryKey: ['dashboardIssues'],
    queryFn: () => mockGetDashboardIssues(),
    staleTime: 30 * 1000,
  });
};

export const useEmergencyAlarms = () => {
  return useQuery({
    queryKey: ['emergencyAlarms'],
    queryFn: () => mockGetEmergencyAlarms(),
    staleTime: 10 * 1000,
  });
};
