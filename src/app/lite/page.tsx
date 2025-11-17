'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { MessageCircle, Users, Clock, Search, Settings } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/utils/LanguageContext';

// Environment-based configuration
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088'}/api`;

interface Room {
  id: number;
  name: string;
}

interface User {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'banned';
  avatar?: string;
}

interface ChatListItem {
  id: string;
  name: string;
  type: 'room' | 'user';
  status: 'online' | 'offline';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

function LiteChatListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const username = searchParams.get('username') || 'Guest';
  
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Standard groups from full version - matching the backend
  const standardGroups = useMemo(() => [
    'general',
    'store',
    'orders',
    'payment',
    'friends',
    'church',
    'family',
  ], []);

  // Fetch rooms and users
  const fetchChatList = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch rooms from API
      const roomsResponse = await fetch(`${API_BASE_URL}/rooms?username=${encodeURIComponent(username)}`);
      const roomsData = await roomsResponse.json();

      const chatItems: ChatListItem[] = [];
      const roomIdMap: Record<string, number> = {};

      if (roomsData.success && roomsData.data) {
        // Create room ID mapping
        roomsData.data.forEach((room: Room) => {
          roomIdMap[room.name] = room.id;
        });

        // Add standard groups in order
        for (const groupName of standardGroups) {
          const roomId = roomIdMap[groupName];
          if (roomId) {
            const roomKey = `room${groupName.charAt(0).toUpperCase() + groupName.slice(1)}` as keyof typeof t;
            chatItems.push({
              id: `room-${roomId}`,
              name: t[roomKey] || groupName.charAt(0).toUpperCase() + groupName.slice(1),
              type: 'room',
              status: 'online',
              lastMessage: t.tapToOpen,
              lastMessageTime: new Date(),
              unreadCount: 0,
            });
          }
        }

        // Fetch users from general room only (to avoid duplicates)
        const generalRoomId = roomIdMap['general'];
        if (generalRoomId) {
          try {
            const usersResponse = await fetch(`${API_BASE_URL}/rooms/${generalRoomId}/users?username=${encodeURIComponent(username)}`);
            const usersData = await usersResponse.json();

            if (usersData.success && usersData.data) {
              // Add unique users to chat list
              const addedUsers = new Set<string>();
              usersData.data.forEach((user: { id: number; username: string; status?: string }) => {
                // Add individual users to chat list (excluding self and duplicates)
                if (user.username !== username && user.status !== 'banned' && !addedUsers.has(user.username)) {
                  addedUsers.add(user.username);
                  chatItems.push({
                    id: `user-${user.id}`,
                    name: user.username,
                    type: 'user',
                    status: (user.status === 'online' || user.status === 'offline') ? user.status : 'offline',
                    lastMessage: user.status === 'online' ? 'Online' : 'Offline',
                    lastMessageTime: new Date(),
                    unreadCount: 0,
                  });
                }
              });
            }
          } catch (error) {
            console.error('Failed to fetch users:', error);
          }
        }
      }

      setChatList(chatItems);
    } catch (error) {
      console.error('Failed to fetch chat list:', error);
      // Show empty state on error
      setChatList([]);
    } finally {
      setIsLoading(false);
    }
  }, [username, standardGroups]);

  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);

  // Filter chat list based on search query
  const filteredChatList = chatList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle chat item click
  const handleChatClick = (item: ChatListItem) => {
    if (item.type === 'room') {
      const roomId = item.id.replace('room-', '');
      router.push(`/lite/chat?room=${item.name.toLowerCase()}&roomId=${roomId}&username=${encodeURIComponent(username)}`);
    } else {
      // For user chats, create a private room or navigate to existing one
      router.push(`/lite/chat?user=${item.name}&userId=${item.id.replace('user-', '')}&username=${encodeURIComponent(username)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* User info banner */}
      <div className="bg-white p-6 shadow-sm border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{t.helloUser}, {username}!</h2>
            <p className="text-gray-600 text-lg mt-1">{t.chooseChat}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-lg font-semibold">
              {t.online}
            </div>
            <button
              onClick={() => router.push(`/lite/settings?username=${encodeURIComponent(username)}`)}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              title="Settings"
            >
              <Settings size={28} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="p-4 bg-white border-b sticky top-16 z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={28} />
          <input
            type="text"
            placeholder={t.searchChats}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-4 py-4 text-xl border-2 border-gray-300 rounded-2xl focus:border-green-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-2xl text-gray-500">{t.loadingChats}</p>
          </div>
        ) : filteredChatList.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-2xl text-gray-500">{t.noChatsFound}</p>
            <p className="text-lg text-gray-400 mt-2">{t.tryDifferentSearch}</p>
          </div>
        ) : (
          filteredChatList.map((item) => (
            <button
              key={item.id}
              onClick={() => handleChatClick(item)}
              className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors p-6 flex items-center space-x-4"
            >
              {/* Avatar/Icon */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                item.type === 'room' 
                  ? 'bg-linear-to-br from-green-500 to-teal-500' 
                  : item.status === 'online'
                  ? 'bg-linear-to-br from-blue-500 to-cyan-500'
                  : 'bg-gray-400'
              }`}>
                {item.type === 'room' ? (
                  <Users size={32} />
                ) : (
                  item.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Chat info */}
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {item.name}
                  </h3>
                  {item.lastMessageTime && (
                    <span className="text-base text-gray-500">
                      {item.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg text-gray-600 truncate">
                    {item.lastMessage || 'No messages yet'}
                  </p>
                  
                  {/* Status indicator */}
                  <div className="flex items-center space-x-2">
                    {item.type === 'user' && (
                      <div className={`w-4 h-4 rounded-full ${
                        item.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    )}
                    {item.unreadCount && item.unreadCount > 0 && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-base font-bold min-w-7 text-center">
                        {item.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Bottom spacing for better scrolling */}
      <div className="h-20" />
    </div>
  );
}

export default function LiteChatListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-2xl text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <LiteChatListContent />
    </Suspense>
  );
}
