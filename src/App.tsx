import React, { useState, useEffect, useMemo } from 'react';
import { generateSchedule } from './utils/scheduler';
import { exportToImage } from './utils/export';
import { Shift, BROTHERS } from './types/scheduler';
import { ScheduleTable } from './components/ScheduleTable';
import { StatsView } from './components/StatsView';
import { ValidationView } from './components/ValidationView';
import { MultiSelect } from './components/MultiSelect';
import { DateSearch } from './components/DateSearch';
import { Calendar, Download, Filter, X, LayoutGrid, BarChart3, ShieldCheck, Menu } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleExport = () => {
    exportToImage('schedule-container');
    setIsMobileMenuOpen(false); // Fechar menu no mobile após exportar
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white px-5 py-6 overflow-y-auto">
      {/* Desktop Logo (hidden on mobile drawer since header has it or keep it for brand context) */}
      <div className="flex items-center gap-3 mb-8">
        <img src={logo} alt="Logo CCB" className="h-10 w-auto object-contain" />
        <div>
          <h1 className="text-base font-bold text-text-primary tracking-tight leading-none uppercase">
            Escala Porteiros
          </h1>
          <p className="text-[10px] text-text-secondary mt-1 font-medium tracking-wider">JD. SÃO LUIZ - 2026</p>
        </div>
      </div>

      {/* Conteúdo da Navegação Principal */}
      <div className="flex-1 flex flex-col space-y-5">

        {/* 1. ESCALA */}
        <div>
          <button
            onClick={() => { setView('schedule'); setIsMobileMenuOpen(false); }}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
              view === 'schedule'
                ? "bg-action-primary text-text-on-brand shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <LayoutGrid className="h-5 w-5" />
            Escala
          </button>
        </div>

        {/* 2. FILTROS */}
        <div className="px-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Filter className="h-4 w-4 text-action-primary" />
              Filtros
            </h2>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-[11px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded-md transition-colors"
              >
                LIMPAR
              </button>
            )}
          </div>

          <div className="space-y-4 pl-3 border-l-2 border-gray-100 ml-2">
            <DateSearch
              value={dateSearchQuery}
              onChange={setDateSearchQuery}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />

            <MultiSelect
              options={brotherOptions}
              selected={selectedBrotherIds}
              onChange={setSelectedBrotherIds}
              placeholder="Irmão"
              icon={LayoutGrid}
            />

            <MultiSelect
              options={monthOptions}
              selected={selectedMonthStrs}
              onChange={setSelectedMonthStrs}
              placeholder="Mês"
              icon={Calendar}
            />
          </div>
        </div>

        {/* 3. ESTATÍSTICAS */}
        <div>
          <button
            onClick={() => { setView('stats'); setIsMobileMenuOpen(false); }}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
              view === 'stats'
                ? "bg-action-primary text-text-on-brand shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <BarChart3 className="h-5 w-5" />
            Estatísticas
          </button>
        </div>

        {/* 4. VALIDAÇÃO */}
        <div>
          <button
            onClick={() => { setView('validation'); setIsMobileMenuOpen(false); }}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
              view === 'validation'
                ? "bg-action-primary text-text-on-brand shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <ShieldCheck className="h-5 w-5" />
            Validação
          </button>
        </div>

      </div>

      {/* Ações (Exportar) */}
      <div className="pt-6 mt-6 border-t border-gray-100">
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-all duration-200 shadow-sm"
        >
          <Download className="h-5 w-5" />
          Enviar p/ WhatsApp
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-text-primary selection:bg-action-primary selection:text-text-on-brand flex">

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-[320px] fixed inset-y-0 left-0 border-r border-gray-200 z-40 bg-white shadow-sm">
        {sidebarContent}
      </aside>

      {/* Drawer Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay fundo escuro */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Gaveta */}
          <div className="relative w-[300px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full z-10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 md:pl-[320px]">

        {/* Header Mobile */}
        <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-30 px-4 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 -ml-1 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-7 h-7" />
            </button>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo CCB" className="h-8 w-auto object-contain" />
              <div>
                <h1 className="text-sm font-bold text-text-primary tracking-tight leading-none uppercase">
                  Escala Porteiros
                </h1>
                <p className="text-[10px] text-text-secondary mt-0.5 font-medium tracking-wider">JD. SÃO LUIZ - 2026</p>
              </div>
            </div>
          </div>
        </header>

        {/* View renderizada (Container onde a foto será tirada) */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-5xl mx-auto w-full bg-gray-50" id="schedule-container">

          {/* Cabeçalho de Exportação (Oculto na tela, visível apenas no JPG gerado) */}
          <div id="export-header" className="hidden items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <img src={logo} alt="Logo CCB" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight leading-none uppercase">
                Escala Porteiros
              </h1>
              <p className="text-xs text-text-secondary mt-1 font-medium tracking-wider">JD. SÃO LUIZ - 2026</p>
            </div>
          </div>
          {view === 'schedule' && (
            <div className="bg-gray-50 pb-8">
              <ScheduleTable
                shifts={shifts}
                selectedBrotherIds={selectedBrotherIds}
                selectedMonthStrs={selectedMonthStrs}
                dateSearchQuery={dateSearchQuery}
                dateRange={dateRange}
              />
            </div>
          )}

          {view === 'stats' && (
            <StatsView shifts={shifts} />
          )}

          {view === 'validation' && (
            <ValidationView shifts={shifts} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
