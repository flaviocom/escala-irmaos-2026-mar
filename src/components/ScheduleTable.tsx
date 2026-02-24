import React, { useMemo, useEffect, useRef } from 'react';
import { format, isSameMonth, parseISO, startOfMonth, isWithinInterval, isSameDay, startOfToday, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shift, BROTHERS } from '../types/scheduler';
import { clsx } from 'clsx';
import { Calendar, Clock, Sun, MoonStar, CloudSun, AlertCircle } from 'lucide-react';

interface ScheduleTableProps {
  shifts: Shift[];
  selectedBrotherIds: string[];
  selectedMonthStrs: string[];
  dateSearchQuery?: string;
  dateRange?: { start: Date | null; end: Date | null } | null;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({ 
  shifts, 
  selectedBrotherIds, 
  selectedMonthStrs,
  dateSearchQuery,
  dateRange
}) => {
  const today = startOfToday();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      // 1. Date Range Filter
      if (dateRange?.start && dateRange?.end) {
        if (!isWithinInterval(shift.date, { start: dateRange.start, end: dateRange.end })) {
          return false;
        }
      }

      // 2. Text Search Filter (Date or Day)
      if (dateSearchQuery) {
        const query = dateSearchQuery.toLowerCase();
        const dateStr = format(shift.date, 'dd/MM');
        const dayName = format(shift.date, 'EEEE', { locale: ptBR }).toLowerCase();
        
        if (!dateStr.includes(query) && !dayName.includes(query)) {
          return false;
        }
      }

      // 3. Month Filter
      if (selectedMonthStrs.length > 0) {
        const match = selectedMonthStrs.some(m => isSameMonth(parseISO(m), shift.date));
        if (!match) return false;
      }

      // 4. Brother Filter
      if (selectedBrotherIds.length > 0) {
        const hasBrother = shift.assignedBrothers.some(id => selectedBrotherIds.includes(id));
        if (!hasBrother) return false;
      }

      return true;
    });
  }, [shifts, selectedBrotherIds, selectedMonthStrs, dateSearchQuery, dateRange]);

  const months = useMemo(() => {
    const groups: Record<string, Shift[]> = {};
    filteredShifts.forEach(shift => {
      const key = startOfMonth(shift.date).toISOString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(shift);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredShifts]);

  // Scroll to today on mount
  useEffect(() => {
    if (!hasScrolled.current && scrollRef.current) {
      // Use 'center' block alignment to ensure visibility regardless of sticky headers
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasScrolled.current = true;
    }
  }, [months]);

  // Find the first shift to scroll to (Today or next upcoming)
  let firstUpcomingShiftId: string | null = null;
  const upcomingShift = filteredShifts.find(s => isSameDay(s.date, today) || isAfter(s.date, today));
  if (upcomingShift) {
    firstUpcomingShiftId = upcomingShift.id;
  }

  const getBrotherName = (id: string) => BROTHERS.find(b => b.id === id)?.name || id;

  const ShiftBadge = ({ type }: { type: string }) => {
    if (type === 'SANTA_CEIA') {
      return (
        <span className="px-space-2 py-space-1 inline-flex items-center gap-space-1 text-text-xs font-semibold rounded-radius-full bg-surface-subtle text-status-warning border border-status-warning">
          <AlertCircle className="h-3 w-3" />
          SANTA CEIA
        </span>
      );
    }

    // Colors: Morning=Yellow(Amber), Afternoon=Orange/Blue, Night=Indigo
    const config = {
      'MANHA': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: Sun },
      'TARDE': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: CloudSun },
      'NOITE': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', icon: MoonStar },
    }[type] || { bg: 'bg-surface-subtle', text: 'text-text-muted', border: 'border-border-subtle', icon: Clock };

    const Icon = config.icon;

    if (type === 'TARDE') {
      return (
        <div className="flex flex-col items-center justify-center bg-orange-50 border border-orange-100 rounded-radius-md px-space-3 py-space-1">
          <CloudSun className="h-4 w-4 text-orange-500 mb-0.5" />
          <span className="text-[10px] font-bold text-orange-600 leading-none">TARDE</span>
          <span className="text-[9px] font-bold text-orange-700 uppercase mt-0.5 leading-none tracking-wider">
            ENSAIO
          </span>
        </div>
      );
    }

    return (
      <span className={clsx(
        "px-space-2 py-space-1 inline-flex items-center gap-space-1 text-text-xs font-semibold rounded-radius-full border",
        config.bg, config.text, config.border
      )}>
        <Icon className="h-3 w-3" />
        {type}
      </span>
    );
  };

  const BrotherTag = ({ id }: { id: string }) => (
    <span className={clsx(
      "px-space-2 py-space-1 rounded-radius-md text-text-xs font-medium border transition-all duration-200",
      selectedBrotherIds.includes(id)
        ? "bg-action-primary text-text-on-brand border-action-primary shadow-md transform scale-105" 
        : "bg-white text-text-secondary border-gray-200 shadow-sm hover:border-action-primary/30 hover:shadow-md"
    )}>
      {getBrotherName(id)}
    </span>
  );

  if (months.length === 0) {
    return (
      <div className="text-center py-space-16 bg-surface-card rounded-radius-2xl border border-border-default border-dashed">
        <div className="bg-surface-subtle p-space-4 rounded-radius-full inline-block mb-space-4">
          <Calendar className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-text-lg font-medium text-text-primary">Nenhum turno encontrado</h3>
        <p className="text-text-secondary mt-space-1">Tente ajustar os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-space-8">
      {months.map(([monthStr, monthShifts]) => (
        <div key={monthStr} className="bg-surface-card rounded-radius-2xl shadow-card border border-border-default overflow-hidden">
          <div className="bg-gray-50 px-space-6 py-space-3 border-y border-gray-200 flex items-center gap-space-3 shadow-sm my-6 rounded-lg mx-4 md:mx-0">
            <div className="bg-action-primary/10 p-2 rounded-radius-md shadow-sm border border-action-primary/20">
              <Calendar className="h-5 w-5 text-action-primary" />
            </div>
            <h3 className="text-text-lg font-bold text-text-primary capitalize tracking-tight">
              {format(parseISO(monthStr), 'MMMM yyyy', { locale: ptBR })}
            </h3>
          </div>
          
          {/* Unified Card View (Desktop & Mobile) */}
          <div className="space-y-3">
            {monthShifts.map((shift) => {
              const isSelected = selectedBrotherIds.length > 0 && shift.assignedBrothers.some(id => selectedBrotherIds.includes(id));
              const isSantaCeia = shift.type === 'SANTA_CEIA';
              
              // Config colors based on type
              const typeConfig = {
                'MANHA': { color: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
                'TARDE': { color: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
                'NOITE': { color: 'bg-indigo-500', light: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
                'SANTA_CEIA': { color: 'bg-red-500', light: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
              }[shift.type] || { color: 'bg-gray-500', light: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };

              return (
                <div 
                  key={shift.id} 
                  id={`shift-${shift.id}`}
                  ref={shift.id === firstUpcomingShiftId ? scrollRef : null}
                  className={clsx(
                    "group relative flex flex-row items-center gap-2 p-3 rounded-xl border transition-all duration-200 scroll-mt-[200px]",
                    "bg-white hover:shadow-md hover:border-action-primary/30",
                    isSelected ? "ring-2 ring-amber-400 shadow-md z-10" : "border-gray-200 shadow-sm"
                  )}
                >
                  {/* Left Accent Border (Visual) */}
                  <div className={clsx(
                    "absolute left-0 top-3 bottom-3 w-1 rounded-r-full",
                    typeConfig.color
                  )} />

                  {/* Date Box */}
                  <div className="pl-2 shrink-0">
                    <div className="flex flex-col w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                      <div className={clsx("h-4 flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-wider", typeConfig.color)}>
                        {format(shift.date, 'MMM', { locale: ptBR }).replace('.', '')}
                      </div>
                      <div className="flex-1 bg-white flex flex-col items-center justify-center">
                        <span className="text-base font-bold text-gray-900 leading-none">
                          {format(shift.date, 'dd')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content (Shift + Participants) */}
                  <div className="flex-1 flex flex-row flex-wrap items-center gap-2 min-w-0">
                    {/* Shift Info */}
                    <div className="flex items-center shrink-0">
                      <ShiftBadge type={shift.type} />
                    </div>

                    {/* Participants */}
                    <div className="flex-1 min-w-0">
                      {isSantaCeia ? (
                        <span className="text-text-muted italic text-xs px-1">---</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {shift.assignedBrothers.map(id => (
                            <BrotherTag key={id} id={id} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Status (Placeholder for visual balance) */}
                  <div className="hidden md:flex items-center justify-end w-8">
                    <div className="h-8 w-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-300 cursor-pointer">
                      <div className="w-1 h-1 bg-current rounded-full mx-0.5" />
                      <div className="w-1 h-1 bg-current rounded-full mx-0.5" />
                      <div className="w-1 h-1 bg-current rounded-full mx-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legacy Views Removed - Unified View Used */}

        </div>
      ))}
    </div>
  );
};
