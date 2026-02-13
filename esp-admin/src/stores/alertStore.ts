import { create } from 'zustand';
import type { AlarmEvent } from '@/types/sensor.types';

interface AlertState {
  emergencyAlerts: AlarmEvent[];
  unreadCount: number;
  addAlert: (alert: AlarmEvent) => void;
  removeAlert: (alarmId: number) => void;
  clearAlerts: () => void;
  acknowledgeAlert: (alarmId: number) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  emergencyAlerts: [],
  unreadCount: 0,

  addAlert: (alert) =>
    set((state) => ({
      emergencyAlerts: [alert, ...state.emergencyAlerts],
      unreadCount: state.unreadCount + 1,
    })),

  removeAlert: (alarmId) =>
    set((state) => ({
      emergencyAlerts: state.emergencyAlerts.filter((a) => a.alarmId !== alarmId),
    })),

  clearAlerts: () =>
    set({ emergencyAlerts: [], unreadCount: 0 }),

  acknowledgeAlert: (alarmId) =>
    set((state) => ({
      emergencyAlerts: state.emergencyAlerts.map((a) =>
        a.alarmId === alarmId ? { ...a, status: 'ACKNOWLEDGED' as const } : a,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
}));
