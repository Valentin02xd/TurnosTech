import { useState, useCallback } from 'react';
import type { Appointment, RoomType, DailyStats, UserStats } from '@/types';

const API_BASE_URL = '/api';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAppointments = useCallback(async (room: RoomType | 'all' = 'all') => {
    setIsLoading(true);
    try {
      const url = room === 'all' 
        ? `${API_BASE_URL}/appointments` 
        : `${API_BASE_URL}/appointments?room=${room}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (appointmentData: { date: string; time: string; room: RoomType }): Promise<{ success: boolean; appointment?: Appointment; message?: string }> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'Debes iniciar sesión' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppointments(prev => [...prev, data.appointment]);
        return { success: true, appointment: data.appointment };
      } else {
        return { success: false, message: data.message || 'Error al crear turno' };
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }, []);

  const deleteAppointment = useCallback(async (id: string): Promise<{ success: boolean; message?: string }> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { success: false, message: 'Debes iniciar sesión' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Error al cancelar turno' };
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }, []);

  const getAppointmentsByDate = useCallback((date: string, room?: RoomType) => {
    return appointments.filter(apt => {
      if (apt.date !== date) return false;
      if (room && apt.room !== room) return false;
      return true;
    });
  }, [appointments]);

  const getOccupiedTimeSlots = useCallback((date: string, room: RoomType) => {
    return appointments
      .filter(apt => apt.date === date && apt.room === room)
      .map(apt => apt.time);
  }, [appointments]);

  const getStatistics = useCallback((days: number = 7): { 
    totalTurnos: number; 
    promedioDiario: number; 
    diaMasTurnos: string | null;
    turnosPorDia: DailyStats[];
    turnosPorUsuario: UserStats[];
  } => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startDate && aptDate <= today;
    });

    const totalTurnos = filteredAppointments.length;
    const promedioDiario = totalTurnos / days;

    // Turnos por día
    const turnosPorDiaMap = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      turnosPorDiaMap.set(dateStr, 0);
    }

    filteredAppointments.forEach(apt => {
      const count = turnosPorDiaMap.get(apt.date) || 0;
      turnosPorDiaMap.set(apt.date, count + 1);
    });

    const turnosPorDia: DailyStats[] = Array.from(turnosPorDiaMap.entries())
      .map(([date, count]) => ({ date, count }));

    // Día con más turnos
    const maxDay = turnosPorDia.reduce((max, current) => 
      current.count > max.count ? current : max, 
      { date: '', count: 0 }
    );

    // Turnos por usuario
    const turnosPorUsuarioMap = new Map<string, { name: string; count: number }>();
    filteredAppointments.forEach(apt => {
      const existing = turnosPorUsuarioMap.get(apt.userId);
      if (existing) {
        existing.count++;
      } else {
        turnosPorUsuarioMap.set(apt.userId, { name: apt.name, count: 1 });
      }
    });

    const turnosPorUsuario: UserStats[] = Array.from(turnosPorUsuarioMap.entries())
      .map(([userId, data]) => ({ userId, name: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalTurnos,
      promedioDiario: parseFloat(promedioDiario.toFixed(1)),
      diaMasTurnos: maxDay.count > 0 ? maxDay.date : null,
      turnosPorDia,
      turnosPorUsuario,
    };
  }, [appointments]);

  return {
    appointments,
    isLoading,
    fetchAppointments,
    createAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getOccupiedTimeSlots,
    getStatistics,
  };
}
