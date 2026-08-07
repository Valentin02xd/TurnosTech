import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  appointments?: { date: string }[];
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function Calendar({ selectedDate, onSelectDate, appointments = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: { date: Date; type: 'prev' | 'current' | 'next' }[] = [];
    
    // Días del mes anterior
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        type: 'prev'
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        type: 'current'
      });
    }
    
    // Días del mes siguiente
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        type: 'next'
      });
    }
    
    return days;
  }, [currentMonth]);

  // Verificar si una fecha tiene turnos
  const hasAppointments = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.some(apt => apt.date === dateStr);
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const navigateYear = (direction: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear() + direction, prev.getMonth(), 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(now);
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isDisabled = (date: Date) => {
    return date < today;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigateYear(-1)} className="h-8 w-8">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-white">
            {monthNames[currentMonth.getMonth()]}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentMonth.getFullYear()}
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigateYear(1)} className="h-8 w-8">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, type }, index) => {
          const disabled = isDisabled(date);
          const selected = isSelected(date);
          const isTodayDate = isToday(date);
          const hasApts = hasAppointments(date);

          return (
            <button
              key={index}
              onClick={() => !disabled && onSelectDate(date)}
              disabled={disabled}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                transition-all duration-200 relative
                ${!disabled ? 'hover:scale-110 active:scale-95' : ''}
                ${type !== 'current' ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer'}
                ${selected ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 scale-110 shadow-md' : ''}
                ${isTodayDate && !selected ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}
              `}
            >
              {date.getDate()}
              {hasApts && !selected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full" />
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Con turnos</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Ir a hoy
        </Button>
      </div>
    </div>
  );
}
