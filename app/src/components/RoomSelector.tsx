import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getRoomsBySector, SECTOR_LABELS } from '@/types';
import type { RoomType, SectorType } from '@/types';

interface RoomSelectorProps {
  onSelectRoom: (room: RoomType) => void;
  userSector?: SectorType;
}

const sectorCardStyles: Record<string, { hoverBorder: string; hoverText: string; hoverBg: string }> = {
  informatica: {
    hoverBorder: 'hover:border-cyan-500 dark:hover:border-cyan-400',
    hoverText: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    hoverBg: 'group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20',
  },
  industria: {
    hoverBorder: 'hover:border-amber-500 dark:hover:border-amber-400',
    hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    hoverBg: 'group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20',
  },
};

export function RoomSelector({ onSelectRoom, userSector }: RoomSelectorProps) {
  const rooms = userSector ? getRoomsBySector(userSector) : [];
  const sectorLabel = userSector ? SECTOR_LABELS[userSector] : '';
  const cardStyles = userSector ? sectorCardStyles[userSector] : null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Selecciona una Sala
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
          {userSector
            ? `Salas disponibles para ${sectorLabel}`
            : 'Inicia sesión para ver las salas de tu sector'}
        </p>
      </div>

      {!userSector ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Debes iniciar sesión para ver y reservar salas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map((room, index) => (
            <Card
              key={room.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-transparent ${cardStyles?.hoverBorder || ''} group animate-float-in stagger-${index + 1}`}
              onClick={() => onSelectRoom(room.id)}
            >
              <CardHeader className="pb-3">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{room.icon}</div>
                <CardTitle className={`text-lg ${cardStyles?.hoverText || ''} transition-colors`}>
                  {room.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {room.description}
                </CardDescription>
                <Button 
                  variant="ghost" 
                  className={`mt-4 w-full ${cardStyles?.hoverBg || ''} transition-all duration-200`}
                >
                  Seleccionar
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
