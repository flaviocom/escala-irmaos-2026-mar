import React, { useState, useEffect, useMemo } from 'react';
import { generateSchedule } from './utils/scheduler';
import { exportToImage } from './utils/export';
import { Shift, BROTHERS } from './types/scheduler';
import { ScheduleTable } from './components/ScheduleTable';
import { StatsView } from './components/StatsView';
import { ValidationView } from './components/ValidationView';
import { MultiSelect } from './components/MultiSelect';
import { DateSearch } from './components/DateSearch';
import { Calendar, Download, Filter, X, LayoutGrid, BarChart3, ShieldCheck, Menu, SlidersHorizontal, ChevronDown } from 'lucide-react';
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
    <div className="flex flex-col h-full px-5 py-2 overflow-y-auto">
      {/* Desktop Logo (hidden on mobile drawer inside bottom sheet if header has it) */}
      <div className="hidden md:flex items-center gap-3 mb-8">
        <img src={logo} alt="Logo CCB" className="h-10 w-auto object-contain" />
        <div>
          <h1 className="text-base font-bold text-text-primary tracking-tight leading-none uppercase">
            Escala Porteiros
          </h1>
          <p className="text-[10px] text-text-secondary mt-1 font-medium tracking-wider">JD. SÃO LUIZ - 2026</p>
        </div>
      </div>

      {/* Título Mobile (para indicar o que é o painel) */}
      <div className="md:hidden mb-6 text-center">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Filtros e Opções</h2>
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

      {/* Bottom Sheet Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          {/* Overlay fundo escuro */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Painel (Bottom Sheet) */}
          <div className="relative w-full bg-white shadow-2xl rounded-t-[32px] flex flex-col animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden">
            {/* Botão X fora da caixa (acima do painel) */}
            <div className="absolute -top-16 left-0 right-0 flex justify-center px-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all border border-white/20 shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Handle visual no topo */}
            <div className="w-full h-8 flex items-center justify-center shrink-0">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto pb-10">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 md:pl-[320px]">

        {/* Header Mobile */}
        <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-30 px-3 sm:px-4 h-16 flex items-center justify-between shadow-sm overflow-hidden gap-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 -ml-1 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            >
              <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <img src={logo} alt="Logo CCB" className="h-7 sm:h-9 w-auto object-contain shrink-0" />
              <div className="flex flex-col min-w-0">
                <h1 className="text-[11px] sm:text-sm font-bold text-text-primary tracking-tight leading-none uppercase truncate">
                  Escala Porteiros
                </h1>
                <p className="text-[9px] sm:text-[10px] text-text-secondary mt-0.5 font-medium tracking-wider truncate uppercase">JD. SÃO LUIZ-2026</p>
              </div>
            </div>
          </div>

          {/* Filter Button (Mobile Header) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 text-action-primary text-[11px] sm:text-sm font-bold whitespace-nowrap hover:bg-blue-50 px-2 py-1.5 rounded-md transition-colors shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
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
