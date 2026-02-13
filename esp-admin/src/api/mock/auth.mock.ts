import type {
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordChangeRequest,
  PasswordChangeResponse,
  TokenRefreshResponse,
  ApiResponse,
  AuthUser,
  FeatureCode,
} from '../../types/auth.types';

/** 역할별 기본 권한 매핑 */
const ROLE_PERMISSIONS: Record<string, FeatureCode[]> = {
  ADMIN: [
    'DASHBOARD_STORE_COUNT', 'DASHBOARD_AS_REQUEST', 'DASHBOARD_REALTIME_ISSUE',
    'DASHBOARD_IAQ', 'DASHBOARD_OUTDOOR_AIR', 'DASHBOARD_STORE_SEARCH',
    'MONITOR_BASIC_STATUS', 'MONITOR_FILTER_STATUS', 'MONITOR_FIRE_SENSOR',
    'MONITOR_ESG', 'MONITOR_BOARD_TEMP', 'MONITOR_SPARK',
    'CONTROL_POWER', 'CONTROL_DAMPER', 'CONTROL_FAN', 'CONTROL_FLOW_TARGET',
    'EQUIP_REGISTER', 'CUSTOMER_REGISTER', 'CUSTOMER_FRANCHISE_REG',
    'AS_REQUEST', 'AS_ACCEPT', 'AS_REPORT',
    'USER_MANAGEMENT', 'APPROVAL_MANAGEMENT', 'THRESHOLD_MANAGEMENT',
  ],
  DEALER: [
    'DASHBOARD_STORE_COUNT', 'DASHBOARD_AS_REQUEST', 'DASHBOARD_REALTIME_ISSUE',
    'DASHBOARD_IAQ', 'DASHBOARD_OUTDOOR_AIR', 'DASHBOARD_STORE_SEARCH',
    'MONITOR_BASIC_STATUS', 'MONITOR_FILTER_STATUS', 'MONITOR_FIRE_SENSOR',
    'MONITOR_ESG', 'MONITOR_BOARD_TEMP', 'MONITOR_SPARK',
    'EQUIP_REGISTER', 'CUSTOMER_REGISTER', 'CUSTOMER_FRANCHISE_REG',
    'AS_ACCEPT', 'AS_REPORT',
  ],
  HQ: [
    'DASHBOARD_STORE_COUNT', 'DASHBOARD_AS_REQUEST', 'DASHBOARD_REALTIME_ISSUE',
    'DASHBOARD_IAQ', 'DASHBOARD_OUTDOOR_AIR', 'DASHBOARD_STORE_SEARCH',
    'MONITOR_BASIC_STATUS', 'MONITOR_FILTER_STATUS', 'MONITOR_FIRE_SENSOR',
    'MONITOR_ESG', 'MONITOR_BOARD_TEMP', 'MONITOR_SPARK',
    'CUSTOMER_FRANCHISE_REG',
  ],
  OWNER: [
    'DASHBOARD_AS_REQUEST', 'DASHBOARD_REALTIME_ISSUE',
    'DASHBOARD_IAQ', 'DASHBOARD_OUTDOOR_AIR',
    'MONITOR_BASIC_STATUS', 'MONITOR_FILTER_STATUS', 'MONITOR_FIRE_SENSOR',
    'MONITOR_ESG', 'MONITOR_BOARD_TEMP', 'MONITOR_SPARK',
    'CONTROL_POWER', 'CONTROL_DAMPER', 'CONTROL_FAN',
    'CUSTOMER_REGISTER',
    'AS_REQUEST',
  ],
};

