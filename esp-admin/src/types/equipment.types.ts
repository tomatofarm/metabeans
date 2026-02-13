export type EquipmentStatus = 'NORMAL' | 'INSPECTION' | 'CLEANING' | 'INACTIVE';

export type ConnectionStatus = 'ONLINE' | 'OFFLINE';

export interface Equipment {
  equipmentId: number;
  equipmentSerial: string;
  mqttEquipmentId: string;
  storeId: number | null;
  floorId: number | null;
  equipmentName: string;
  modelId: number | null;
  cellType: string;
  powerpackCount: number;
  purchaseDate: string | null;
  warrantyEndDate: string | null;
  dealerId: number | null;
  status: EquipmentStatus;
  connectionStatus: ConnectionStatus;
  lastSeenAt: string | null;
  registeredBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentModel {
  modelId: number;
  modelName: string;
  manufacturer: string;
  specifications: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

export interface Gateway {
  gatewayId: number;
  gwDeviceId: string;
  storeId: number;
  floorId: number;
  macAddress: string;
  firmwareVersion: string;
  controllerCount: number;
  statusFlags: number;
  connectionStatus: ConnectionStatus;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface Controller {
  controllerId: number;
  ctrlDeviceId: string;
  equipmentId: number;
  gatewayId: number;
  statusFlags: number;
  connectionStatus: ConnectionStatus;
  lastSeenAt: string | null;
  createdAt: string;
}

// Equipment hierarchy tree types for sidebar
export interface EquipmentTreeSite {
  storeId: number;
  siteId: string;
  storeName: string;
  status: 'green' | 'yellow' | 'red';
  floors: EquipmentTreeFloor[];
}

export interface EquipmentTreeFloor {
  floorId: number;
  floorCode: string;
  floorName: string;
  gateways: EquipmentTreeGateway[];
}

export interface EquipmentTreeGateway {
  gatewayId: number;
  gwDeviceId: string;
  connectionStatus: ConnectionStatus;
  equipments: EquipmentTreeEquipment[];
}

export interface EquipmentTreeEquipment {
  equipmentId: number;
  equipmentName: string;
  mqttEquipmentId: string;
  status: 'green' | 'yellow' | 'red';
  controllers: EquipmentTreeController[];
}

export interface EquipmentTreeController {
  controllerId: number;
  ctrlDeviceId: string;
  status: 'green' | 'yellow' | 'red';
  connectionStatus: ConnectionStatus;
}
