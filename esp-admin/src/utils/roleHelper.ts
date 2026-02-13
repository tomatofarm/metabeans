import type { UserRole, FeatureCode } from '@/types/auth.types';
import { ROLE_MENU_MAP, ROLE_LABELS } from './constants';

export type MenuKey = 'dashboard' | 'equipment' | 'as-service' | 'customer' | 'system';

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
  const menus = ROLE_MENU_MAP[role];
  return menus ? menus.includes(menu) : false;
}

/**
 * Get all accessible menus for a role
 */
export function getAccessibleMenus(role: UserRole): MenuKey[] {
  return (ROLE_MENU_MAP[role] ?? []) as MenuKey[];
}

/**
 * Get menus by role (alias for getAccessibleMenus)
 */
export function getMenusByRole(role: UserRole): string[] {
  return ROLE_MENU_MAP[role] ?? [];
}

/**
 * Get role label in Korean
 */
export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

/**
 * Check if a specific feature permission is granted
 */
export function hasPermission(
  permissions: FeatureCode[],
  featureCode: FeatureCode
): boolean {
  return permissions.includes(featureCode);
}

/**
 * Check if a role can access a specific menu
 */
export function canAccessMenu(role: UserRole, menu: string): boolean {
  const menus = getMenusByRole(role);
  return menus.includes(menu);
}

/**
 * Check if a role is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN';
}
