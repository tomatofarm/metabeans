// System management mock data - to be populated in system management implementation
import type { RolePermission } from '@/types/system.types';

export async function mockGetRolePermissions(): Promise<RolePermission[]> {
  return [];
}

export async function mockGetPendingApprovals() {
  return [];
}
