'use client';

import { format, isSameMonth } from 'date-fns';
import { generateCalendarDays, getDayInfo } from '@/lib/calculations';
import { PeriodEntry, CycleData } from '@/types';

interface CalendarProps {
  year: number;
  month: number;
  periods: PeriodEntry[];
  cycleData: CycleData;
  onDayClick: (date: Date) => void;
}

export default function Calendar({ year, month, periods, cycleData, onDayClick }: CalendarProps) {
  const days = generateCalendarDays(year, month);
  const currentMonth = new Date(year, month);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayStyles = (date: Date) => {
    const dayInfo = getDayInfo(date, periods, cycleData);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isToday = isSameMonth(date, new Date()) && date.getDate() === new Date().getDate();

    let bgColor = isCurrentMonth ? 'bg-white' : 'bg-gray-50';
    let textColor = isCurrentMonth ? 'text-gray-900' : 'text-gray-400';
    let border = '';

    if (dayInfo.isPeriod) {
      if (dayInfo.flow === 'heavy') bgColor = 'bg-red-500';
      else if (dayInfo.flow === 'medium') bgColor = 'bg-red-400';
      else bgColor = 'bg-red-300';
      textColor = 'text-white font-semibold';
    } else if (dayInfo.isOvulation) {
      bgColor = 'bg-purple-500';
      textColor = 'text-white font-semibold';
    } else if (dayInfo.isFertile) {
      bgColor = 'bg-purple-200';
      textColor = 'text-purple-900';
    } else if (dayInfo.isPredictedPeriod) {
      bgColor = 'bg-pink-100';
      textColor = 'text-pink-800';
      border = 'border-2 border-dashed border-pink-400';
    }

    if (isToday && !dayInfo.isPeriod && !dayInfo.isOvulation) {
      border = 'border-2 border-blue-500';
    }

    return `${bgColor} ${textColor} ${border}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onDayClick(day)}
            className={`
              aspect-square rounded-lg flex items-center justify-center text-sm
              transition-all hover:scale-105 cursor-pointer
              ${getDayStyles(day)}
            `}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Period (Heavy)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded"></div>
          <span>Period (Medium)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-300 rounded"></div>
          <span>Period (Light)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>Ovulation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-200 rounded"></div>
          <span>Fertile Window</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-100 border-2 border-dashed border-pink-400 rounded"></div>
          <span>Predicted Period</span>
        </div>
      </div>
    </div>
  );
}
