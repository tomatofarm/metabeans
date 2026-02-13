export const STATUS_COLORS = {
  GOOD: { color: '#52c41a', label: '정상', level: 'green' as const },
  WARNING: { color: '#faad14', label: '주의', level: 'yellow' as const },
  DANGER: { color: '#ff4d4f', label: '위험', level: 'red' as const },
} as const;

export type StatusLevel = 'green' | 'yellow' | 'red';

export const STATUS_LEVEL_PRIORITY: Record<StatusLevel, number> = {
  green: 0,
  yellow: 1,
  red: 2,
};

// IAQ thresholds: [green max, yellow max] (above yellow max = red)
export const IAQ_THRESHOLDS = {
  pm10: { unit: 'µg/m³', greenMax: 30, yellowMax: 75 },
  pm2_5: { unit: 'µg/m³', greenMax: 15, yellowMax: 35 },
  co2: { unit: 'ppm', greenMax: 700, yellowMax: 1000 },
  hcho: { unit: 'ppb', greenMax: 30, yellowMax: 81 },
  co: { unit: 'ppm', greenMax: 4, yellowMax: 10 },
} as const;

// Inlet temperature thresholds
export const INLET_TEMP_THRESHOLDS = {
  yellowMin: 70,
  redMin: 100,
} as const;

// Communication error thresholds (in milliseconds)
export const COMM_ERROR_THRESHOLDS = {
  offlineSeconds: 30,
  yellowMs: 60 * 60 * 1000,        // 1 hour
  redMs: 24 * 60 * 60 * 1000,      // 1 day
} as const;

// Damper 8-step (0~7) opening rate mapping
export const DAMPER_STEP_MAP: Record<number, number> = {
  0: 0,
  1: 10,
  2: 25,
  3: 40,
  4: 60,
  5: 75,
  6: 90,
  7: 100,
};

// Fan speed labels
export const FAN_SPEED_LABELS: Record<number, string> = {
  0: 'OFF',
  1: 'LOW',
  2: 'MID',
  3: 'HIGH',
};

// Service regions (v3.0: added Seoul east/west, Gyeonggi east/west)
export const SERVICE_REGIONS = [
  '서울 동부',
  '서울 서부',
  '경기 동부',
  '경기 서부',
  '인천',
  '강원',
  '충북',
  '충남',
  '대전',
  '세종',
  '전북',
  '전남',
  '광주',
  '경북',
  '경남',
  '대구',
  '울산',
  '부산',
  '제주',
] as const;

// Business types
export const BUSINESS_TYPES = ['튀김', '굽기', '볶음', '복합', '커피로스팅'] as const;

// User role labels
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: '시스템 관리자',
  DEALER: '대리점',
  HQ: '매장 본사',
  OWNER: '매장 점주',
};

// A/S status labels
export const AS_STATUS_LABELS: Record<string, string> = {
  PENDING: '대기',
  ACCEPTED: '접수완료',
  ASSIGNED: '배정완료',
  VISIT_SCHEDULED: '방문예정',
  IN_PROGRESS: '처리중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

// A/S issue type labels
export const ISSUE_TYPE_LABELS: Record<string, string> = {
  MALFUNCTION: '고장',
  CLEANING: '청소',
  REPLACEMENT: '교체',
  INSPECTION: '점검',
  OTHER: '기타',
};

// Equipment status labels
export const EQUIPMENT_STATUS_LABELS: Record<string, string> = {
  NORMAL: '정상',
  INSPECTION: '점검중',
  CLEANING: '청소중',
  INACTIVE: '비활성',
};

// Gateway status flags bit positions
export const GW_STATUS_FLAGS = {
  SEN55: 0,       // PM, temperature, humidity, VOC, NOx
  SCD40: 1,       // CO2
  SEN0321: 2,     // O3
  SEN0466: 3,     // CO
  SFA30: 4,       // HCHO
  CTRL_CONN: 5,   // ≥1 controller connected
  PAIRING: 6,     // Pairing mode
} as const;

// Controller status flags bit positions
export const CTRL_STATUS_FLAGS = {
  RS485: 0,       // RS-485 communication OK
  SPS30: 1,       // PM2.5 sensor OK
  SDP810: 2,      // Pressure sensor OK
  WATER_LEVEL: 3, // Water level sensor OK
  FLO_OAC: 4,     // Damper controller OK
  LS_M100: 5,     // Inverter OK
} as const;
