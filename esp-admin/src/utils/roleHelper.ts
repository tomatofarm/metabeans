import type { UserRole } from '@/types/auth.types';

export type MenuKey = 'dashboard' | 'equipment' | 'as-service' | 'customer' | 'system';

export const ROLE_MENU_MAP: Record<UserRole, MenuKey[]> = {
  ADMIN: ['dashboard', 'equipment', 'as-service', 'customer', 'system'],
  DEALER: ['dashboard', 'equipment', 'as-service'],
  HQ: ['dashboard', 'equipment', 'as-service'],
  OWNER: ['dashboard', 'equipment', 'as-service'],
};

export const MENU_LABELS: Record<MenuKey, string> = {
  dashboard: '대시보드',
  equipment: '장비관리',
  'as-service': 'A/S관리',
  customer: '고객현황',
  system: '시스템관리',
};

export const MENU_PATHS: Record<MenuKey, string> = {
  dashboard: '/dashboard',
  equipment: '/equipment',
  'as-service': '/as-service',
  customer: '/customer',
  system: '/system',
};

/**
 * Check if a role has access to a specific menu
 */
export function hasMenuAccess(role: UserRole, menu: MenuKey): boolean {
  return ROLE_MENU_MAP[role].includes(menu);
}

/**
 * Get all accessible menus for a role
 */
export function getAccessibleMenus(role: UserRole): MenuKey[] {
  return ROLE_MENU_MAP[role];
}

/**
 * Check if a role is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN';
}
