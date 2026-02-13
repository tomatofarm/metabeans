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
