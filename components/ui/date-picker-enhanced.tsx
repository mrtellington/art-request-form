/**
 * Enhanced Date Picker Component
 *
 * Date picker with quick select options (Today, Tomorrow)
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Input } from './input';

interface DatePickerEnhancedProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  error?: string;
}

export function DatePickerEnhanced({
  value,
  onChange,
  placeholder = 'mm/dd/yyyy',
  className = '',
  id,
  error,
}: DatePickerEnhancedProps) {
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  const handleQuickSelect = (dateValue: string, label: string) => {
    onChange(dateValue);
    setShowQuickSelect(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <Input
          type="date"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowQuickSelect(true)}
          onBlur={() => setTimeout(() => setShowQuickSelect(false), 200)}
          placeholder={placeholder}
          className={`pl-10 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        />
      </div>

      {/* Quick Select Dropdown */}
      {showQuickSelect && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            <button
              type="button"
              onClick={() => handleQuickSelect(getToday(), 'Today')}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-zinc-50 transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">Today</span>
              <span className="text-zinc-500 ml-auto text-xs">
                {new Date().toLocaleDateString()}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(getTomorrow(), 'Tomorrow')}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-zinc-50 transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">Tomorrow</span>
              <span className="text-zinc-500 ml-auto text-xs">
                {new Date(getTomorrow()).toLocaleDateString()}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(getNextWeek(), 'Next Week')}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-zinc-50 transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">Next Week</span>
              <span className="text-zinc-500 ml-auto text-xs">
                {new Date(getNextWeek()).toLocaleDateString()}
              </span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
