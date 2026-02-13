// 장비 운용 상태
export type EquipmentStatus = 'NORMAL' | 'INSPECTION' | 'CLEANING' | 'INACTIVE';

// 연결 상태
export type ConnectionStatus = 'ONLINE' | 'OFFLINE';

// 장비 정보 (equipment 테이블)
export interface Equipment {
  equipmentId: number;
  equipmentSerial: string;
  mqttEquipmentId: string;
  storeId?: number;
  floorId?: number;
  equipmentName?: string;
  modelId?: number;
  cellType?: string;
  powerpackCount: number;
  purchaseDate?: string;
  warrantyEndDate?: string;
  dealerId?: number;
  status: EquipmentStatus;
  connectionStatus: ConnectionStatus;
  lastSeenAt?: string;
  registeredBy: number;
  createdAt: string;
  updatedAt: string;
}

// 장비 모델 (equipment_models 테이블)
export interface EquipmentModel {
  modelId: number;
  modelName: string;
  manufacturer?: string;
  specifications?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

// 게이트웨이 (gateways 테이블)
export interface Gateway {
  gatewayId: number;
  gwDeviceId: string;
  storeId: number;
  floorId: number;
  macAddress?: string;
  firmwareVersion?: string;
  controllerCount: number;
  statusFlags: number;
  connectionStatus: ConnectionStatus;
  lastSeenAt?: string;
  createdAt: string;
}

// 컨트롤러/파워팩 (controllers 테이블)
export interface Controller {
  controllerId: number;
  ctrlDeviceId: string;
  equipmentId: number;
  gatewayId: number;
  statusFlags: number;
  connectionStatus: ConnectionStatus;
  lastSeenAt?: string;
  createdAt: string;
}

// 장비 이력 (equipment_history 테이블)
export interface EquipmentHistory {
  historyId: number;
  equipmentId: number;
  description: string;
  cost?: number;
  asRequestId?: number;
  sparkValue?: number;
  pressureValue?: number;
  occurredAt: string;
}

// 소모품 교체 주기 (consumable_schedules 테이블)
export interface ConsumableSchedule {
  scheduleId: number;
  equipmentId: number;
  consumableType: string;
  replacementCycleDays: number;
  lastReplacedAt?: string;
  nextDueDate?: string;
  alertDaysBefore: number;
  createdAt: string;
}

// 사이드바 트리 구조를 위한 계층형 타입
export interface StoreTreeNode {
  storeId: number;
  storeName: string;
  siteId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  floors: FloorTreeNode[];
}

export interface FloorTreeNode {
  floorId: number;
  floorCode: string;
  floorName?: string;
  gateways: GatewayTreeNode[];
}

export interface GatewayTreeNode {
  gatewayId: number;
  gwDeviceId: string;
  connectionStatus: ConnectionStatus;
  equipments: EquipmentTreeNode[];
}

export interface EquipmentTreeNode {
  equipmentId: number;
  equipmentName?: string;
  mqttEquipmentId: string;
  connectionStatus: ConnectionStatus;
  controllers: ControllerTreeNode[];
}

export interface ControllerTreeNode {
  controllerId: number;
  ctrlDeviceId: string;
  connectionStatus: ConnectionStatus;
}
