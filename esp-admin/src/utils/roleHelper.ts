import type { UserRole, FeatureCode } from '../types/auth.types';
import { ROLE_MENU_MAP, ROLE_LABELS } from './constants';

/** 역할별 접근 가능 메뉴 반환 */
export function getMenusByRole(role: UserRole): string[] {
  return ROLE_MENU_MAP[role] || [];
}

/** 역할 한글 라벨 반환 */
export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || role;
}

/** 특정 기능 권한 확인 */
export function hasPermission(
  permissions: FeatureCode[],
  featureCode: FeatureCode
): boolean {
  return permissions.includes(featureCode);
}

/** 특정 메뉴 접근 가능 여부 */
export function canAccessMenu(role: UserRole, menu: string): boolean {
  const menus = getMenusByRole(role);
  return menus.includes(menu);
}
