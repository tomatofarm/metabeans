/** 사용자 역할 */
export type UserRole = 'ADMIN' | 'DEALER' | 'HQ' | 'OWNER';

/** 계정 상태 */
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

/** 권한 Feature Code (24개) */
export type FeatureCode =
  | 'DASHBOARD_STORE_COUNT'
  | 'DASHBOARD_AS_REQUEST'
  | 'DASHBOARD_REALTIME_ISSUE'
  | 'DASHBOARD_IAQ'
  | 'DASHBOARD_OUTDOOR_AIR'
  | 'DASHBOARD_STORE_SEARCH'
  | 'MONITOR_BASIC_STATUS'
  | 'MONITOR_FILTER_STATUS'
  | 'MONITOR_FIRE_SENSOR'
  | 'MONITOR_ESG'
  | 'MONITOR_BOARD_TEMP'
  | 'MONITOR_SPARK'
  | 'CONTROL_POWER'
  | 'CONTROL_DAMPER'
  | 'CONTROL_FAN'
  | 'CONTROL_FLOW_TARGET'
  | 'EQUIP_REGISTER'
  | 'CUSTOMER_REGISTER'
  | 'CUSTOMER_FRANCHISE_REG'
  | 'AS_REQUEST'
  | 'AS_ACCEPT'
  | 'AS_REPORT'
  | 'USER_MANAGEMENT'
  | 'APPROVAL_MANAGEMENT'
  | 'THRESHOLD_MANAGEMENT';

/** DB users 테이블 기반 사용자 정보 (관리/목록용) */
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

/** 로그인 사용자 정보 (JWT 디코드 + 서버 응답) */
export interface AuthUser {
  userId: number;
  loginId: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  storeIds: number[];
  permissions: FeatureCode[];
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

/** 로그인 요청 */
export interface LoginRequest {
  loginId: string;
  password: string;
}

/** 로그인 응답 */
export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

/** JWT Payload */
export interface JWTPayload {
  userId: number;
  loginId: string;
  role: UserRole;
  storeIds: number[];
  iat: number;
  exp: number;
}

/** 비밀번호 초기화 요청 */
export interface PasswordResetRequest {
  loginId: string;
  name: string;
  phone: string;
  email?: string;
  reason?: string;
}

/** 비밀번호 초기화 요청 응답 */
export interface PasswordResetResponse {
  message: string;
}

/** 비밀번호 변경 요청 */
export interface PasswordChangeRequest {
  loginId: string;
  currentPassword: string;
  newPassword: string;
}

/** 비밀번호 변경 응답 */
export interface PasswordChangeResponse {
  message: string;
}

/** 토큰 갱신 응답 */
export interface TokenRefreshResponse {
  accessToken: string;
}

/** 회원가입 요청 */
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

/** API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
}
