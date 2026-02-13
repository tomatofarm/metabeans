// A/S service mock data - to be populated in A/S management implementation
import type { ASRequest } from '@/types/as-service.types';

export async function mockGetASRequests(): Promise<ASRequest[]> {
  return [];
}

export async function mockGetASRequest(_requestId: string): Promise<ASRequest | null> {
  return null;
}
