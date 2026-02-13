import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/auth.types';

interface AuthState {
  /** 현재 로그인된 사용자 */
  user: AuthUser | null;
  /** JWT Access Token */
  accessToken: string | null;
  /** 인증 여부 */
  isAuthenticated: boolean;

  /** 로그인 처리 */
  login: (user: AuthUser, accessToken: string) => void;
  /** 로그아웃 처리 */
  logout: () => void;
  /** 토큰 갱신 */
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      setAccessToken: (token) =>
        set({ accessToken: token }),
    }),
    {
      name: 'esp-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
