import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mockGetASAlerts,
  mockGetASRequests,
  mockCreateASRequest,
  mockGetEquipmentOptionsByStore,
  mockGetASStoreOptions,
} from './mock/as-service.mock';
import type { AlertSeverity, AlertType, ASStatus, Urgency, ASCreateRequest } from '../types/as-service.types';

// 알림 현황 조회
export function useASAlerts(params?: {
  severity?: AlertSeverity;
  alertType?: AlertType;
  storeId?: number;
  isResolved?: boolean;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['as-alerts', params],
    queryFn: () => mockGetASAlerts(params),
    staleTime: 30 * 1000,
  });
}

// A/S 요청 목록 조회
export function useASRequests(params?: {
  status?: ASStatus;
  urgency?: Urgency;
  storeId?: number;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['as-requests', params],
    queryFn: () => mockGetASRequests(params),
    staleTime: 30 * 1000,
  });
}

// A/S 신청
export function useCreateASRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: ASCreateRequest) => mockCreateASRequest(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['as-requests'] });
      queryClient.invalidateQueries({ queryKey: ['as-alerts'] });
    },
  });
}

// 매장 옵션 (A/S 신청 폼용)
export function useASStoreOptions() {
  return useQuery({
    queryKey: ['as-store-options'],
    queryFn: () => mockGetASStoreOptions(),
    staleTime: 5 * 60 * 1000,
  });
}

// 매장별 장비 옵션
export function useASEquipmentOptions(storeId: number | null) {
  return useQuery({
    queryKey: ['as-equipment-options', storeId],
    queryFn: () => mockGetEquipmentOptionsByStore(storeId!),
    enabled: storeId !== null,
    staleTime: 5 * 60 * 1000,
  });
}
