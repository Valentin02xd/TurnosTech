import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from './Calendar';
import { TIME_SLOTS, ROOMS } from '@/types';
import type { RoomType, Appointment, SectorType } from '@/types';

interface BookingFormProps {
  room: RoomType;
  appointments: Appointment[];
  onBack: () => void;
  onSubmit: (data: { date: string; time: string; room: RoomType }) => Promise<{ success: boolean; message?: string }>;
  userSector?: SectorType;
}

const sectorSlotStyles: Record<string, { selected: string; hoverBorder: string; hoverBg: string; selectedIndicator: string; btnClass: string }> = {
  informatica: {
    selected: 'bg-cyan-600 border-cyan-600 text-white',
    hoverBorder: 'hover:border-cyan-400',
    hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
    selectedIndicator: 'bg-cyan-600',
    btnClass: 'bg-cyan-600 hover:bg-cyan-700 text-white',
  },
  industria: {
    selected: 'bg-amber-500 border-amber-500 text-white',
    hoverBorder: 'hover:border-amber-400',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
    selectedIndicator: 'bg-amber-500',
    btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
};

export function BookingForm({ room, appointments, onBack, onSubmit, userSector }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const roomInfo = ROOMS.find(r => r.id === room);
  const slotStyles = userSector ? sectorSlotStyles[userSector] : null;

  const occupiedSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date === dateStr && apt.room === room)
      .map(apt => apt.time);
  }, [selectedDate, appointments, room]);

  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Por favor selecciona una fecha y horario');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const dateStr = selectedDate.toISOString().split('T')[0];
    const result = await onSubmit({ date: dateStr, time: selectedTime, room });

    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedDate(null);
        setSelectedTime('');
      }, 3000);
    } else {
      setError(result.message || 'Error al reservar el turno');
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
            ¡Turno reservado!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tu turno ha sido confirmado exitosamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>{roomInfo?.icon}</span>
            <span className="truncate">{roomInfo?.name}</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Reserva tu turno seleccionando fecha y horario
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Selecciona una fecha
          </Label>
          <CalendarComponent
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            appointments={appointments}
          />
          {selectedDate && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fecha seleccionada:{' '}
              <span className="font-medium">
                {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Selecciona un horario
          </Label>
          
          {!selectedDate ? (
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Primero selecciona una fecha para ver los horarios disponibles
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {TIME_SLOTS.map((time, index) => {
                  const isOccupied = occupiedSlots.includes(time);
                  const isSelected = selectedTime === time;

                  return (
                    <button
                      key={time}
                      onClick={() => !isOccupied && setSelectedTime(time)}
                      disabled={isOccupied}
                      className={`
                        p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all duration-200 animate-fade-in
                        ${!isOccupied ? 'hover:scale-105 active:scale-95' : ''}
                        ${isOccupied 
                          ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                          : isSelected
                            ? `${slotStyles?.selected || 'bg-blue-600 border-blue-600 text-white'} scale-105 shadow-md`
                            : `bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white ${slotStyles?.hoverBorder || 'hover:border-blue-400'} ${slotStyles?.hoverBg || 'hover:bg-blue-50 dark:hover:bg-blue-900/20'}`
                        }
                      `}
                      style={{ animationDelay: `${index * 0.04}s` }}
                    >
                      <div>{time}</div>
                      {isOccupied && (
                        <div className="text-xs mt-1">Ocupado</div>
                      )}
                      {!isOccupied && !isSelected && (
                        <div className="text-xs mt-1 text-green-600 dark:text-green-400">Disponible</div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Disponible</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-3 h-3 ${slotStyles?.selectedIndicator || 'bg-blue-600'} rounded`} />
                  <span className="text-gray-600 dark:text-gray-400">Seleccionado</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">Ocupado</span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || isSubmitting}
            className={`w-full ${slotStyles?.btnClass || ''}`}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reservando...
              </>
            ) : (
              'Reservar Turno'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
