export type SectorType = 'informatica' | 'industria';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  sector: SectorType;
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  name: string;
  email: string;
  date: string;
  time: string;
  room: RoomType;
  createdAt: string;
}

export type RoomType = 'computacion' | 'robotica' | 'hardware' | 'produccion' | 'laboratorio' | 'cocina';

export interface Room {
  id: RoomType;
  name: string;
  icon: string;
  description: string;
  sector: SectorType;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

export interface DailyStats {
  date: string;
  count: number;
}

export interface UserStats {
  userId: string;
  name: string;
  count: number;
}

export interface Statistics {
  totalTurnos: number;
  promedioDiario: number;
  diaMasTurnos: string | null;
  turnosPorDia: DailyStats[];
  turnosPorUsuario: UserStats[];
}

export interface Theme {
  isDark: boolean;
  toggle: () => void;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const TIME_SLOTS = [
  '08:00 - 09:20',
  '09:30 - 10:50',
  '11:00 - 12:20',
  '12:20 - 13:30',
  '14:00 - 15:20',
  '15:30 - 16:50',
  '17:00 - 18:20',
  '18:20 - 19:30',
] as const;

export const ROOMS: Room[] = [
  {
    id: 'computacion',
    name: 'Sala de Computación',
    icon: '💻',
    description: 'Computadoras y equipos para prácticas de informática',
    sector: 'informatica',
  },
  {
    id: 'robotica',
    name: 'Sala de Robótica',
    icon: '🤖',
    description: 'Kits de robótica y componentes electrónicos',
    sector: 'informatica',
  },
  {
    id: 'hardware',
    name: 'Taller de Hardware y Software',
    icon: '🔧',
    description: 'Equipos para mantenimiento y reparación',
    sector: 'informatica',
  },
  {
    id: 'produccion',
    name: 'Taller de Producción',
    icon: '🏭',
    description: 'Equipos y maquinaria para procesos de producción industrial',
    sector: 'industria',
  },
  {
    id: 'laboratorio',
    name: 'Taller de Laboratorio',
    icon: '🔬',
    description: 'Instrumentos y materiales para prácticas de laboratorio',
    sector: 'industria',
  },
  {
    id: 'cocina',
    name: 'Taller de Cocina',
    icon: '👨‍🍳',
    description: 'Equipamiento profesional para prácticas gastronómicas',
    sector: 'industria',
  },
];

export const SECTOR_LABELS: Record<SectorType, string> = {
  informatica: 'Técnico en Informática',
  industria: 'Industria de Procedimiento',
};

export function getRoomsBySector(sector: SectorType): Room[] {
  return ROOMS.filter(room => room.sector === sector);
}

export function getRoomName(roomId: RoomType): string {
  const room = ROOMS.find(r => r.id === roomId);
  return room?.name || roomId;
}

export function getRoomIcon(roomId: RoomType): string {
  const room = ROOMS.find(r => r.id === roomId);
  return room?.icon || '📍';
}
