// 컨트롤러 센서 데이터 (controller_sensor_data 테이블 + MQTT 필드)
export interface ControllerSensorData {
  dataId?: number;
  controllerId: string;
  equipmentId?: number;
  gatewayId?: number;
  timestamp: number;
  receivedAt?: string;
  pm25: number;
  pm10: number;
  diffPressure: number;
  oilLevel: number;
  ppTemp: number;
  ppSpark: number;
  ppPower: number;
  ppAlarm: number;
  fanSpeed: number;
  fanMode: number;
  damperMode: number;
  flow: number;
  damper: number;
  inletTemp: number;
  velocity: number;
  ductDp: number;
  statusFlags: number;
}

// 게이트웨이 IAQ 센서 데이터 (gateway_sensor_data 테이블)
export interface GatewaySensorData {
  dataId?: number;
  gatewayId: number;
  timestamp: number;
  receivedAt?: string;
  pm10: number;
  pm25: number;
  pm40: number;
  pm100: number;
  temperature: number;
  humidity: number;
  vocIndex: number | null;
  noxIndex: number | null;
  co2: number;
  o3: number;
  co: number;
  hcho: number;
}

// MQTT sensor 메시지 구조 (통합)
export interface MqttSensorMessage {
  gatewayId: string;
  timestamp: number;
  iaq: {
    pm1_0: number;
    pm2_5: number;
    pm4_0: number;
    pm10: number;
    temperature: number;
    humidity: number;
    voc_index: number | null;
    nox_index: number | null;
    co2: number;
    o3: number;
    co: number;
    hcho: number;
  };
  equipments: Array<{
    equipment_id: string;
    controllers: Array<{
      controller_id: string;
      timestamp: number;
      pm2_5: number;
      pm10: number;
      diff_pressure: number;
      oil_level: number;
      pp_temp: number;
      pp_spark: number;
      pp_power: number;
      pp_alarm: number;
      fan_speed: number;
      fan_mode: number;
      damper_mode: number;
      flow: number;
      damper: number;
      inlet_temp: number;
      velocity: number;
      duct_dp: number;
      status_flags: number;
    }>;
  }>;
}

// MQTT status 메시지 구조
export interface MqttStatusMessage {
  gateway_id: string;
  status_flags: number;
  controller_count: number;
  timestamp: number;
}

// Mock 센서 데이터 범위
export interface SensorRange {
  min: number;
  max: number;
  decimals: number;
}

export interface SensorDiscreteRange {
  values: number[];
}

// 실시간 모니터링용 컨트롤러 상태
export interface RealtimeControllerData {
  controllerId: number;
  controllerName: string;
  connectionStatus: 'ONLINE' | 'OFFLINE';
  lastSeenAt: string;
  sensorData: ControllerSensorData;
}

// 실시간 모니터링 장비 데이터 (equipment 단위)
export interface RealtimeMonitoringData {
  equipmentId: number;
  equipmentName: string;
  modelName: string;
  storeName: string;
  connectionStatus: 'ONLINE' | 'OFFLINE';
  controllers: RealtimeControllerData[];
}

// 센서 이력 차트 데이터 포인트 (확장)
export interface SensorHistoryDataPoint {
  timestamp: number;
  controllerId: string;
  controllerName: string;
  ppTemp: number;
  ppSpark: number;
  pm25: number;
  pm10: number;
  diffPressure: number;
  inletTemp: number;
  flow: number;
  velocity: number;
  ductDp: number;
}

// IAQ 상태 판단 기준
export type IAQLevel = 'good' | 'moderate' | 'bad';

export interface IAQThreshold {
  unit: string;
  good: { max: number };
  moderate: { max: number };
  bad: { min: number };
}
