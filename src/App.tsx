import React, { useState, useEffect, useMemo } from 'react';
import { generateSchedule } from './utils/scheduler';
import { exportToCSV } from './utils/export';
import { Shift, BROTHERS } from './types/scheduler';
import { ScheduleTable } from './components/ScheduleTable';
import { StatsView } from './components/StatsView';
import { ValidationView } from './components/ValidationView';
import { MultiSelect } from './components/MultiSelect';
import { DateSearch } from './components/DateSearch';
import { Calendar, Download, Filter, X, LayoutGrid, BarChart3, ShieldCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx } from 'clsx';
import logo from './assets/logo-ccb-light.png';

function App() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedBrotherIds, setSelectedBrotherIds] = useState<string[]>([]);
  const [selectedMonthStrs, setSelectedMonthStrs] = useState<string[]>([]);
  const [dateSearchQuery, setDateSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null } | null>(null);
  const [view, setView] = useState<'schedule' | 'stats' | 'validation'>('schedule');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const newShifts = generateSchedule();
    setShifts(newShifts);
  }, []);

  const months = useMemo(() => {
    return Array.from(new Set(shifts.map(s => s.date.toISOString().slice(0, 7)))).sort();
  }, [shifts]);

  const brotherOptions = useMemo(() => BROTHERS.map(b => ({ value: b.id, label: b.name })), []);
  const monthOptions = useMemo(() => months.map(m => ({ 
    value: parseISO(m).toISOString(),
    label: format(parseISO(m), 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())
  })), [months]);

  const activeFiltersCount = selectedBrotherIds.length + selectedMonthStrs.length + (dateSearchQuery ? 1 : 0) + (dateRange ? 1 : 0);

  const clearFilters = () => {
    setSelectedBrotherIds([]);
    setSelectedMonthStrs([]);
    setDateSearchQuery('');
    setDateRange(null);
  };

  return (
    <div className="min-h-screen bg-surface-page font-sans text-text-primary pb-space-20 selection:bg-action-primary selection:text-text-on-brand">
      {/* Modern Header */}
      <header className="bg-surface-page/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 pt-4 pb-2">
        <div className="max-w-7xl mx-auto px-space-4 sm:px-space-6 lg:px-space-8 h-16 md:h-20 flex items-center justify-between gap-space-4">
          <div className="flex items-center gap-space-3">
            <img src={logo} alt="Logo CCB" className="h-8 md:h-10 w-auto object-contain" />
            <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>
            <div>
              <h1 className="text-text-lg md:text-text-xl font-bold text-text-primary tracking-tight leading-none">
                Escala de Porteiros 2026
              </h1>
              <p className="text-text-xs text-text-secondary font-medium mt-0.5">Jd. São Luiz, Barueri, SP</p>
            </div>
          </div>

          <div className="flex items-center gap-space-2 md:gap-space-4">
            {/* Export Button - Desktop */}
            <button
              onClick={() => exportToCSV(shifts)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-action-primary bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm"
              title="Exportar para Excel/CSV"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>

            {/* View Toggles - Desktop */}
            <div className="hidden md:flex bg-gray-100 p-1 rounded-xl border border-transparent">
              <button 
                onClick={() => setView('schedule')}
                className={clsx(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  view === 'schedule' 
                    ? 'bg-white text-action-primary shadow-sm ring-1 ring-black/5 font-semibold' 
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Escala
              </button>
              <button 
                onClick={() => setView('stats')}
                className={clsx(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  view === 'stats' 
                    ? 'bg-white text-action-primary shadow-sm ring-1 ring-black/5 font-semibold' 
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Estatísticas
              </button>
              <button 
                onClick={() => setView('validation')}
                className={clsx(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  view === 'validation' 
                    ? 'bg-white text-action-primary shadow-sm ring-1 ring-black/5 font-semibold' 
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                Validação
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "md:hidden p-space-2 rounded-radius-lg border transition-colors relative",
                showFilters || activeFiltersCount > 0
                  ? "bg-action-primary text-text-on-brand border-action-primary"
                  : "bg-surface-card text-text-secondary border-border-default"
              )}
            >
              <Filter className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-status-error text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-space-4 sm:px-space-6 lg:px-space-8 py-space-6 md:py-space-8">
        {/* Filters Section */}
        <div className={clsx(
          "mb-space-8 relative z-50",
          showFilters ? "block" : "hidden md:block"
        )}>
          <div className="relative">
            {/* Desktop Clear Button */}
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearFilters}
                className="hidden md:flex absolute -top-10 right-0 items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"
              >
                <X className="h-3 w-3" />
                Limpar filtros
              </button>
            )}

            <div className="flex items-center justify-between mb-space-4 md:hidden">
              <h2 className="text-text-lg font-semibold text-text-primary">Filtros</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => exportToCSV(shifts)}
                  className="text-text-sm text-action-primary font-medium flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm"
                >
                  <Download className="h-3 w-3" />
                  CSV
                </button>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="text-text-sm text-status-error font-medium"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mobile: Vertical Stack for Filters */}
              <div className="md:hidden flex flex-col gap-3">
                <div className="w-full">
                  <DateSearch 
                    value={dateSearchQuery}
                    onChange={setDateSearchQuery}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                </div>
                
                <div className="w-full">
                  <MultiSelect
                    options={monthOptions}
                    selected={selectedMonthStrs}
                    onChange={setSelectedMonthStrs}
                    placeholder="Mês"
                    icon={Calendar}
                  />
                </div>

                <div className="w-full">
                  <MultiSelect
                    options={brotherOptions}
                    selected={selectedBrotherIds}
                    onChange={setSelectedBrotherIds}
                    placeholder="Irmão"
                    icon={LayoutGrid}
                  />
                </div>
              </div>

              {/* Desktop: Grid */}
              <div className="hidden md:contents">
                <DateSearch 
                  value={dateSearchQuery}
                  onChange={setDateSearchQuery}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
                
                <MultiSelect
                  options={monthOptions}
                  selected={selectedMonthStrs}
                  onChange={setSelectedMonthStrs}
                  placeholder="Mês"
                  icon={Calendar}
                />

                <MultiSelect
                  options={brotherOptions}
                  selected={selectedBrotherIds}
                  onChange={setSelectedBrotherIds}
                  placeholder="Irmão"
                  icon={LayoutGrid}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {view === 'schedule' && (
          <ScheduleTable 
            shifts={shifts}
            selectedBrotherIds={selectedBrotherIds}
            selectedMonthStrs={selectedMonthStrs}
            dateSearchQuery={dateSearchQuery}
            dateRange={dateRange}
          />
        )}
        
        {view === 'stats' && (
          <StatsView shifts={shifts} />
        )}

        {view === 'validation' && (
          <ValidationView shifts={shifts} />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-section border-t border-border-default pb-safe z-50">
        <div className="grid grid-cols-3 h-16">
          <button 
            onClick={() => setView('schedule')}
            className={clsx(
              "flex flex-col items-center justify-center gap-1",
              view === 'schedule' ? "text-action-primary" : "text-text-muted"
            )}
          >
            <LayoutGrid className="h-6 w-6" />
            <span className="text-text-xs font-medium">Escala</span>
          </button>
          <button 
            onClick={() => setView('stats')}
            className={clsx(
              "flex flex-col items-center justify-center gap-1",
              view === 'stats' ? "text-action-primary" : "text-text-muted"
            )}
          >
            <BarChart3 className="h-6 w-6" />
            <span className="text-text-xs font-medium">Estatísticas</span>
          </button>
          <button 
            onClick={() => setView('validation')}
            className={clsx(
              "flex flex-col items-center justify-center gap-1",
              view === 'validation' ? "text-action-primary" : "text-text-muted"
            )}
          >
            <ShieldCheck className="h-6 w-6" />
            <span className="text-text-xs font-medium">Validação</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
