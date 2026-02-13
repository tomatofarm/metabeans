export type UserRole = 'ADMIN' | 'DEALER' | 'HQ' | 'OWNER';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface User {
  userId: number;
  loginId: string;
  role: UserRole;
  name: string;
  phone: string;
  email: string;
  accountStatus: AccountStatus;
  approvedBy: number | null;
  approvedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserBusinessInfo {
  userId: number;
  businessName: string;
  businessNumber: string;
  businessCertFile: string | null;
  businessCertVerified: boolean;
  address: string;
}

export interface DealerProfile {
  dealerId: number;
  serviceRegions: ServiceRegion[];
  serviceRegionsDetail: Record<string, string> | null;
  specialties: DealerSpecialties;
}

export type ServiceRegion =
  | '서울 동부'
  | '서울 서부'
  | '경기 동부'
  | '경기 서부'
  | '인천'
  | '강원'
  | '충북'
  | '충남'
  | '대전'
  | '세종'
  | '전북'
  | '전남'
  | '광주'
  | '경북'
  | '경남'
  | '대구'
  | '울산'
  | '부산'
  | '제주';

export interface DealerSpecialties {
  newInstall: boolean;
  repair: boolean;
  cleaning: boolean;
  transport: boolean;
  inspection: boolean;
}

export interface HqProfile {
  hqId: number;
  brandName: string;
  hqName: string;
  businessType: string | null;
}

export interface OwnerProfile {
  ownerId: number;
  storeId: number | null;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface JWTPayload {
  userId: number;
  loginId: string;
  role: UserRole;
  storeIds: number[];
  iat: number;
  exp: number;
}

export interface RegisterRequest {
  loginId: string;
  password: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  businessInfo?: UserBusinessInfo;
  dealerProfile?: Omit<DealerProfile, 'dealerId'>;
  hqProfile?: Omit<HqProfile, 'hqId'>;
  ownerProfile?: Omit<OwnerProfile, 'ownerId'>;
}
