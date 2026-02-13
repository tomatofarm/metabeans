import type { UserRole } from './auth.types';

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

export interface RolePermission {
  rolePermissionId: number;
  role: UserRole;
  featureCode: FeatureCode;
  isAllowed: boolean;
}

export interface UserPermissionOverride {
  overrideId: number;
  userId: number;
  featureCode: FeatureCode;
  isAllowed: boolean;
  reason: string;
  setBy: number;
  createdAt: string;
}

export interface CleaningThreshold {
  thresholdId: number;
  equipmentId: number;
  sparkThreshold: number;
  sparkTimeWindow: number;
  pressureBase: number;
  pressureRate: number;
  setBy: number;
  updatedAt: string;
}

export interface MonitoringThreshold {
  thresholdId: number;
  metricName: string;
  yellowMin: number;
  redMin: number;
  description: string;
  setBy: number;
  updatedAt: string;
}

export interface DamperAutoSettingSystem {
  settingId: number;
  equipmentId: number;
  controllerId: number | null;
  controlMode: 'AUTO' | 'MANUAL';
  targetFlow: number;
  setBy: number;
  updatedAt: string;
}

export interface ConsumableSchedule {
  scheduleId: number;
  equipmentId: number;
  consumableType: string;
  replacementCycleDays: number;
  lastReplacedAt: string;
  nextDueDate: string;
  alertDaysBefore: number;
  createdAt: string;
}

export interface NotificationSetting {
  settingId: number;
  userId: number;
  alarmType: string;
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
}

export interface EsgMetric {
  metricId: number;
  storeId: number;
  equipmentId: number;
  date: string;
  oilCollectedVolume: number;
  wasteOilCollected: number;
  totalCollected: number;
  createdAt: string;
}

export interface OutdoorAirQuality {
  recordId: number;
  stationName: string;
  regionCode: string;
  pm10: number;
  pm2_5: number;
  o3: number;
  co: number;
  no2: number;
  so2: number;
  overallIndex: number;
  measuredAt: string;
  fetchedAt: string;
}

// Common API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
