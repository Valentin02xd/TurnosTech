import { useState } from 'react';
import { Calendar, Clock, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getRoomName, getRoomIcon } from '@/types';
import type { Appointment, SectorType } from '@/types';

interface AppointmentsListProps {
  appointments: Appointment[];
  userId: string;
  onCancel: (id: string) => Promise<void>;
  userSector?: SectorType;
}

const sectorBorderStyles: Record<string, { today: string; todayLabel: string }> = {
  informatica: {
    today: 'border-cyan-400 dark:border-cyan-500',
    todayLabel: 'text-cyan-600 dark:text-cyan-400',
  },
  industria: {
    today: 'border-amber-400 dark:border-amber-500',
    todayLabel: 'text-amber-600 dark:text-amber-400',
  },
};

export function AppointmentsList({ appointments, userId, onCancel, userSector }: AppointmentsListProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const borderStyles = userSector ? sectorBorderStyles[userSector] : null;

  const myAppointments = appointments
    .filter(apt => String(apt.userId) === String(userId))
    .filter(apt => {
      const todayStr = new Date().toISOString().split('T')[0];
      return apt.date >= todayStr;
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;
    
    setCancelingId(selectedAppointment.id);
    setShowConfirmDialog(false);
    
    await onCancel(selectedAppointment.id);
    
    setCancelingId(null);
    setSelectedAppointment(null);
  };

  if (myAppointments.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">📅</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No tienes turnos reservados
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Selecciona una sala y reserva tu primer turno
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
        Mis Turnos Reservados
        <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400">
          ({myAppointments.length})
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {myAppointments.map((appointment, index) => {
          const isToday = appointment.date === new Date().toISOString().split('T')[0];
          
          return (
            <div
              key={appointment.id}
              className={`
                bg-white dark:bg-slate-800 rounded-xl border-2 p-3 sm:p-4 transition-all duration-200 hover-lift animate-slide-up
                ${isToday 
                  ? `${borderStyles?.today || 'border-blue-400 dark:border-blue-500'} shadow-md` 
                  : 'border-gray-200 dark:border-slate-700'
                }
              `}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {isToday && (
                <div className={`text-xs font-medium ${borderStyles?.todayLabel || 'text-blue-600 dark:text-blue-400'} mb-2`}>
                  📍 Hoy
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getRoomIcon(appointment.room)}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getRoomName(appointment.room)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {appointment.time}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancelClick(appointment)}
                  disabled={cancelingId === appointment.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {cancelingId === appointment.id ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmar cancelación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cancelar este turno?
              {selectedAppointment && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">
                      {getRoomIcon(selectedAppointment.room)} {getRoomName(selectedAppointment.room)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedAppointment.date + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedAppointment.time}
                  </div>
                </div>
              )}
              <p className="mt-4 text-sm text-gray-500">
                Esta acción no se puede deshacer.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              No, mantener turno
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmCancel}
            >
              Sí, cancelar turno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
