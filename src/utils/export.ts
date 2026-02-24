import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shift, BROTHERS } from '../types/scheduler';

export function exportToCSV(shifts: Shift[]) {
  // Header
  const headers = ['Data', 'Dia da Semana', 'Turno', 'Irmãos'];
  
  // Rows
  const rows = shifts.map(shift => {
    const date = format(shift.date, 'dd/MM/yyyy');
    const dayOfWeek = format(shift.date, 'EEEE', { locale: ptBR });
    // Capitalize first letter of day
    const dayOfWeekCap = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    
    const type = shift.type;
    
    let brothers = '';
    if (type === 'SANTA_CEIA') {
      brothers = 'SANTA CEIA';
    } else {
      brothers = shift.assignedBrothers
        .map(id => BROTHERS.find(b => b.id === id)?.name || id)
        .join(', ');
    }
    
    // Escape quotes and wrap in quotes for CSV safety
    const safeBrothers = `"${brothers.replace(/"/g, '""')}"`;
    
    return [date, dayOfWeekCap, type, safeBrothers].join(',');
  });
  
  // Add BOM for Excel compatibility with UTF-8
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers.join(','), ...rows].join('\n');
  
  // Create Blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'escala_porteiros_2026.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
