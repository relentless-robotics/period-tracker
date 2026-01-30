'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { PeriodEntry } from '@/types';

interface PeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<PeriodEntry, 'id'>) => void;
  selectedDate: Date | null;
  existingEntry?: PeriodEntry;
}

export default function PeriodModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  existingEntry,
}: PeriodModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedDate) {
      setStartDate(format(selectedDate, 'yyyy-MM-dd'));
    }
    if (existingEntry) {
      setStartDate(existingEntry.startDate);
      setEndDate(existingEntry.endDate || '');
      setFlow(existingEntry.flow);
      setNotes(existingEntry.notes || '');
    } else {
      setEndDate('');
      setFlow('medium');
      setNotes('');
    }
  }, [selectedDate, existingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      startDate,
      endDate: endDate || null,
      flow,
      notes,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {existingEntry ? 'Edit Period' : 'Log Period'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date (optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flow Intensity
            </label>
            <div className="flex gap-3">
              {(['light', 'medium', 'heavy'] as const).map((intensity) => (
                <button
                  key={intensity}
                  type="button"
                  onClick={() => setFlow(intensity)}
                  className={`
                    flex-1 py-2 px-4 rounded-md capitalize transition-all
                    ${flow === intensity
                      ? intensity === 'heavy'
                        ? 'bg-red-500 text-white'
                        : intensity === 'medium'
                        ? 'bg-red-400 text-white'
                        : 'bg-red-300 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Any symptoms, mood, etc."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
