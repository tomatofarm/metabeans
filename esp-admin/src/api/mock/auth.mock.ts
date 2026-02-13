import type { LoginRequest, LoginResponse } from '../../types/auth.types';
import { mockUsers, mockDelay } from './common.mock';

/**
 * Mock 로그인
 */
export async function mockLogin(request: LoginRequest): Promise<LoginResponse> {
  const mockUser = mockUsers[request.loginId];

  if (!mockUser || mockUser.password !== request.password) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  return mockDelay({
    accessToken: `mock-token-${mockUser.user.role}-${Date.now()}`,
    user: mockUser.user,
  });
}

/**
 * Mock 로그아웃
 */
export async function mockLogout(): Promise<void> {
  return mockDelay(undefined, 200);
}
