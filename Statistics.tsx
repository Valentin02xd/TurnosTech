import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, Award, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Appointment, SectorType } from '@/types';

interface StatisticsProps {
  appointments: Appointment[];
  userSector?: SectorType;
}

const sectorColors: Record<string, { primary: string; iconBg: string; iconText: string; barFill: string; badgeBg: string; badgeText: string }> = {
  informatica: {
    primary: '#00D4FF',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    barFill: '#06b6d4',
    badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    badgeText: 'text-cyan-600 dark:text-cyan-400',
  },
  industria: {
    primary: '#FF9F1C',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    barFill: '#f59e0b',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    badgeText: 'text-amber-600 dark:text-amber-400',
  },
  default: {
    primary: '#3b82f6',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    barFill: '#3b82f6',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    badgeText: 'text-blue-600 dark:text-blue-400',
  },
};

export function Statistics({ appointments, userSector }: StatisticsProps) {
  const [period, setPeriod] = useState<number>(7);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - period);

    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startDate && aptDate <= today;
    });

    const totalTurnos = filteredAppointments.length;
    const promedioDiario = totalTurnos / period;

    // Turnos por día
    const turnosPorDia: { date: string; count: number; label: string }[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = filteredAppointments.filter(apt => apt.date === dateStr).length;
      turnosPorDia.push({
        date: dateStr,
        count,
        label: date.toLocaleDateString('es-ES', { weekday: 'short' })
      });
    }

    // Día con más turnos
    const maxDay = turnosPorDia.reduce((max, current) => 
      current.count > max.count ? current : max, 
      { date: '', count: 0, label: '' }
    );

    // Turnos por usuario
    const userMap = new Map<string, { name: string; count: number }>();
    filteredAppointments.forEach(apt => {
      const existing = userMap.get(apt.userId);
      if (existing) {
        existing.count++;
      } else {
        userMap.set(apt.userId, { name: apt.name, count: 1 });
      }
    });

    const turnosPorUsuario = Array.from(userMap.entries())
      .map(([userId, data]) => ({ userId, name: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTurnos,
      promedioDiario: parseFloat(promedioDiario.toFixed(1)),
      diaMasTurnos: maxDay.count > 0 ? maxDay : null,
      turnosPorDia,
      turnosPorUsuario,
    };
  }, [appointments, period]);

  const colors = sectorColors[userSector || 'default'] || sectorColors.default;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getTrend = (currentCount: number, index: number) => {
    if (index === 0) return '→';
    const prevCount = stats.turnosPorDia[index - 1]?.count || 0;
    if (currentCount > prevCount) return '↑';
    if (currentCount < prevCount) return '↓';
    return '→';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            Estadísticas de Turnos
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Análisis de uso del sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={period.toString()} onValueChange={(v) => setPeriod(Number(v))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="15">Últimos 15 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 hover-lift animate-slide-up stagger-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
              <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.iconText}`} />
            </div>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total de Turnos</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalTurnos}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 hover-lift animate-slide-up stagger-2">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
              <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.iconText}`} />
            </div>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Promedio Diario</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.promedioDiario}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 hover-lift animate-slide-up stagger-3">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
              <Award className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.iconText}`} />
            </div>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Día con Más Turnos</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {stats.diaMasTurnos 
              ? new Date(stats.diaMasTurnos.date + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })
              : 'N/A'
            }
          </div>
          {stats.diaMasTurnos && (
            <div className={`text-sm ${colors.badgeText}`}>
              {stats.diaMasTurnos.count} turnos
            </div>
          )}
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Turnos por Día
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.turnosPorDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="label" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value} turnos`, 'Cantidad']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stats.turnosPorDia.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count > 0 ? colors.barFill : '#e5e7eb'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla detalle */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detalle Día a Día
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Turnos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tendencia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {stats.turnosPorDia.map((day, index) => (
                <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      day.count > 0 
                        ? colors.badgeBg
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {day.count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`${
                      getTrend(day.count, index) === '↑' 
                        ? 'text-green-600 dark:text-green-400' 
                        : getTrend(day.count, index) === '↓'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {getTrend(day.count, index)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranking de usuarios */}
      {stats.turnosPorUsuario.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" />
            Top Usuarios
          </h3>
          <div className="space-y-3">
            {stats.turnosPorUsuario.map((user, index) => (
              <div 
                key={user.userId} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' :
                      index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500'}
                  `}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.count} turnos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
