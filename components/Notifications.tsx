'use client';

import { useEffect, useState } from 'react';
import { CycleData } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';
import { Bell, BellOff, X } from 'lucide-react';

interface NotificationsProps {
  cycleData: CycleData;
  reminderDaysBefore: number;
}

export default function Notifications({ cycleData, reminderDaysBefore }: NotificationsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    checkUpcomingEvents();
  }, [cycleData, reminderDaysBefore]);

  const checkUpcomingEvents = () => {
    if (!cycleData.nextPredictedPeriod) return;

    const today = new Date();
    const nextPeriod = parseISO(cycleData.nextPredictedPeriod);
    const daysUntilPeriod = differenceInDays(nextPeriod, today);

    if (daysUntilPeriod === reminderDaysBefore) {
      showNotification(
        'Period Reminder',
        `Your period is expected in ${reminderDaysBefore} days`
      );
      setAlertMessage(`Period expected in ${reminderDaysBefore} days`);
      setShowAlert(true);
    } else if (daysUntilPeriod === 0) {
      showNotification('Period Expected', 'Your period is expected today');
      setAlertMessage('Period expected today');
      setShowAlert(true);
    }

    if (cycleData.nextPredictedOvulation) {
      const nextOvulation = parseISO(cycleData.nextPredictedOvulation);
      const daysUntilOvulation = differenceInDays(nextOvulation, today);

      if (daysUntilOvulation === 0) {
        showNotification('Ovulation Day', 'Today is your predicted ovulation day');
        setAlertMessage('Ovulation day - fertile window');
        setShowAlert(true);
      } else if (daysUntilOvulation > 0 && daysUntilOvulation <= 5) {
        const isAlreadyShowing = alertMessage.includes('Fertile window');
        if (!isAlreadyShowing) {
          setAlertMessage(`Fertile window - ${daysUntilOvulation} days until ovulation`);
          setShowAlert(true);
        }
      }
    }
  };

  const showNotification = (title: string, body: string) => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon.png' });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {notificationsEnabled ? (
              <Bell className="text-pink-500" size={24} />
            ) : (
              <BellOff className="text-gray-400" size={24} />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <p className="text-sm text-gray-600">
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          {!notificationsEnabled && (
            <button
              onClick={requestNotificationPermission}
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
            >
              Enable
            </button>
          )}
        </div>
      </div>

      {showAlert && (
        <div className="bg-purple-100 border-l-4 border-purple-500 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="text-purple-500" size={20} />
            <p className="text-purple-900 font-medium">{alertMessage}</p>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="text-purple-500 hover:text-purple-700"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
