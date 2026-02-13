// 사용자 역할
export type UserRole = 'ADMIN' | 'DEALER' | 'HQ' | 'OWNER';

// 계정 상태
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

// JWT 페이로드
export interface JwtPayload {
  userId: number;
  loginId: string;
  role: UserRole;
  storeIds: number[];
}

// 사용자 기본 정보 (users 테이블)
export interface User {
  userId: number;
  loginId: string;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
  accountStatus: AccountStatus;
  approvedBy?: number;
  approvedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 사업자 정보 (user_business_info 테이블)
export interface UserBusinessInfo {
  userId: number;
  businessName: string;
  businessNumber: string;
  businessCertFile?: string;
  businessCertVerified: boolean;
  address: string;
}

// 대리점 프로필 (dealer_profiles 테이블)
export interface DealerProfile {
  dealerId: number;
  serviceRegions: string[];
  serviceRegionsDetail?: Record<string, string[]>;
  specialties: DealerSpecialties;
}

export interface DealerSpecialties {
  newInstall: boolean;
  repair: boolean;
  cleaning: boolean;
  transport: boolean;
  inspection: boolean;
}

// 프랜차이즈 본사 프로필 (hq_profiles 테이블)
export interface HqProfile {
  hqId: number;
  brandName: string;
  hqName: string;
  businessType?: string;
}

// 매장 점주 프로필 (owner_profiles 테이블)
export interface OwnerProfile {
  ownerId: number;
  storeId?: number;
}

// 로그인 요청/응답
export interface LoginRequest {
  loginId: string;
  password: string;
}

// 로그인 응답용 사용자 정보 (JWT payload + 프로필)
export interface LoginUser {
  userId: number;
  loginId: string;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
  storeIds: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: LoginUser;
}

// 비밀번호 초기화 요청
export interface PasswordResetRequest {
  loginId: string;
  name: string;
  email: string;
}

// 비밀번호 변경 요청
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// 회원가입 요청 (역할별)
export interface RegisterBaseRequest {
  loginId: string;
  password: string;
  name: string;
  phone: string;
  email?: string;
  businessName: string;
  businessNumber: string;
  address: string;
  businessCertFile?: File;
}

export interface RegisterOwnerRequest extends RegisterBaseRequest {
  storeId?: number;
}

export interface RegisterHQRequest extends RegisterBaseRequest {
  brandName: string;
  hqName: string;
  businessType?: string;
}

export interface RegisterAdminRequest extends RegisterBaseRequest {}

export interface RegisterDealerRequest extends RegisterBaseRequest {
  serviceRegions: string[];
  specialties: DealerSpecialties;
}
