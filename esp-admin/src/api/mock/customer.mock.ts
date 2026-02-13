// Customer mock data - to be populated in customer management implementation
import type { Store } from '@/types/store.types';

export async function mockGetStores(): Promise<Store[]> {
  return [];
}

export async function mockGetStore(_storeId: string): Promise<Store | null> {
  return null;
}
