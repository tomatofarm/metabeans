import { useMutation, useQuery } from '@tanstack/react-query';
import { mockSendControl, mockGetControlHistory } from './mock/control.mock';

export const useSendControl = () => {
  return useMutation({
    mutationFn: mockSendControl,
  });
};

export const useControlHistory = (equipmentId: string) => {
  return useQuery({
    queryKey: ['controlHistory', equipmentId],
    queryFn: () => mockGetControlHistory(equipmentId),
    enabled: !!equipmentId,
    staleTime: 30 * 1000,
  });
};
