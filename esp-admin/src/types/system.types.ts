import type { UserRole } from './auth.types';

// 기능 코드 (24개)
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
  | 'CONTROL_VELOCITY_TARGET'
  | 'EQUIP_REGISTER'
  | 'CUSTOMER_REGISTER'
  | 'CUSTOMER_FRANCHISE_REG'
  | 'AS_REQUEST'
  | 'AS_ACCEPT'
  | 'AS_REPORT'
  | 'USER_MANAGEMENT'
  | 'APPROVAL_MANAGEMENT'
  | 'THRESHOLD_MANAGEMENT';

// 역할별 기본 권한 (role_permissions 테이블)
export interface RolePermission {
  rolePermissionId: number;
  role: UserRole;
  featureCode: FeatureCode;
  isAllowed: boolean;
}

// 개별 사용자 권한 오버라이드 (user_permission_overrides 테이블)
export interface UserPermissionOverride {
  overrideId: number;
  userId: number;
  featureCode: FeatureCode;
  isAllowed: boolean;
  reason?: string;
  setBy: number;
  createdAt: string;
}

// 청소/필터 판단 기준값 (cleaning_thresholds 테이블)
export interface CleaningThreshold {
  thresholdId: number;
  equipmentId: number;
  sparkThreshold: number;
  sparkTimeWindow: number;
  pressureBase?: number;
  pressureRate: number;
  setBy: number;
  updatedAt: string;
}

// 모니터링 지표 기준값 (monitoring_thresholds 테이블)
export interface MonitoringThreshold {
  thresholdId: number;
  metricName: string;
  yellowMin?: number;
  redMin?: number;
  description?: string;
  setBy: number;
  updatedAt: string;
}

// 알람 심각도
export type AlarmSeverity = 'YELLOW' | 'RED';

// 알람 상태
export type AlarmStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

// 알람 타입
export type AlarmType =
  | 'COMM_ERROR'
  | 'INLET_TEMP_ABNORMAL'
  | 'FILTER_CHECK'
  | 'DUST_REMOVAL_CHECK'
  | 'PP_ALARM';

// 알람 이벤트 (alarm_events 테이블)
export interface AlarmEvent {
  alarmId: number;
  storeId: number;
  gatewayId?: number;
  equipmentId?: number;
  controllerId?: number;
  alarmType: AlarmType;
  severity: AlarmSeverity;
  message?: string;
  occurredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: number;
  resolvedAt?: string;
  status: AlarmStatus;
}

// ESG 지표 (esg_metrics 테이블)
export interface EsgMetric {
  metricId: number;
  storeId: number;
  equipmentId: number;
  date: string;
  oilCollectedVolume?: number;
  wasteOilCollected?: number;
  totalCollected?: number;
  createdAt: string;
}

// 실외 공기질 (outdoor_air_quality 테이블)
export interface OutdoorAirQuality {
  recordId: number;
  stationName: string;
  regionCode: string;
  pm10?: number;
  pm25?: number;
  o3?: number;
  co?: number;
  no2?: number;
  so2?: number;
  overallIndex?: number;
  measuredAt: string;
  fetchedAt: string;
}

// 알림 설정 (notification_settings 테이블)
export interface NotificationSetting {
  settingId: number;
  userId: number;
  alarmType: string;
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
}
