// Control mock data - to be populated in control implementation
import type { ControlCommand } from '@/types/control.types';

export async function mockSendControl(_command: Omit<ControlCommand, 'commandId' | 'result' | 'requestedAt' | 'respondedAt' | 'failReason'>): Promise<{ cmdId: string }> {
  return { cmdId: crypto.randomUUID() };
}

export async function mockGetControlHistory(_equipmentId: string): Promise<ControlCommand[]> {
  return [];
}
