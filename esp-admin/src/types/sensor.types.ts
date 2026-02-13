export type SensorStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface IAQData {
  pm1_0: number;
  pm2_5: number;
  pm4_0: number;
  pm10: number;
  temperature: number;
  humidity: number;
  vocIndex: number | null;
  noxIndex: number | null;
  co2: number;
  o3: number;
  co: number;
  hcho: number;
}

export interface ControllerSensorData {
  controllerId: string;
  timestamp: number;
  pm2_5: number;
  pm10: number;
  diffPressure: number;
  oilLevel: number;
  ppTemp: number;
  ppSpark: number;
  ppPower: number;
  ppAlarm: number;
  fanSpeed: number;
  flow: number;
  damper: number;
  inletTemp: number;
  velocity: number;
  ductDp: number;
  statusFlags: number;
}

export interface EquipmentSensorData {
  equipmentId: string;
  controllers: ControllerSensorData[];
}

export interface GatewaySensorMessage {
  gatewayId: string;
  timestamp: number;
  iaq: IAQData;
  equipments: EquipmentSensorData[];
}

export interface GatewayStatusMessage {
  gatewayId: string;
  statusFlags: number;
  controllerCount: number;
  timestamp: number;
}

export interface GatewaySensorRecord {
  dataId: number;
  gatewayId: number;
  timestamp: number;
  receivedAt: string;
  pm1_0: number;
  pm2_5: number;
  pm4_0: number;
  pm10: number;
  temperature: number;
  humidity: number;
  vocIndex: number | null;
  noxIndex: number | null;
  co2: number;
  o3: number;
  co: number;
  hcho: number;
}

export interface ControllerSensorRecord {
  dataId: number;
  controllerId: number;
  equipmentId: number;
  gatewayId: number;
  timestamp: number;
  receivedAt: string;
  pm2_5: number;
  pm10: number;
  diffPressure: number;
  oilLevel: number;
  ppTemp: number;
  ppSpark: number;
  ppPower: number;
  ppAlarm: number;
  fanSpeed: number;
  flow: number;
  damper: number;
  inletTemp: number;
  velocity: number;
  ductDp: number;
  statusFlags: number;
}

export type AlarmType =
  | 'COMM_ERROR'
  | 'INLET_TEMP_ABNORMAL'
  | 'FILTER_CHECK'
  | 'DUST_REMOVAL_CHECK'
  | 'PP_ALARM';

export type AlarmSeverity = 'YELLOW' | 'RED';

export type AlarmEventStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface AlarmEvent {
  alarmId: number;
  storeId: number;
  gatewayId: number;
  equipmentId: number;
  controllerId: number;
  alarmType: AlarmType;
  severity: AlarmSeverity;
  message: string;
  occurredAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  acknowledgedBy: number | null;
  status: AlarmEventStatus;
}
