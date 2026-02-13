import type {
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  ChangePasswordRequest,
} from '../../types/auth.types';
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

/**
 * Mock 비밀번호 초기화 요청
 * - 항상 성공 응답 (관리자 승인 후 처리 안내)
 */
export async function mockPasswordResetRequest(
  _request: PasswordResetRequest,
): Promise<{ message: string }> {
  return mockDelay({
    message: '관리자 승인 후 처리됩니다. 최대 24시간 소요됩니다.',
  });
}

/**
 * Mock 비밀번호 변경
 * - currentPassword가 'wrong'이면 실패, 그 외 성공
 */
export async function mockChangePassword(
  request: ChangePasswordRequest,
): Promise<void> {
  if (request.currentPassword === 'wrong') {
    throw new Error('현재 비밀번호가 올바르지 않습니다.');
  }
  return mockDelay(undefined, 300);
}
