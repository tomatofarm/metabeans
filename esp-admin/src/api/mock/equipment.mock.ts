// Equipment mock data - to be populated in equipment management implementation
import type { Equipment } from '@/types/equipment.types';

export async function mockGetEquipments(_storeId?: string): Promise<Equipment[]> {
  return [];
}

export async function mockGetEquipment(_equipmentId: string): Promise<Equipment | null> {
  return null;
}
