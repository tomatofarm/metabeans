import { useQuery } from '@tanstack/react-query';
import { mockGetEquipments, mockGetEquipment } from './mock/equipment.mock';

export const useEquipments = (storeId?: string) => {
  return useQuery({
    queryKey: ['equipments', storeId],
    queryFn: () => mockGetEquipments(storeId),
    staleTime: 30 * 1000,
  });
};

export const useEquipment = (equipmentId: string) => {
  return useQuery({
    queryKey: ['equipment', equipmentId],
    queryFn: () => mockGetEquipment(equipmentId),
    enabled: !!equipmentId,
    staleTime: 30 * 1000,
  });
};
