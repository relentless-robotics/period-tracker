import { PeriodEntry, Settings } from '@/types';

// Helper to get user-specific key
const getUserKey = (baseKey: string, userId?: string | null): string => {
  if (!userId) return baseKey; // Fallback for non-authenticated users
  return `${baseKey}_${userId}`;
};

export const storage = {
  getPeriods: (userId?: string | null): PeriodEntry[] => {
    if (typeof window === 'undefined') return [];
    const key = getUserKey('period_tracker_entries', userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  savePeriods: (periods: PeriodEntry[], userId?: string | null): void => {
    if (typeof window === 'undefined') return;
    const key = getUserKey('period_tracker_entries', userId);
    localStorage.setItem(key, JSON.stringify(periods));
  },

  addPeriod: (period: PeriodEntry, userId?: string | null): void => {
    const periods = storage.getPeriods(userId);
    periods.push(period);
    storage.savePeriods(periods, userId);
  },

  updatePeriod: (id: string, updates: Partial<PeriodEntry>, userId?: string | null): void => {
    const periods = storage.getPeriods(userId);
    const index = periods.findIndex(p => p.id === id);
    if (index !== -1) {
      periods[index] = { ...periods[index], ...updates };
      storage.savePeriods(periods, userId);
    }
  },

  deletePeriod: (id: string, userId?: string | null): void => {
    const periods = storage.getPeriods(userId).filter(p => p.id !== id);
    storage.savePeriods(periods, userId);
  },

  getSettings: (userId?: string | null): Settings => {
    if (typeof window === 'undefined') {
      return {
        reminderDaysBefore: 3,
        notificationsEnabled: false,
        averageCycleLength: 28,
      };
    }
    const key = getUserKey('period_tracker_settings', userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {
      reminderDaysBefore: 3,
      notificationsEnabled: false,
      averageCycleLength: 28,
    };
  },

  saveSettings: (settings: Settings, userId?: string | null): void => {
    if (typeof window === 'undefined') return;
    const key = getUserKey('period_tracker_settings', userId);
    localStorage.setItem(key, JSON.stringify(settings));
  },
};
