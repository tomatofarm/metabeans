import { useMutation } from '@tanstack/react-query';
import {
  mockLogin,
  mockLogout,
  mockRefreshToken,
  mockPasswordResetRequest,
  mockPasswordChange,
} from './mock/auth.mock';
import type {
  LoginRequest,
  PasswordResetRequest,
  PasswordChangeRequest,
} from '../types/auth.types';

/** 로그인 */
export const useLogin = () => {
  return useMutation({
    mutationFn: (request: LoginRequest) => mockLogin(request),
  });
};

/** 로그아웃 */
export const useLogout = () => {
  return useMutation({
    mutationFn: () => mockLogout(),
  });
};

/** 토큰 갱신 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => mockRefreshToken(),
  });
};

/** 비밀번호 초기화 요청 */
export const usePasswordFind = () => {
  return useMutation({
    mutationFn: (request: PasswordResetRequest) =>
      mockPasswordResetRequest(request),
  });
};

/** 비밀번호 변경 */
export const usePasswordChange = () => {
  return useMutation({
    mutationFn: (request: PasswordChangeRequest) =>
      mockPasswordChange(request),
  });
};
