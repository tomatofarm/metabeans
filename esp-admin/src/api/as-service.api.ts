import { useQuery } from '@tanstack/react-query';
import { mockGetASRequests, mockGetASRequest } from './mock/as-service.mock';

export const useASRequests = () => {
  return useQuery({
    queryKey: ['asRequests'],
    queryFn: () => mockGetASRequests(),
    staleTime: 30 * 1000,
  });
};

export const useASRequest = (requestId: string) => {
  return useQuery({
    queryKey: ['asRequest', requestId],
    queryFn: () => mockGetASRequest(requestId),
    enabled: !!requestId,
    staleTime: 30 * 1000,
  });
};
