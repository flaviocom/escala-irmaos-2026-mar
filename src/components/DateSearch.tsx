import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx } from 'clsx';

interface DateSearchProps {
  value: string;
  onChange: (query: string) => void;
  onDateRangeChange: (range: { start: Date | null; end: Date | null } | null) => void;
  dateRange: { start: Date | null; end: Date | null } | null;
}

export const DateSearch: React.FC<DateSearchProps> = ({ value, onChange, onDateRangeChange, dateRange }) => {
  // Sync query with currentRange if it changes externally or via quick actions
  useEffect(() => {
    if (dateRange?.start && dateRange?.end) {
      if (isSameDay(dateRange.start, dateRange.end)) {
        onChange(format(dateRange.start, 'dd/MM/yyyy'));
      } else {
        onChange(`${format(dateRange.start, 'dd/MM')} - ${format(dateRange.end, 'dd/MM')}`);
      }
    }
  }, [dateRange]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (val) {
      onDateRangeChange(null); 
    }
  };

  const handleQuickAction = (type: 'today' | 'week' | 'month') => {
    const today = new Date();
    let start: Date, end: Date;

    switch (type) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'week':
        start = startOfWeek(today, { locale: ptBR });
        end = endOfWeek(today, { locale: ptBR });
        break;
      case 'month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
    }

    onDateRangeChange({ start, end });
    // Query update handled by useEffect
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // Parse as local date to avoid timezone issues
      const [year, month, day] = e.target.value.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      onDateRangeChange({ start: date, end: date });
      // Query update handled by useEffect
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder="Buscar data (ex: 25/12) ou dia..."
          className="w-full pl-10 pr-10 h-12 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm"
        />
        
        {value && (
          <button
            onClick={() => {
              onChange('');
              onDateRangeChange(null);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => handleQuickAction('today')}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors whitespace-nowrap shadow-sm"
        >
          Hoje
        </button>
        <button
          onClick={() => handleQuickAction('week')}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors whitespace-nowrap shadow-sm"
        >
          Esta Semana
        </button>
        <button
          onClick={() => handleQuickAction('month')}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors whitespace-nowrap shadow-sm"
        >
          Este Mês
        </button>
        
        <div className="relative ml-auto">
          <input 
            type="date" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            onChange={handleDateChange}
          />
          <button className="p-2 text-gray-400 hover:text-black bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm transition-colors">
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
