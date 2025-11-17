import React, { useState } from 'react';
import { Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { UserList } from './UserList';
import { RoomList } from './RoomList';

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
        fixed md:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {currentUser?.username || 'Chat'}
          </h2>
          <button
            onClick={onToggle}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Room navigation */}
        <div className="p-4 border-b border-gray-200">
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onRoomClick={onRoomClick}
            onAddRoom={onAddRoom}
            compactMode={false}
          />
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'rooms'
                ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-100'
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
              <h3 className="font-semibold text-gray-800 mb-3">Available Rooms</h3>
              <div className="space-y-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => onRoomClick(room.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentRoom === room.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-gray-500">#{room.id}</div>
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
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-medium text-gray-800">{currentUser?.username}</div>
                <div className="text-sm text-gray-500 capitalize">{currentUser?.status}</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {onSettings && (
                <button
                  onClick={onSettings}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings size={18} />
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
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
        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <Menu size={20} />
      </button>
    </>
  );
};