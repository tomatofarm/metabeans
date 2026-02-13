// 상태 색상 체계
export const STATUS_COLORS = {
  GOOD: { color: '#52c41a', label: '정상', level: 'green' as const },
  WARNING: { color: '#faad14', label: '주의', level: 'yellow' as const },
  DANGER: { color: '#ff4d4f', label: '위험', level: 'red' as const },
} as const;

export type StatusLevel = 'green' | 'yellow' | 'red';

// IAQ 판단 기준 (환경부 기준)
export const IAQ_THRESHOLDS = {
  pm10: { unit: 'µg/m³', good: 30, moderate: 75, bad: 76 },
  pm25: { unit: 'µg/m³', good: 15, moderate: 35, bad: 36 },
  co2: { unit: 'ppm', good: 700, moderate: 1000, bad: 1001 },
  hcho: { unit: 'ppb', good: 30, moderate: 81, bad: 82 },
  co: { unit: 'ppm', good: 4, moderate: 10, bad: 11 },
} as const;

// 유입온도 기준
export const INLET_TEMP_THRESHOLDS = {
  yellowMin: 70,
  redMin: 100,
} as const;

// 통신 오류 판정 기준 (초)
export const COMM_TIMEOUT_SEC = 30;
export const COMM_ISSUE_YELLOW_SEC = 3600; // 1시간
export const COMM_ISSUE_RED_SEC = 86400; // 1일(하루)

// 센서 데이터 갱신 주기 (ms)
export const SENSOR_INTERVAL_MS = 10000;

// 방화셔터 8단계 매핑
export const DAMPER_STEP_MAP = [
  { step: 0, label: '0단계', opening: 0 },
  { step: 1, label: '1단계', opening: 10 },
  { step: 2, label: '2단계', opening: 25 },
  { step: 3, label: '3단계', opening: 40 },
  { step: 4, label: '4단계', opening: 60 },
  { step: 5, label: '5단계', opening: 75 },
  { step: 6, label: '6단계', opening: 90 },
  { step: 7, label: '7단계', opening: 100 },
] as const;

// 팬 속도 라벨
export const FAN_SPEED_LABELS: Record<number, string> = {
  0: 'OFF',
  1: 'LOW',
  2: 'MID',
  3: 'HIGH',
};

// 역할별 라벨/색상
export const ROLE_CONFIG = {
  ADMIN: { label: '시스템 관리자', color: '#722ed1' },
  DEALER: { label: '대리점', color: '#1890ff' },
  HQ: { label: '매장 본사', color: '#52c41a' },
  OWNER: { label: '매장 점주', color: '#fa8c16' },
} as const;

// A/S 상태 라벨
export const AS_STATUS_LABELS: Record<string, string> = {
  PENDING: '접수대기',
  ACCEPTED: '접수완료',
  ASSIGNED: '배정완료',
  VISIT_SCHEDULED: '방문예정',
  IN_PROGRESS: '처리중',
  COMPLETED: '처리완료',
  CANCELLED: '취소',
};

// 서비스 가능 지역
export const SERVICE_REGIONS = [
  '서울 동부',
  '서울 서부',
  '경기 동부',
  '경기 서부',
  '인천',
  '부산',
  '대구',
  '광주',
  '대전',
  '울산',
  '세종',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
] as const;

// Mock 센서 데이터 범위
export const SENSOR_RANGES = {
  pm25: { min: 5, max: 80, decimals: 1 },
  pm10: { min: 10, max: 100, decimals: 1 },
  diffPressure: { min: 5, max: 50, decimals: 1 },
  oilLevel: { min: 10, max: 90, decimals: 1 },
  ppTemp: { min: 30, max: 70, decimals: 0 },
  ppSpark: { min: 0, max: 99, decimals: 0 },
  ppPower: { values: [0, 1] },
  ppAlarm: { values: [0, 1] },
  fanSpeed: { values: [0, 1, 2, 3] },
  fanMode: { values: [0, 1] },
  damperMode: { values: [0, 1] },
  flow: { min: 300, max: 1200, decimals: 1 },
  damper: { min: 0, max: 100, decimals: 1 },
  inletTemp: { min: 15, max: 50, decimals: 1 },
  velocity: { min: 2, max: 15, decimals: 1 },
  ductDp: { min: 50, max: 500, decimals: 1 },
  statusFlags: { default: 63 },
} as const;
