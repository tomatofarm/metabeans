import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { user, token, role, isAuthenticated, login, logout } = useAuthStore();
  return { user, token, role, isAuthenticated, login, logout };
}
