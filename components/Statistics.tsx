'use client';

import { CycleData, PeriodEntry } from '@/types';
import { format, parseISO } from 'date-fns';
import { Calendar, Activity, TrendingUp, Clock } from 'lucide-react';

interface StatisticsProps {
  cycleData: CycleData;
  periods: PeriodEntry[];
}

export default function Statistics({ cycleData, periods }: StatisticsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard
          icon={<TrendingUp className="text-pink-500" size={24} />}
          label="Average Cycle"
          value={`${cycleData.averageCycleLength} days`}
        />
        <StatCard
          icon={<Clock className="text-pink-500" size={24} />}
          label="Average Period"
          value={`${cycleData.averagePeriodDuration} days`}
        />
        <StatCard
          icon={<Calendar className="text-purple-500" size={24} />}
          label="Next Period"
          value={cycleData.nextPredictedPeriod
            ? format(parseISO(cycleData.nextPredictedPeriod), 'MMM d, yyyy')
            : 'Not enough data'}
        />
        <StatCard
          icon={<Activity className="text-purple-500" size={24} />}
          label="Next Ovulation"
          value={cycleData.nextPredictedOvulation
            ? format(parseISO(cycleData.nextPredictedOvulation), 'MMM d, yyyy')
            : 'Not enough data'}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Cycle History</h3>
        {periods.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No periods logged yet. Start tracking to see your history!
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...periods]
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
              .map((period) => (
                <div
                  key={period.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(parseISO(period.startDate), 'MMM d, yyyy')}
                      {period.endDate && ` - ${format(parseISO(period.endDate), 'MMM d, yyyy')}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Flow: <span className="capitalize">{period.flow}</span>
                    </p>
                  </div>
                  <div
                    className={`
                      w-3 h-3 rounded-full
                      ${period.flow === 'heavy'
                        ? 'bg-red-500'
                        : period.flow === 'medium'
                        ? 'bg-red-400'
                        : 'bg-red-300'
                      }
                    `}
                  />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
