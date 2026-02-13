import { useQuery } from '@tanstack/react-query';
import { mockGetSensorData, mockGetSensorHistory } from './mock/monitoring.mock';

export const useSensorData = (equipmentId: string) => {
  return useQuery({
    queryKey: ['sensorData', equipmentId],
    queryFn: () => mockGetSensorData(equipmentId),
    enabled: !!equipmentId,
    refetchInterval: 10 * 1000,
  });
};

export const useSensorHistory = (equipmentId: string, from: number, to: number) => {
  return useQuery({
    queryKey: ['sensorHistory', equipmentId, from, to],
    queryFn: () => mockGetSensorHistory(equipmentId, from, to),
    enabled: !!equipmentId,
    staleTime: 60 * 1000,
  });
};
