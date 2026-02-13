import { useAuthStore } from '@/stores/authStore';
import { hasMenuAccess, isAdmin } from '@/utils/roleHelper';
import type { MenuKey } from '@/utils/roleHelper';

export function useRole() {
  const role = useAuthStore((state) => state.role);

  return {
    role,
    isAdmin: role ? isAdmin(role) : false,
    canAccess: (menu: MenuKey) => (role ? hasMenuAccess(role, menu) : false),
  };
}
