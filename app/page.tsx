'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, LogOut, User } from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';
import Calendar from '@/components/Calendar';
import PeriodModal from '@/components/PeriodModal';
import Statistics from '@/components/Statistics';
import Notifications from '@/components/Notifications';
import { storage } from '@/lib/storage';
import { calculateCycleData } from '@/lib/calculations';
import { PeriodEntry } from '@/types';

export default function Home() {
  const { user, isLoaded } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reminderDays, setReminderDays] = useState(3);

  useEffect(() => {
    // Load data from localStorage with user ID
    if (isLoaded) {
      const loadedPeriods = storage.getPeriods(user?.id);
      const settings = storage.getSettings(user?.id);
      setPeriods(loadedPeriods);
      setReminderDays(settings.reminderDaysBefore);
    }
  }, [isLoaded, user?.id]);

  const cycleData = calculateCycleData(periods);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSavePeriod = (entry: Omit<PeriodEntry, 'id'>) => {
    const newEntry: PeriodEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    const updatedPeriods = [...periods, newEntry];
    setPeriods(updatedPeriods);
    storage.savePeriods(updatedPeriods, user?.id);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-12 h-12',
                },
              }}
              afterSignOutUrl="/sign-in"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Period Tracker</h1>
          <p className="text-gray-600">Track your cycle, predict ovulation, and stay informed</p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
            </p>
          )}
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <Notifications cycleData={cycleData} reminderDaysBefore={reminderDays} />
        </div>

        {/* Calendar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-lg bg-white shadow hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={handleToday}
                  className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Today
                </button>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg bg-white shadow hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <Calendar
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              periods={periods}
              cycleData={cycleData}
              onDayClick={handleDayClick}
            />

            {/* Quick Add Button */}
            <button
              onClick={() => {
                setSelectedDate(new Date());
                setIsModalOpen(true);
              }}
              className="mt-4 w-full py-3 bg-pink-500 text-white rounded-lg shadow-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <Plus size={20} />
              Log Period
            </button>
          </div>

          {/* Statistics */}
          <div>
            <Statistics cycleData={cycleData} periods={periods} />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period reminder (days before)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={reminderDays}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setReminderDays(value);
                  const settings = storage.getSettings(user?.id);
                  storage.saveSettings({ ...settings, reminderDaysBefore: value }, user?.id);
                }}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Your data is stored securely in your browser, linked to your account</p>
          <p className="mt-1 text-xs">Protected by Clerk authentication</p>
        </div>
      </div>

      {/* Modal */}
      <PeriodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePeriod}
        selectedDate={selectedDate}
      />
    </div>
  );
}
