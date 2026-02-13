import { useQuery } from '@tanstack/react-query';
import { mockGetRolePermissions, mockGetPendingApprovals } from './mock/system.mock';

export const useRolePermissions = () => {
  return useQuery({
    queryKey: ['rolePermissions'],
    queryFn: () => mockGetRolePermissions(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => mockGetPendingApprovals(),
    staleTime: 30 * 1000,
  });
};
