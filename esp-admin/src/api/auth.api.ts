import { useQuery, useMutation } from '@tanstack/react-query';
import { mockLogin, mockGetCurrentUser } from './mock/auth.mock';
import type { LoginRequest } from '@/types/auth.types';

export const useLogin = () => {
  return useMutation({
    mutationFn: (req: LoginRequest) => mockLogin(req),
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => mockGetCurrentUser(),
    staleTime: 5 * 60 * 1000,
  });
};
