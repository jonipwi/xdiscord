import React, { useState } from 'react';
import { Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { UserList } from './UserList';
import { RoomList } from './RoomList';
import ThemeToggle from './ThemeToggle';

interface User {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'banned';
  avatar?: string;
}

interface Room {
  id: string;
  name: string;
}

interface SidebarProps {
  users: User[];
  rooms: Room[];
  currentRoom: string;
  currentUser: User | null;
  onRoomClick: (roomId: string) => void;
  onUserClick: (userId: string) => void;
  onUserBan?: (userId: string) => void;
  onUserUnban?: (userId: string) => void;
  onAddRoom?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  users,
  rooms,
  currentRoom,
  currentUser,
  onRoomClick,
  onUserClick,
  onUserBan,
  onUserUnban,
  onAddRoom,
  onSettings,
  onLogout,
  isOpen,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'users'>('rooms');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-80 bg-discord-bg-primary border-r border-discord-border-primary
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-discord-border-primary">
          <h2 className="text-lg font-semibold text-discord-text-primary">
            {currentUser?.username || 'Chat'}
          </h2>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={onToggle}
              className="md:hidden p-2 hover:bg-discord-bg-secondary rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Room navigation */}
        <div className="p-4 border-b border-discord-border-primary">
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onRoomClick={onRoomClick}
            onAddRoom={onAddRoom}
            compactMode={false}
          />
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-discord-border-primary">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'rooms'
                ? 'bg-discord-bg-accent text-white border-b-2 border-discord-bg-accent'
                : 'text-discord-text-secondary hover:bg-discord-bg-secondary'
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'users'
                ? 'bg-discord-bg-accent text-white border-b-2 border-discord-bg-accent'
                : 'text-discord-text-secondary hover:bg-discord-bg-secondary'
            }`}
          >
            <Users size={16} className="inline mr-1" />
            Users
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'rooms' && (
            <div className="p-4">
              <h3 className="font-semibold text-discord-text-primary mb-3">Available Rooms</h3>
              <div className="space-y-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => onRoomClick(room.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentRoom === room.id
                        ? 'bg-discord-bg-accent text-white'
                        : 'hover:bg-discord-bg-secondary text-discord-text-primary'
                    }`}
                  >
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-discord-text-muted">#{room.id}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UserList
              users={users}
              currentUser={currentUser}
              onUserClick={onUserClick}
              onUserBan={onUserBan}
              onUserUnban={onUserUnban}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-discord-border-primary p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-discord-bg-accent rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-medium text-discord-text-primary">{currentUser?.username}</div>
                <div className="text-sm text-discord-text-muted capitalize">{currentUser?.status}</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {onSettings && (
                <button
                  onClick={onSettings}
                  className="p-2 text-discord-text-secondary hover:bg-discord-bg-secondary rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings size={18} />
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-discord-text-secondary hover:bg-discord-bg-secondary rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-discord-bg-primary rounded-lg shadow-lg border border-discord-border-primary"
      >
        <Menu size={20} />
      </button>
    </>
  );
};