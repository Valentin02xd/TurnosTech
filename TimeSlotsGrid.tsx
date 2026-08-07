import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROOMS, TIME_SLOTS, SECTOR_LABELS } from '@/types';
import type { Appointment, RoomType, SectorType } from '@/types';

interface TimeSlotsGridProps {
  appointments: Appointment[];
  user: { id: string; sector?: SectorType } | null;
}

const sectorStyles: Record<SectorType, {
  header: string;
  available: string;
  availText: string;
  availLabel: string;
  myTurn: string;
  myTurnText: string;
  myTurnLabel: string;
  legendAvail: string;
  legendMy: string;
}> = {
  informatica: {
    header: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300',
    available: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700',
    availText: 'text-cyan-700 dark:text-cyan-400',
    availLabel: 'text-cyan-600 dark:text-cyan-500',
    myTurn: 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-400 dark:border-cyan-500',
    myTurnText: 'text-cyan-700 dark:text-cyan-300',
    myTurnLabel: 'text-cyan-700 dark:text-cyan-300',
    legendAvail: 'bg-cyan-50 dark:bg-cyan-900/20 border-2 border-cyan-300 dark:border-cyan-700',
    legendMy: 'bg-cyan-100 dark:bg-cyan-900/30 border-2 border-cyan-400 dark:border-cyan-500',
  },
  industria: {
    header: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
    available: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700',
    availText: 'text-amber-700 dark:text-amber-400',
    availLabel: 'text-amber-600 dark:text-amber-500',
    myTurn: 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-500',
    myTurnText: 'text-amber-700 dark:text-amber-300',
    myTurnLabel: 'text-amber-700 dark:text-amber-300',
    legendAvail: 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700',
    legendMy: 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400 dark:border-amber-500',
  },
};

const sectors: SectorType[] = ['informatica', 'industria'];

export function TimeSlotsGrid({ appointments, user }: TimeSlotsGridProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const getAppointmentsForSlot = (date: string, time: string, room: RoomType) => {
    return appointments.find(apt => apt.date === date && apt.time === time && apt.room === room);
  };

  const isMyAppointment = (appointment?: Appointment) => {
    if (!appointment || !user) return false;
    return String(appointment.userId) === String(user.id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Estado de Horarios por Sala
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
          Visualiza la disponibilidad de todas las salas en tiempo real
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-xs">
          <Label htmlFor="grid-date" className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            Fecha
          </Label>
          <Input
            id="grid-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {sectors.map((sector) => {
        const sectorRooms = ROOMS.filter(r => r.sector === sector);
        const colors = sectorStyles[sector];

        return (
          <div key={sector} className="space-y-4">
            <div className={`rounded-xl border px-4 py-3 ${colors.header}`}>
              <h3 className="text-base sm:text-lg font-bold text-heading">
                {SECTOR_LABELS[sector]}
              </h3>
            </div>

            <div className="space-y-6">
              {sectorRooms.map((room, roomIndex) => (
                <div
                  key={room.id}
                  className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3 sm:p-6 animate-slide-up stagger-${roomIndex + 1}`}
                >
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl">{room.icon}</span>
                    {room.name}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {TIME_SLOTS.map((time, slotIndex) => {
                      const appointment = getAppointmentsForSlot(selectedDate, time, room.id);
                      const isOccupied = !!appointment;
                      const isMine = isMyAppointment(appointment);

                      return (
                        <div
                          key={`${room.id}-${time}`}
                          className={`
                            p-2 sm:p-3 rounded-lg border-2 text-center transition-all duration-200 hover:scale-105 animate-fade-in
                            ${isOccupied
                              ? isMine
                                ? colors.myTurn
                                : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600'
                              : colors.available
                            }
                          `}
                          style={{ animationDelay: `${slotIndex * 0.04}s` }}
                        >
                          <div className={`text-xs sm:text-sm font-medium ${
                            isOccupied
                              ? 'text-gray-700 dark:text-gray-300'
                              : colors.availText
                          }`}>
                            {time}
                          </div>
                          {isOccupied && (
                            <div className="mt-1">
                              <div className={`text-xs font-medium truncate ${
                                isMine
                                  ? colors.myTurnLabel
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {isMine ? '✓ Tu turno' : appointment.name}
                              </div>
                            </div>
                          )}
                          {!isOccupied && (
                            <div className={`text-xs ${colors.availLabel} mt-1`}>
                              Disponible
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-cyan-50 dark:bg-cyan-900/20 border-2 border-cyan-300 dark:border-cyan-700" />
          <span className="text-gray-600 dark:text-gray-400">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Ocupado</span>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-cyan-100 dark:bg-cyan-900/30 border-2 border-cyan-400 dark:border-cyan-500" />
            <span className="text-gray-600 dark:text-gray-400">Tu turno</span>
          </div>
        )}
      </div>
    </div>
  );
}