/** 테스트 계정 목록 */
const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  admin: {
    password: 'admin123',
    user: {
      userId: 1,
      loginId: 'admin',
      name: '관리자',
      role: 'ADMIN',
      email: 'admin@metabeans.com',
      phone: '010-0000-0000',
      storeIds: [],
      permissions: ROLE_PERMISSIONS.ADMIN,
    },
  },
  dealer01: {
    password: 'dealer123',
    user: {
      userId: 2,
      loginId: 'dealer01',
      name: '박대리점',
      role: 'DEALER',
      email: 'dealer01@dealer.com',
      phone: '010-1111-1111',
      storeIds: [101, 102, 103],
      permissions: ROLE_PERMISSIONS.DEALER,
    },
  },
  hq01: {
    password: 'hq123',
    user: {
      userId: 3,
      loginId: 'hq01',
      name: '김본사',
      role: 'HQ',
      email: 'hq01@franchise.co.kr',
      phone: '010-2222-2222',
      storeIds: [101, 104, 105],
      permissions: ROLE_PERMISSIONS.HQ,
    },
  },
  owner01: {
    password: 'owner123',
    user: {
      userId: 4,
      loginId: 'owner01',
      name: '이점주',
      role: 'OWNER',
      email: 'owner01@store.com',
      phone: '010-3333-3333',
      storeIds: [101],
      permissions: ROLE_PERMISSIONS.OWNER,
    },
  },
};

/** Mock JWT 토큰 생성 */
function generateMockToken(user: AuthUser): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId: user.userId,
      loginId: user.loginId,
      role: user.role,
      storeIds: user.storeIds,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900, // 15분
    })
  );
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

/** 네트워크 지연 시뮬레이션 */
function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** POST /auth/login */
export async function mockLogin(
  request: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  await delay();

  const account = MOCK_USERS[request.loginId];
  if (!account) {
    throw { success: false, error: { code: 'AUTH_UNAUTHORIZED', message: '아이디 또는 비밀번호가 올바르지 않습니다.' } };
  }
  if (account.password !== request.password) {
    throw { success: false, error: { code: 'AUTH_UNAUTHORIZED', message: '아이디 또는 비밀번호가 올바르지 않습니다.' } };
  }

  return {
    success: true,
    data: {
      accessToken: generateMockToken(account.user),
      user: { ...account.user },
    },
  };
}

/** POST /auth/logout */
export async function mockLogout(): Promise<ApiResponse<null>> {
  await delay(200);
  return { success: true, data: null };
}

/** POST /auth/refresh */
export async function mockRefreshToken(): Promise<ApiResponse<TokenRefreshResponse>> {
  await delay(300);

  // Mock: admin 계정으로 토큰 갱신 시뮬레이션
  const adminUser = MOCK_USERS.admin.user;
  return {
    success: true,
    data: {
      accessToken: generateMockToken(adminUser),
    },
  };
}

/** POST /auth/password-reset-request */
export async function mockPasswordResetRequest(
  request: PasswordResetRequest
): Promise<ApiResponse<PasswordResetResponse>> {
  await delay(800);

  // 존재하는 계정인지 확인
  const account = MOCK_USERS[request.loginId];
  if (!account) {
    throw { success: false, error: { code: 'AUTH_UNAUTHORIZED', message: '입력한 정보와 일치하는 계정을 찾을 수 없습니다.' } };
  }

  return {
    success: true,
    data: {
      message: '비밀번호 초기화 요청이 접수되었습니다. 관리자 승인 후 등록된 연락처로 임시 비밀번호가 전달됩니다.',
    },
  };
}

/** PUT /auth/password */
export async function mockPasswordChange(
  request: PasswordChangeRequest
): Promise<ApiResponse<PasswordChangeResponse>> {
  await delay(600);

  const account = MOCK_USERS[request.loginId];
  if (!account) {
    throw { success: false, error: { code: 'AUTH_UNAUTHORIZED', message: '아이디를 확인해주세요.' } };
  }
  if (account.password !== request.currentPassword) {
    throw { success: false, error: { code: 'AUTH_UNAUTHORIZED', message: '현재 비밀번호가 올바르지 않습니다.' } };
  }

  // Mock: 실제 비밀번호 변경은 하지 않음
  return {
    success: true,
    data: {
      message: '비밀번호가 성공적으로 변경되었습니다.',
    },
  };
}
