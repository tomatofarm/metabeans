import { useMutation } from '@tanstack/react-query';
import type {
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  ChangePasswordRequest,
} from '../types/auth.types';
import {
  mockLogin,
  mockLogout,
  mockPasswordResetRequest,
  mockChangePassword,
} from './mock/auth.mock';
// Phase 2: import { axiosLogin, axiosLogout, ... } from './real/auth.real';

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return mockLogin(request); // Phase 2: axiosLogin(request)
}

export async function logout(): Promise<void> {
  return mockLogout(); // Phase 2: axiosLogout()
}

export async function passwordResetRequest(
  request: PasswordResetRequest,
): Promise<{ message: string }> {
  return mockPasswordResetRequest(request); // Phase 2: axiosPasswordResetRequest(request)
}

export async function changePassword(
  request: ChangePasswordRequest,
): Promise<void> {
  return mockChangePassword(request); // Phase 2: axiosChangePassword(request)
}

// TanStack Query Hooks

export function useLogin() {
  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => logout(),
  });
}

export function usePasswordResetRequest() {
  return useMutation({
    mutationFn: (request: PasswordResetRequest) => passwordResetRequest(request),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (request: ChangePasswordRequest) => changePassword(request),
  });
}
