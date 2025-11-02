import React, { useEffect } from 'react';
import { Plus, MessageCircle, ShoppingBag, Package, CreditCard, Users, Church as ChurchIcon, Home as HomeIcon } from 'lucide-react';
import { debugLog } from '../utils/debugLogger';

interface Room {
  id: string;
  name: string;
}

interface RoomListProps {
  rooms: Room[];
  currentRoom: string;
  onRoomClick: (roomId: string) => void;
  onAddRoom?: () => void;
  compactMode?: boolean;
}

const roomIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  general: MessageCircle,
  store: ShoppingBag,
  orders: Package,
  payment: CreditCard,
  friends: Users,
  church: ChurchIcon,
  family: HomeIcon,
};

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  currentRoom,
  onRoomClick,
  onAddRoom,
  compactMode = false,
}) => {
  useEffect(() => {
    debugLog.debug('RoomList', 'Component mounted', {
      rooms_count: rooms.length,
      current_room: currentRoom,
      compact_mode: compactMode,
      room_ids: rooms.map(r => r.id),
    });

    return () => {
      debugLog.debug('RoomList', 'Component unmounting');
    };
  }, [rooms, currentRoom, compactMode]);

  useEffect(() => {
    debugLog.debug('RoomList', 'Current room changed', {
      new_room: currentRoom,
      is_private: currentRoom.startsWith('private-'),
    });
  }, [currentRoom]);

  const renderRoomIcon = (roomId: string, size: number = 20, className: string = '') => {
    const IconComponent = roomIcons[roomId];
    if (IconComponent) {
      debugLog.debug('RoomList', 'Rendering room icon', {
        room_id: roomId,
        icon_found: true,
        size,
      });
      return <IconComponent size={size} className={className} />;
    }
    debugLog.debug('RoomList', 'Using default icon for room', {
      room_id: roomId,
      icon_found: false,
      size,
    });
    return <MessageCircle size={size} className={className} />;
  };

  const handleRoomClick = (roomId: string) => {
    debugLog.info('RoomList', 'Room clicked', {
      clicked_room: roomId,
      previous_room: currentRoom,
      is_private: roomId.startsWith('private-'),
    });
    onRoomClick(roomId);
  };

  const handleAddRoom = () => {
    debugLog.info('RoomList', 'Add room button clicked');
    onAddRoom?.();
  };

  if (currentRoom.startsWith('private-')) {
    debugLog.debug('RoomList', 'Rendering private room view', {
      private_room: currentRoom,
      private_user: currentRoom.replace('private-', ''),
    });

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleRoomClick('general')}
          className="p-2 hover:bg-discord-bg-tertiary rounded-lg text-discord-text-primary"
          title="Back to General"
        >
          ← Back
        </button>
        <div className="flex items-center space-x-2 p-2 bg-discord-bg-accent text-white rounded-lg">
          <Users size={20} />
          <span>{currentRoom.replace('private-', '')}</span>
        </div>
      </div>
    );
  }

  debugLog.debug('RoomList', 'Rendering room list', {
    rooms_count: rooms.length,
    compact_mode: compactMode,
  });

  return (
    <div className="flex items-center space-x-4">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => handleRoomClick(room.id)}
          className={`p-2 rounded-lg hover:bg-discord-bg-tertiary transition-all duration-200 shrink-0 ${
            currentRoom === room.id 
              ? 'bg-blue-500 text-white border-2 border-blue-500' 
              : 'text-discord-text-primary border-2 border-transparent'
          }`}
          title={room.name}
        >
          {renderRoomIcon(room.id, 20, currentRoom === room.id ? 'text-white' : 'text-discord-text-primary')}
        </button>
      ))}
      {!compactMode && onAddRoom && (
        <button
          onClick={handleAddRoom}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shrink-0 hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  );
};