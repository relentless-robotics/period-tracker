import { PeriodEntry, CycleData, DayInfo } from '@/types';
import {
  addDays,
  differenceInDays,
  isSameDay,
  parseISO,
  startOfDay,
  isWithinInterval,
  format
} from 'date-fns';

export function calculateCycleData(periods: PeriodEntry[]): CycleData {
  if (periods.length === 0) {
    return {
      averageCycleLength: 28,
      averagePeriodDuration: 5,
      nextPredictedPeriod: null,
      nextPredictedOvulation: null,
    };
  }

  // Sort periods by start date
  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Calculate average cycle length
  const cycleLengths: number[] = [];
  for (let i = 1; i < sortedPeriods.length; i++) {
    const days = differenceInDays(
      parseISO(sortedPeriods[i].startDate),
      parseISO(sortedPeriods[i - 1].startDate)
    );
    if (days > 0 && days < 60) { // Reasonable cycle length
      cycleLengths.push(days);
    }
  }

  const averageCycleLength = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : 28;

  // Calculate average period duration
  const periodDurations: number[] = [];
  sortedPeriods.forEach(period => {
    if (period.endDate) {
      const duration = differenceInDays(
        parseISO(period.endDate),
        parseISO(period.startDate)
      ) + 1;
      if (duration > 0 && duration < 15) {
        periodDurations.push(duration);
      }
    }
  });

  const averagePeriodDuration = periodDurations.length > 0
    ? Math.round(periodDurations.reduce((a, b) => a + b, 0) / periodDurations.length)
    : 5;

  // Predict next period and ovulation
  const lastPeriod = sortedPeriods[sortedPeriods.length - 1];
  const lastPeriodStart = parseISO(lastPeriod.startDate);
  const nextPredictedPeriod = addDays(lastPeriodStart, averageCycleLength);
  const nextPredictedOvulation = addDays(nextPredictedPeriod, -14); // Ovulation typically 14 days before period

  return {
    averageCycleLength,
    averagePeriodDuration,
    nextPredictedPeriod: format(nextPredictedPeriod, 'yyyy-MM-dd'),
    nextPredictedOvulation: format(nextPredictedOvulation, 'yyyy-MM-dd'),
  };
}

export function getDayInfo(date: Date, periods: PeriodEntry[], cycleData: CycleData): DayInfo {
  const dateStart = startOfDay(date);

  // Check if it's a period day
  let isPeriod = false;
  let flow: 'light' | 'medium' | 'heavy' | undefined;

  for (const period of periods) {
    const periodStart = startOfDay(parseISO(period.startDate));
    const periodEnd = period.endDate
      ? startOfDay(parseISO(period.endDate))
      : periodStart;

    if (isWithinInterval(dateStart, { start: periodStart, end: periodEnd })) {
      isPeriod = true;
      flow = period.flow;
      break;
    }
  }

  // Check if it's predicted period
  const isPredictedPeriod = cycleData.nextPredictedPeriod
    ? isWithinInterval(dateStart, {
        start: startOfDay(parseISO(cycleData.nextPredictedPeriod)),
        end: addDays(startOfDay(parseISO(cycleData.nextPredictedPeriod)), cycleData.averagePeriodDuration - 1),
      })
    : false;

  // Check if it's ovulation day
  const isOvulation = cycleData.nextPredictedOvulation
    ? isSameDay(dateStart, parseISO(cycleData.nextPredictedOvulation))
    : false;

  // Check if it's in fertile window (5 days before ovulation + ovulation day)
  const isFertile = cycleData.nextPredictedOvulation
    ? isWithinInterval(dateStart, {
        start: addDays(parseISO(cycleData.nextPredictedOvulation), -5),
        end: parseISO(cycleData.nextPredictedOvulation),
      })
    : false;

  return {
    date: dateStart,
    isPeriod,
    isOvulation,
    isFertile,
    isPredictedPeriod: isPredictedPeriod && !isPeriod,
    flow,
  };
}

export function generateCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the day of week for the first day (0 = Sunday)
  const startPadding = firstDay.getDay();

  // Get days from previous month
  const days: Date[] = [];
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push(addDays(firstDay, -i - 1));
  }

  // Get days from current month
  for (let i = 0; i < lastDay.getDate(); i++) {
    days.push(addDays(firstDay, i));
  }

  // Get days from next month to complete the grid (6 rows x 7 days = 42 days)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(addDays(lastDay, i));
  }

  return days;
}
