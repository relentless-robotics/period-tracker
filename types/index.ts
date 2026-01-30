export interface PeriodEntry {
  id: string;
  startDate: string; // ISO date string
  endDate: string | null;
  flow: 'light' | 'medium' | 'heavy';
  notes?: string;
}

export interface CycleData {
  averageCycleLength: number;
  averagePeriodDuration: number;
  nextPredictedPeriod: string | null;
  nextPredictedOvulation: string | null;
}

export interface DayInfo {
  date: Date;
  isPeriod: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  isPredictedPeriod: boolean;
  flow?: 'light' | 'medium' | 'heavy';
}

export interface Settings {
  reminderDaysBefore: number;
  notificationsEnabled: boolean;
  averageCycleLength: number;
}
