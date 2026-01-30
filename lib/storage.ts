import { PeriodEntry, Settings } from '@/types';

const PERIODS_KEY = 'period_tracker_entries';
const SETTINGS_KEY = 'period_tracker_settings';

export const storage = {
  getPeriods: (): PeriodEntry[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(PERIODS_KEY);
    return data ? JSON.parse(data) : [];
  },

  savePeriods: (periods: PeriodEntry[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PERIODS_KEY, JSON.stringify(periods));
  },

  addPeriod: (period: PeriodEntry): void => {
    const periods = storage.getPeriods();
    periods.push(period);
    storage.savePeriods(periods);
  },

  updatePeriod: (id: string, updates: Partial<PeriodEntry>): void => {
    const periods = storage.getPeriods();
    const index = periods.findIndex(p => p.id === id);
    if (index !== -1) {
      periods[index] = { ...periods[index], ...updates };
      storage.savePeriods(periods);
    }
  },

  deletePeriod: (id: string): void => {
    const periods = storage.getPeriods().filter(p => p.id !== id);
    storage.savePeriods(periods);
  },

  getSettings: (): Settings => {
    if (typeof window === 'undefined') {
      return {
        reminderDaysBefore: 3,
        notificationsEnabled: false,
        averageCycleLength: 28,
      };
    }
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      reminderDaysBefore: 3,
      notificationsEnabled: false,
      averageCycleLength: 28,
    };
  },

  saveSettings: (settings: Settings): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
};
