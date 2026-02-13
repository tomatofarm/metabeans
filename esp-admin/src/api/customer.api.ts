import { useQuery } from '@tanstack/react-query';
import { mockGetStores, mockGetStore } from './mock/customer.mock';

export const useStores = () => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () => mockGetStores(),
    staleTime: 30 * 1000,
  });
};

export const useStore = (storeId: string) => {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: () => mockGetStore(storeId),
    enabled: !!storeId,
    staleTime: 30 * 1000,
  });
};
