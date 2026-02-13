import { create } from 'zustand';
import type { User, UserRole } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,

  login: (user, token) =>
    set({
      user,
      token,
      role: user.role,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
    }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),
}));
