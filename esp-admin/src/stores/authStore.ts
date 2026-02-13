import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, UserRole } from '@/types/auth.types';

interface AuthState {
  /** 현재 로그인된 사용자 */
  user: AuthUser | null;
  /** JWT Access Token */
  accessToken: string | null;
  /** 사용자 역할 (편의 접근) */
  role: UserRole | null;
  /** 인증 여부 */
  isAuthenticated: boolean;

  /** 로그인 처리 */
  login: (user: AuthUser, accessToken: string) => void;
  /** 로그아웃 처리 */
  logout: () => void;
  /** 토큰 갱신 */
  setAccessToken: (token: string) => void;
  /** 사용자 정보 부분 업데이트 */
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      role: null,
      isAuthenticated: false,

      login: (user, accessToken) =>
        set({
          user,
          accessToken,
          role: user.role,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          role: null,
          isAuthenticated: false,
        }),

      setAccessToken: (token) =>
        set({ accessToken: token }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'esp-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
