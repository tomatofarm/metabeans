export enum ControlTarget {
  POWERPACK = 0,
  DAMPER = 1,
  FAN = 2,
}

export enum PowerpackAction {
  OFF = 0,
  ON = 1,
  RESET = 2,
}

export enum FanSpeed {
  OFF = 0,
  LOW = 1,
  MID = 2,
  HIGH = 3,
}

export type ControlMode = 'AUTO' | 'MANUAL';

export type ControlResult = 'PENDING' | 'SUCCESS' | 'FAIL';

export interface ControlCommand {
  commandId: number;
  cmdId: string;
  storeId: number;
  gatewayId: number;
  equipmentIdMqtt: string;
  controllerIdMqtt: string;
  target: ControlTarget;
  action: number;
  value: number | null;
  controlMode: ControlMode;
  requestedBy: number | null;
  result: ControlResult;
  failReason: string | null;
  requestedAt: string;
  respondedAt: string | null;
}

export interface ControlMqttMessage {
  cmd_id: string;
  equipment_id: string;
  controller_id: string;
  target: number;
  action: number;
  value?: number;
}

export interface ControlAckMessage {
  cmd_id: string;
  result: 'success' | 'fail';
  fail_reason?: string;
  timestamp: number;
}

export interface DamperAutoSetting {
  settingId: number;
  equipmentId: number;
  controllerId: number | null;
  controlMode: ControlMode;
  targetFlow: number;
  setBy: number;
  updatedAt: string;
}

// Damper 8-step mapping (0~7)
export const DAMPER_STEPS = [0, 10, 25, 40, 60, 75, 90, 100] as const;
export type DamperStep = (typeof DAMPER_STEPS)[number];
