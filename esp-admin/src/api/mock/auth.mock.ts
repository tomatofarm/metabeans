import type { LoginRequest, LoginResponse, User } from '@/types/auth.types';

const mockUsers: User[] = [
  {
    userId: 1,
    loginId: 'admin',
    role: 'ADMIN',
    name: '관리자',
    phone: '010-1234-5678',
    email: 'admin@metabeans.co.kr',
    accountStatus: 'ACTIVE',
    approvedBy: null,
    approvedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-01T09:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
  },
  {
    userId: 2,
    loginId: 'dealer01',
    role: 'DEALER',
    name: '김대리점',
    phone: '010-2345-6789',
    email: 'dealer01@metabeans.co.kr',
    accountStatus: 'ACTIVE',
    approvedBy: 1,
    approvedAt: '2024-02-01T00:00:00Z',
    lastLoginAt: '2024-12-01T10:00:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    userId: 3,
    loginId: 'hq01',
    role: 'HQ',
    name: '이본사',
    phone: '010-3456-7890',
    email: 'hq01@metabeans.co.kr',
    accountStatus: 'ACTIVE',
    approvedBy: 1,
    approvedAt: '2024-03-01T00:00:00Z',
    lastLoginAt: '2024-12-01T11:00:00Z',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-12-01T11:00:00Z',
  },
  {
    userId: 4,
    loginId: 'owner01',
    role: 'OWNER',
    name: '박점주',
    phone: '010-4567-8901',
    email: 'owner01@metabeans.co.kr',
    accountStatus: 'ACTIVE',
    approvedBy: 1,
    approvedAt: '2024-04-01T00:00:00Z',
    lastLoginAt: '2024-12-01T12:00:00Z',
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-12-01T12:00:00Z',
  },
];

export async function mockLogin(req: LoginRequest): Promise<LoginResponse> {
  const user = mockUsers.find((u) => u.loginId === req.loginId);
  if (!user) throw new Error('사용자를 찾을 수 없습니다.');
  return { accessToken: 'mock-jwt-token', user };
}

export async function mockGetCurrentUser(): Promise<User> {
  return mockUsers[0]!;
}

export async function mockGetUsers(): Promise<User[]> {
  return mockUsers;
}
