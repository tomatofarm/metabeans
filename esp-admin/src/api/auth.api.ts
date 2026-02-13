import type { LoginRequest, LoginResponse } from '../types/auth.types';
import { mockLogin, mockLogout } from './mock/auth.mock';
// Phase 2: import { axiosLogin, axiosLogout } from './real/auth.real';

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return mockLogin(request); // Phase 2: axiosLogin(request)
}

export async function logout(): Promise<void> {
  return mockLogout(); // Phase 2: axiosLogout()
}
