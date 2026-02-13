/** 상태 색상 체계 */
export const STATUS_COLORS = {
  GOOD: { color: '#52c41a', label: '정상', level: 'green' },
  WARNING: { color: '#faad14', label: '주의', level: 'yellow' },
  DANGER: { color: '#ff4d4f', label: '위험', level: 'red' },
} as const;

/** 역할별 메뉴 접근 */
export const ROLE_MENU_MAP: Record<string, string[]> = {
  ADMIN: ['dashboard', 'equipment', 'as-service', 'customer', 'system'],
  DEALER: ['dashboard', 'equipment', 'as-service'],
  HQ: ['dashboard', 'equipment', 'as-service'],
  OWNER: ['dashboard', 'equipment', 'as-service'],
};

/** 역할 한글 라벨 */
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: '시스템 관리자',
  DEALER: '대리점',
  HQ: '매장 본사',
  OWNER: '매장 점주',
};

/** 비밀번호 규칙 */
export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true,
} as const;
