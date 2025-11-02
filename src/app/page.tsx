'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, User, LogOut, Ban, Smile, Heart, Star, Circle, Square, Triangle, Minimize2, Maximize2, X, Menu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import our new components
import {
  ChatMessage,
  UserList,
  RoomList,
  ChatInput,
  Sidebar,
  Modal,
  ConfirmModal,
  InputModal,
  ThemeToggle
} from '../components';

// Import API service
import { roomsApi, usersApi, messagesApi, uploadApi } from '../services/api';
import { debugLog } from '../utils/debugLogger';

// Environment-based configuration
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088'}/api`;
const WS_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088'}/ws`;

type MessageType = 'text' | 'image' | 'voice' | 'graph' | 'voting' | 'attachment' | 'emoticon' | 'gif_emoticon';

interface Message {
  id: string;
  type: MessageType;
  content: string | File | Blob | { name: string; value: number }[] | { question: string; options: string[]; votes: number[] };
  timestamp: Date;
  status: 'sending' | 'sent' | 'read' | 'unread';
  userId?: string;
  username?: string;
  fileURL?: string;
  fileName?: string;
  fileSize?: number;
}

interface Room {
  id: string;
  name: string;
}

interface ApiRoom {
  id: number;
  name: string;
}

interface ApiUser {
  id: number;
  username: string;
  display_name?: string;
  status?: "offline" | "online" | "banned";
}

interface User {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'banned';
  avatar?: string;
}

const defaultRooms: Room[] = [
  { id: 'general', name: 'General' },
  { id: 'store', name: 'Store' },
  { id: 'orders', name: 'Orders' },
  { id: 'payment', name: 'Payment' },
  { id: 'friends', name: 'Friends' },
  { id: 'church', name: 'Church' },
  { id: 'family', name: 'Family' },
];

const initialRoomUsers: Record<string, User[]> = {
  general: [
    { id: '1', username: 'Alice', status: 'online' },
    { id: '2', username: 'Bob', status: 'online' },
    { id: '3', username: 'Charlie', status: 'offline' },
  ],
  store: [
    { id: '4', username: 'Diana', status: 'online' },
    { id: '5', username: 'Eve', status: 'offline' },
  ],
  orders: [
    { id: '6', username: 'Frank', status: 'online' },
  ],
  payment: [
    { id: '7', username: 'Grace', status: 'offline' },
  ],
  friends: [
    { id: '8', username: 'Henry', status: 'online' },
  ],
  church: [
    { id: '9', username: 'Ivy', status: 'online' },
  ],
  family: [
    { id: '10', username: 'Jack', status: 'offline' },
  ],
};

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>(defaultRooms);
  const [roomIdMap, setRoomIdMap] = useState<Record<string, number>>({});
  const [currentRoom, setCurrentRoom] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const room = urlParams.get('room');
      if (room && defaultRooms.find(r => r.id === room)) {
        return room;
      }
    }
    return 'general';
  });
  const [roomUsers, setRoomUsers] = useState<Record<string, User[]>>({});
  const [inviteInput, setInviteInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedIcon, setSelectedIcon] = useState<string>('User');
  const [isEmbedded] = useState(typeof window !== 'undefined' && window.self !== window.top);
  const [compactMode] = useState(typeof window !== 'undefined' && (window.self !== window.top || new URLSearchParams(window.location.search).get('compact') === 'true'));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768; // Auto-hide sidebar on mobile
    }
    return false;
  });
  const [isModalMode, setIsModalMode] = useState(false);
  const [isModalMaximized, setIsModalMaximized] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('maximized') === 'true';
    }
    return false;
  });
  const [hideModalHeader, setHideModalHeader] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('hideHeader') === 'true';
    }
    return false;
  });
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  // User filtering state
  const [selectedUserFilter, setSelectedUserFilter] = useState<string | null>(null);

  // Missing state and ref declarations
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('username') || 'Anonymous';
    }
    return 'Anonymous';
  });
  const wsRef = useRef<WebSocket | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasInitiatedConnectionRef = useRef(false);
  const hasFetchedInitialDataRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentRoom]);

  // WebSocket connection management - moved outside useEffect
  const connectWebSocket = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      debugLog.debug('Home', 'WebSocket connection already in progress, skipping');
      return;
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
      debugLog.error('Home', 'Max WebSocket reconnection attempts reached', undefined, {
        max_attempts: maxReconnectAttempts,
      });
      return;
    }

    // Get current room ID from mapping
    const roomIdNum = roomIdMap[currentRoom] || 1;
    const userId = 1; // In a real app, this would come from authentication

    const wsUrl = `${WS_BASE_URL}?room_id=${roomIdNum}&user_id=${userId}&username=${encodeURIComponent(username)}`;

    debugLog.info('Home', 'Initiating WebSocket connection', {
      url: wsUrl,
      attempt: reconnectAttempts + 1,
      max_attempts: maxReconnectAttempts,
    });

    // Close existing connection if any (but not if it's already closing)
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSING && wsRef.current.readyState !== WebSocket.CLOSED) {
      debugLog.debug('Home', 'Closing existing WebSocket connection');
      wsRef.current.close(1000, 'New connection requested');
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      debugLog.info('Home', 'WebSocket connection established', {
        ready_state: ws.readyState,
        url: ws.url,
        reconnect_attempts: reconnectAttempts,
      });
      console.log('WebSocket connected');
      setReconnectAttempts(0); // Reset reconnect attempts on successful connection

      // Join the current room
      const joinMessage = {
        type: 'join',
        room: currentRoom,
        user: username
      };

      debugLog.info('Home', 'Joining initial room via WebSocket', joinMessage);
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = (event) => {
      // Handle ping messages from server - browsers handle ping/pong automatically
      // But if we receive binary data, it might be a custom ping
      if (event.data instanceof ArrayBuffer) {
        debugLog.debug('Home', 'Received binary WebSocket message (possibly ping)');
        return;
      }

      try {
        const data = JSON.parse(event.data);
        debugLog.logWebSocketEvent('Home', 'message_received', {
          message_type: data.type,
          room: data.room,
          user: data.user,
          message_size: event.data.length,
        });

        console.log('WebSocket message:', data);

        if (data.type === 'message') {
          debugLog.info('Home', 'Processing incoming chat message', {
            message_id: data.id,
            message_type: data.messageType,
            sender: data.user,
            room: data.room,
          });

          // Add incoming message to state
          const newMessage: Message = {
            id: data.id || crypto.randomUUID(),
            type: data.messageType || 'text',
            content: data.content,
            timestamp: new Date(data.timestamp || Date.now()),
            status: 'read'
          };

          setMessages(prev => ({
            ...prev,
            [data.room]: [...(prev[data.room] || []), newMessage]
          }));

          debugLog.debug('Home', 'Incoming message added to state', {
            message_id: newMessage.id,
            room: data.room,
            total_messages_in_room: (messages[data.room] || []).length + 1,
          });
        } else if (data.type === 'join') {
          debugLog.debug('Home', 'User joined room (ignoring display)', {
            user: data.user,
            room: data.room,
          });
          // Join messages are for room management, not display
        } else if (data.type === 'user_joined') {
          debugLog.info('Home', 'User joined room', {
            user: data.user,
            room: data.room,
          });

          // Update user status or add user to room
          setRoomUsers(prev => {
            const roomUsers = prev[data.room] || [];
            const existingUser = roomUsers.find(u => u.username === data.user);
            if (existingUser) {
              return {
                ...prev,
                [data.room]: roomUsers.map(user =>
                  user.username === data.user ? { ...user, status: 'online' as const } : user
                )
              };
            } else {
              // Add new user
              const newUser = {
                id: data.user_id?.toString() || crypto.randomUUID(),
                username: data.user,
                status: 'online' as const,
                avatar: null
              };
              return {
                ...prev,
                [data.room]: [...roomUsers, newUser]
              };
            }
          });
        } else if (data.type === 'user_left') {
          debugLog.info('Home', 'User left room', {
            user: data.user,
            room: data.room,
          });

          // Update user status
          setRoomUsers(prev => ({
            ...prev,
            [data.room]: prev[data.room]?.map(user =>
              user.username === data.user ? { ...user, status: 'offline' as const } : user
            ) || []
          }));
        } else if (data.type === 'typing') {
          debugLog.debug('Home', 'Typing indicator received', {
            user: data.user,
            room: data.room,
            is_typing: data.isTyping,
          });
          setIsTyping(data.isTyping);
        } else if (data.type === 'vote') {
          debugLog.info('Home', 'Vote update received via WebSocket', {
            message_id: data.messageId,
            option_index: data.optionIndex,
            voter: data.user,
            room: data.room,
          });

          // Update the voting message with the new vote
          setMessages(prev => ({
            ...prev,
            [data.room]: prev[data.room]?.map(msg => {
              if (msg.id === data.messageId && msg.type === 'voting') {
                const poll = typeof msg.content === 'string' 
                  ? JSON.parse(msg.content) 
                  : msg.content as { question: string; options: string[]; votes: number[]; voters: string[] };
                
                // Check if user has already voted (server should prevent this, but double-check)
                if (poll.voters && poll.voters.includes(data.user)) {
                  debugLog.warn('Home', 'Received vote from user who already voted', {
                    message_id: data.messageId,
                    user: data.user,
                    existing_voters: poll.voters,
                  });
                  return msg;
                }
                
                // Add user to voters list and increment vote count
                const updatedVoters = [...(poll.voters || []), data.user];
                const updatedVotes = [...poll.votes];
                updatedVotes[data.optionIndex] = (updatedVotes[data.optionIndex] || 0) + 1;
                
                const updatedPoll = {
                  ...poll,
                  votes: updatedVotes,
                  voters: updatedVoters,
                };

                debugLog.info('Home', 'Vote applied from WebSocket', {
                  message_id: data.messageId,
                  option_index: data.optionIndex,
                  new_vote_count: updatedVotes[data.optionIndex],
                  total_voters: updatedVoters.length,
                  voter: data.user,
                });

                return {
                  ...msg,
                  content: typeof msg.content === 'string' ? JSON.stringify(updatedPoll) : updatedPoll
                };
              }
              return msg;
            }) || []
          }));
        } else if (data.type === 'user_status') {
          debugLog.info('Home', 'User status change received via WebSocket', {
            target_user_id: data.user_id,
            new_status: data.status,
            room: data.room,
          });

          // Update user status in all rooms
          setRoomUsers(prev => {
            const updatedUsers = { ...prev };
            Object.keys(updatedUsers).forEach(roomKey => {
              updatedUsers[roomKey] = updatedUsers[roomKey]?.map(user =>
                user.id === data.user_id?.toString() ? { ...user, status: data.status as 'online' | 'offline' | 'banned' } : user
              ) || [];
            });
            return updatedUsers;
          });
        } else {
          debugLog.warn('Home', 'Unknown WebSocket message type received', {
            message_type: data.type,
            full_data: data,
          });
        }
      } catch (error) {
        debugLog.error('Home', 'Failed to parse WebSocket message', error as Error, {
          raw_data: event.data.substring(0, 200),
        });
      }
    };

    ws.onclose = (event) => {
      debugLog.warn('Home', 'WebSocket connection closed', {
        code: event.code,
        reason: event.reason,
        was_clean: event.wasClean,
        url: ws.url,
        reconnect_attempts: reconnectAttempts,
      });
      console.log('WebSocket disconnected, reconnecting...');

      // Clear the reference if this is the current connection
      if (wsRef.current === ws) {
        wsRef.current = null;
      }

      // Only attempt reconnection if it's not a clean close (code 1000) and we haven't exceeded max attempts
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        // Implement exponential backoff for reconnection
        setReconnectAttempts(prev => prev + 1);
        const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // 1s to 30s

        debugLog.info('Home', 'Scheduling WebSocket reconnection', {
          delay_ms: reconnectDelay,
          attempt: reconnectAttempts + 1,
          max_attempts: maxReconnectAttempts,
          reason: event.reason || 'unknown',
          close_code: event.code,
        });

        setTimeout(() => {
          connectWebSocket();
        }, reconnectDelay);
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        debugLog.error('Home', 'Max WebSocket reconnection attempts reached, giving up', undefined, {
          max_attempts: maxReconnectAttempts,
        });
      }
    };

    ws.onerror = (error) => {
      debugLog.error('Home', 'WebSocket error occurred', new Error('WebSocket connection error'), {
        ready_state: ws.readyState,
        url: ws.url,
        reconnect_attempts: reconnectAttempts,
      });
      console.error('WebSocket error:', error);
    };
  }, [currentRoom, roomIdMap, username, messages, reconnectAttempts]);

  // Component lifecycle logging
  useEffect(() => {
    debugLog.info('Home', 'Component mounted', {
      is_embedded: isEmbedded,
      compact_mode: compactMode,
      initial_room: currentRoom,
      username,
    });

    return () => {
      debugLog.info('Home', 'Component unmounting');
    };
  }, [isEmbedded, compactMode, currentRoom, username]);

  // State change logging
  useEffect(() => {
    debugLog.debug('Home', 'Current room changed', {
      new_room: currentRoom,
      is_private: currentRoom.startsWith('private-'),
    });
  }, [currentRoom]);

  useEffect(() => {
    debugLog.debug('Home', 'Rooms updated', {
      room_count: rooms.length,
      room_ids: rooms.map(r => r.id),
    });
  }, [rooms]);

  useEffect(() => {
    debugLog.debug('Home', 'Messages updated', {
      total_rooms_with_messages: Object.keys(messages).length,
      current_room_message_count: messages[currentRoom]?.length || 0,
    });
  }, [messages, currentRoom]);

  useEffect(() => {
    debugLog.debug('Home', 'Room users updated', {
      rooms_with_users: Object.keys(roomUsers).length,
      current_room_user_count: roomUsers[currentRoom]?.length || 0,
    });
  }, [roomUsers, currentRoom]);

  const fetchMessages = useCallback(async (roomId: number) => {
    const endTimer = debugLog.startTimer('Home', 'fetchMessages');
    debugLog.info('Home', 'Fetching messages for room', {
      room_id: roomId,
      room_name: currentRoom,
    });

    try {
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/messages?room_id=${roomId}&username=${encodeURIComponent(username)}`);
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('Home', 'GET', `${API_BASE_URL}/messages?room_id=${roomId}`, response.status, duration);

      const data = await response.json();
      if (data.success) {
        const apiMessages: Message[] = (data.data || []).map((msg: {
          id: number;
          content: string;
          type: string;
          message_type?: string;
          created_at: string;
          user_id?: number;
          user?: { username: string; display_name?: string };
          file_url?: string;
          file_name?: string;
          file_size?: number;
        }) => ({
          id: msg.id.toString(),
          type: msg.type || msg.message_type || 'text',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          status: 'read' as const,
          userId: msg.user_id?.toString(),
          username: msg.user?.username || msg.user?.display_name || 'Unknown',
          fileURL: msg.file_url,
          fileName: msg.file_name,
          fileSize: msg.file_size,
        }));

        debugLog.info('Home', 'Messages fetched successfully', {
          message_count: apiMessages.length,
          room_id: roomId,
        });

        setMessages(prev => ({
          ...prev,
          [currentRoom]: apiMessages
        }));
      } else {
        debugLog.error('Home', 'Failed to fetch messages - API returned error', undefined, {
          room_id: roomId,
          error: data.error,
        });
      }
    } catch (error) {
      debugLog.error('Home', 'Failed to fetch messages - network error', error as Error, {
        room_id: roomId,
      });
      console.error('Failed to fetch messages:', error);
    } finally {
      endTimer();
    }
  }, [currentRoom, username]);

  const changeRoom = useCallback((roomId: string) => {
    debugLog.info('Home', 'Changing room', {
      from_room: currentRoom,
      to_room: roomId,
      is_private: roomId.startsWith('private-'),
    });

    setCurrentRoom(roomId);

    // Fetch messages for the new room
    const roomIdNum = roomIdMap[roomId];
    if (roomIdNum) {
      debugLog.debug('Home', 'Fetching messages for new room', { room_id_num: roomIdNum });
      fetchMessages(roomIdNum);
    } else {
      debugLog.warn('Home', 'No room ID mapping found for room', { room_id: roomId });
    }

    // Notify WebSocket about room change
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      debugLog.info('Home', 'Notifying WebSocket about room change', {
        room: roomId,
        user: username,
      });

      // Leave current room and join new room
      const roomChangeMessage = {
        type: 'join',
        room: roomId,
        user: username
      };

      wsRef.current.send(JSON.stringify(roomChangeMessage));
    } else {
      debugLog.warn('Home', 'Cannot notify WebSocket - connection not ready', {
        ws_ready_state: wsRef.current?.readyState,
      });
    }
  }, [fetchMessages, roomIdMap, currentRoom, username]);

  const fetchRooms = useCallback(async () => {
    const endTimer = debugLog.startTimer('Home', 'fetchRooms');
    debugLog.info('Home', 'Fetching rooms from API');

    try {
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/rooms?username=${encodeURIComponent(username)}`);
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('Home', 'GET', `${API_BASE_URL}/rooms`, response.status, duration);

      const data = await response.json();
      if (data.success) {
        const apiRooms = data.data.map((room: ApiRoom) => ({
          id: room.name,
          name: room.name.charAt(0).toUpperCase() + room.name.slice(1)
        }));

        const idMap: Record<string, number> = {};
        data.data.forEach((room: ApiRoom) => {
          idMap[room.name] = room.id;
        });

        debugLog.info('Home', 'Rooms fetched successfully', {
          room_count: apiRooms.length,
          room_names: apiRooms.map((r: Room) => r.name),
        });

        setRooms(apiRooms);
        setRoomIdMap(idMap);
      } else {
        debugLog.error('Home', 'Failed to fetch rooms - API returned error', undefined, {
          error: data.error,
        });
      }
    } catch (error) {
      debugLog.error('Home', 'Failed to fetch rooms - network error', error as Error);
      console.error('Failed to fetch rooms:', error);
    } finally {
      endTimer();
    }
  }, [username]);

  const fetchUsers = useCallback(async () => {
    const endTimer = debugLog.startTimer('Home', 'fetchUsers');
    debugLog.info('Home', 'Fetching users from API');

    try {
      // Fetch users for each room
      const apiUsers: Record<string, User[]> = {};

      for (const room of rooms) {
        const roomIdNum = roomIdMap[room.id];
        if (roomIdNum) {
          const startTime = performance.now();
          const response = await fetch(`${API_BASE_URL}/rooms/${roomIdNum}/users?username=${encodeURIComponent(username)}`);
          const duration = performance.now() - startTime;

          debugLog.logApiResponse('Home', 'GET', `${API_BASE_URL}/rooms/${roomIdNum}/users`, response.status, duration);

          const data = await response.json();
          if (data.success) {
            // Convert API users to the expected format
            const roomUsers: User[] = data.data.map((user: {
              id: number;
              username: string;
              status?: string;
              avatar_url?: string;
            }) => ({
              id: user.id.toString(),
              username: user.username,
              status: user.status || 'offline',
              avatar: user.avatar_url,
            }));

            apiUsers[room.id] = roomUsers;

            debugLog.debug('Home', `Fetched users for room ${room.name}`, {
              room_name: room.name,
              user_count: roomUsers.length,
              users: roomUsers.map(u => u.username),
            });
          } else {
            debugLog.error('Home', `Failed to fetch users for room ${room.name}`, undefined, {
              room_name: room.name,
              error: data.error,
            });
          }
        }
      }

      debugLog.info('Home', 'Users fetched successfully for all rooms', {
        total_rooms_with_users: Object.keys(apiUsers).length,
        total_users: Object.values(apiUsers).reduce((sum, users) => sum + users.length, 0),
      });

      setRoomUsers(apiUsers);
    } catch (error) {
      debugLog.error('Home', 'Failed to fetch users - network error', error as Error);
      console.error('Failed to fetch users:', error);
    } finally {
      endTimer();
    }
  }, [rooms, roomIdMap, username]);

  const availableIcons = [
    { name: 'User', component: User },
    { name: 'Smile', component: Smile },
    { name: 'Heart', component: Heart },
    { name: 'Star', component: Star },
    { name: 'Circle', component: Circle },
    { name: 'Square', component: Square },
    { name: 'Triangle', component: Triangle },
  ];

  const renderIcon = (iconName: string, size: number = 24, className: string = 'text-gray-500') => {
    const icon = availableIcons.find(i => i.name === iconName);
    if (icon) {
      const IconComponent = icon.component;
      return <IconComponent size={size} className={className} />;
    }
    return <User size={size} className={className} />;
  };

  const handleInvite = () => {
    if (inviteInput.trim()) {
      debugLog.info('Home', 'Inviting user', {
        invite_input: inviteInput.trim(),
        current_room: currentRoom,
      });

      const newUser: User = {
        id: crypto.randomUUID(),
        username: inviteInput,
        status: 'online'
      };
      setRoomUsers(prev => ({
        ...prev,
        [currentRoom]: [...(prev[currentRoom] || []), newUser],
      }));
      setInviteInput('');
    } else {
      debugLog.warn('Home', 'Invite attempted with empty input');
    }
  };

  const handleLogout = () => {
    debugLog.info('Home', 'User logout initiated', { username });
    alert('Logged out');
    // Implement logout logic here
  };

  const loadChatHistory = () => {
    debugLog.info('Home', 'Loading chat history', { current_room: currentRoom });

    const mockHistory: Message[] = [
      { id: 'old1', type: 'text', content: 'Welcome to the chat!', timestamp: new Date(Date.now() - 86400000), status: 'read' },
      { id: 'old2', type: 'text', content: 'This is an archived message.', timestamp: new Date(Date.now() - 86400000 * 2), status: 'read' },
    ];
    setMessages(prev => ({
      ...prev,
      [currentRoom]: [...mockHistory, ...(prev[currentRoom] || [])],
    }));

    debugLog.info('Home', 'Chat history loaded', {
      history_message_count: mockHistory.length,
      current_room: currentRoom,
    });
  };

  const addMessage = useCallback((type: MessageType, content: string | File | Blob | { name: string; value: number }[] | { question: string; options: string[]; votes: number[] }) => {
    debugLog.info('Home', 'Adding new message', {
      message_type: type,
      content_type: typeof content,
      current_room: currentRoom,
      username,
    });

    const newMessage: Message = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date(),
      status: 'sending',
    };

    // For uploaded files, set fileURL field for proper rendering
    if (type === 'image' || type === 'voice' || type === 'attachment') {
      if (typeof content === 'string') {
        newMessage.fileURL = content;
        newMessage.fileName = content.split('/').pop() || 'file';
      } else if (content instanceof File) {
        newMessage.fileName = content.name;
        newMessage.fileSize = content.size;
      }
    }

    setMessages(prev => ({
      ...prev,
      [currentRoom]: [...(prev[currentRoom] || []), newMessage],
    }));

    // Send message via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const wsMessage = {
        type: 'message',
        room: currentRoom,
        user: username,
        messageType: type,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        timestamp: newMessage.timestamp.toISOString()
      };

      debugLog.info('Home', 'Sending message via WebSocket', {
        message_id: newMessage.id,
        ws_message_type: wsMessage.type,
        content_length: wsMessage.content.length,
      });

      wsRef.current.send(JSON.stringify(wsMessage));
    } else {
      debugLog.warn('Home', 'Cannot send message via WebSocket - connection not ready', {
        ws_ready_state: wsRef.current?.readyState,
        message_id: newMessage.id,
      });
    }

    // Simulate status change
    setTimeout(() => {
      debugLog.debug('Home', 'Message status changed to sent', { message_id: newMessage.id });
      setMessages(prev => ({
        ...prev,
        [currentRoom]: prev[currentRoom]?.map(msg => msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg) || [],
      }));
    }, 1000);

    setTimeout(() => {
      debugLog.debug('Home', 'Message status changed to read', { message_id: newMessage.id });
      setMessages(prev => ({
        ...prev,
        [currentRoom]: prev[currentRoom]?.map(msg => msg.id === newMessage.id ? { ...msg, status: 'read' as const } : msg) || [],
      }));
    }, 2000);
  }, [currentRoom, username]);

  const toggleMaximize = () => {
    const newMaximizedState = !isModalMaximized;
    debugLog.info('Home', 'Modal maximize toggled', {
      new_state: newMaximizedState,
      previous_state: isModalMaximized,
    });
    setIsModalMaximized(newMaximizedState);
  };

  const closeModal = () => {
    debugLog.info('Home', 'Modal close requested');
    // Send message to parent to close modal
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'CLOSE_MODAL' }, '*');
    }
  };

  const handleVote = useCallback((messageId: string, optionIndex: number) => {
    debugLog.info('Home', 'Vote cast', {
      message_id: messageId,
      option_index: optionIndex,
      current_room: currentRoom,
      username,
    });

    // Send vote via WebSocket first
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const voteMessage = {
        type: 'vote',
        room: currentRoom,
        user: username,
        messageId: messageId,
        optionIndex: optionIndex,
        timestamp: new Date().toISOString()
      };

      debugLog.info('Home', 'Sending vote via WebSocket', {
        message_id: messageId,
        option_index: optionIndex,
        room: currentRoom,
        username,
      });

      wsRef.current.send(JSON.stringify(voteMessage));
    } else {
      debugLog.warn('Home', 'Cannot send vote via WebSocket - connection not ready', {
        ws_ready_state: wsRef.current?.readyState,
        message_id: messageId,
      });
    }

    // Update local state optimistically
    setMessages(prev => ({
      ...prev,
      [currentRoom]: prev[currentRoom]?.map(msg => {
        if (msg.id === messageId && msg.type === 'voting') {
          const poll = typeof msg.content === 'string' 
            ? JSON.parse(msg.content) 
            : msg.content as { question: string; options: string[]; votes: number[]; voters: string[] };
          
          // Check if user has already voted
          if (poll.voters && poll.voters.includes(username)) {
            debugLog.warn('Home', 'User has already voted in this poll', {
              message_id: messageId,
              username,
              existing_voters: poll.voters,
            });
            return msg; // Don't update if user already voted
          }
          
          // Add user to voters list and increment vote count
          const updatedVoters = [...(poll.voters || []), username];
          const updatedVotes = [...poll.votes];
          updatedVotes[optionIndex] = (updatedVotes[optionIndex] || 0) + 1;
          
          const updatedPoll = {
            ...poll,
            votes: updatedVotes,
            voters: updatedVoters,
          };

          debugLog.info('Home', 'Vote recorded locally', {
            message_id: messageId,
            option_index: optionIndex,
            new_vote_count: updatedVotes[optionIndex],
            total_voters: updatedVoters.length,
          });

          return {
            ...msg,
            content: typeof msg.content === 'string' ? JSON.stringify(updatedPoll) : updatedPoll
          };
        }
        return msg;
      }) || []
    }));
  }, [currentRoom, username]);

  const addRoom = () => {
    const roomName = prompt('Enter room name:');
    if (roomName) {
      debugLog.info('Home', 'Adding new room', { room_name: roomName });
      const newRoom: Room = { id: Date.now().toString(), name: roomName };
      setRooms(prev => [...prev, newRoom]);
    } else {
      debugLog.debug('Home', 'Room creation cancelled - no name provided');
    }
  };

  // Wrapper functions for ChatInput component
  const handleChatInputSendMessage = (message: string, type: string, content?: { options?: string[]; data?: { name: string; value: number }[] }) => {
    debugLog.info('Home', 'Chat input message sent', {
      message_length: message.length,
      type,
      has_content: !!content,
      current_room: currentRoom,
    });

    if (type === 'text') {
      addMessage('text', message);
    } else if (type === 'emoticon') {
      addMessage('emoticon', message);
    } else if (type === 'gif_emoticon') {
      addMessage('gif_emoticon', message);
    } else if (type === 'voting' && content?.options) {
      const poll = {
        question: message,
        options: content.options,
        votes: content.options.map(() => 0),
        voters: [], // Track who has voted
      };
      addMessage('voting', poll);
    } else if (type === 'graph' && content?.data) {
      addMessage('graph', content.data);
    }
  };

  const handleChatInputSendVoice = async (audioBlob: Blob) => {
    debugLog.info('Home', 'Voice message upload initiated', {
      blob_size: audioBlob.size,
      blob_type: audioBlob.type,
    });

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.wav');

      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/upload?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        body: formData,
      });
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('Home', 'POST', `${API_BASE_URL}/upload?username=${encodeURIComponent(username)}`, response.status, duration);

      const data = await response.json();
      if (data.success) {
        debugLog.info('Home', 'Voice message uploaded successfully', { file_url: data.data.url });
        addMessage('voice', data.data.url);
      } else {
        debugLog.error('Home', 'Voice upload failed - API error', undefined, { error: data.error });
        console.error('Voice upload failed:', data.error);
      }
    } catch (error) {
      debugLog.error('Home', 'Voice upload failed - network error', error as Error);
      console.error('Voice upload error:', error);
    }
  };

  const handleChatInputSendImage = async (file: File) => {
    debugLog.info('Home', 'Image upload initiated', {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('Home', 'POST', `${API_BASE_URL}/upload`, response.status, duration);

      const data = await response.json();
      if (data.success) {
        debugLog.info('Home', 'Image uploaded successfully', { file_url: data.data.url });
        addMessage('image', data.data.url);
      } else {
        debugLog.error('Home', 'Image upload failed - API error', undefined, { error: data.error });
        console.error('Image upload failed:', data.error);
      }
    } catch (error) {
      debugLog.error('Home', 'Image upload failed - network error', error as Error);
      console.error('Image upload error:', error);
    }
  };

  const handleChatInputSendFile = async (file: File) => {
    debugLog.info('Home', 'File upload initiated', {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('Home', 'POST', `${API_BASE_URL}/upload`, response.status, duration);

      const data = await response.json();
      if (data.success) {
        debugLog.info('Home', 'File uploaded successfully', { file_url: data.data.url });
        addMessage('attachment', data.data.url);
      } else {
        debugLog.error('Home', 'File upload failed - API error', undefined, { error: data.error });
        console.error('File upload failed:', data.error);
      }
    } catch (error) {
      debugLog.error('Home', 'File upload failed - network error', error as Error);
      console.error('File upload error:', error);
    }
  };



  // Detect if running in iframe and handle configuration
  useEffect(() => {
    // Prevent multiple initializations due to React Strict Mode
    if (hasFetchedInitialDataRef.current) {
      debugLog.debug('Home', 'Skipping duplicate initialization');
      return;
    }
    hasFetchedInitialDataRef.current = true;

    debugLog.info('Home', 'Application initialization started', {
      is_embedded: isEmbedded,
      compact_mode: compactMode,
      user_agent: navigator.userAgent,
    });

    const urlParams = new URLSearchParams(window.location.search);
    const modalMode = urlParams.get('modal') === 'true';
    const user = urlParams.get('username');

    debugLog.debug('Home', 'URL parameters parsed', {
      modal_mode: modalMode,
      user_param: user,
      all_params: Object.fromEntries(urlParams.entries()),
    });

    setIsModalMode(modalMode);

    if (user) {
      debugLog.info('Home', 'Embedded user detected', { user });
      // In a real app, you'd set the username from auth or params
      console.log('Embedded user:', user);
    }

    // Removed connectWebSocket() call from here - it will be called after rooms are loaded

    // Fetch rooms and users from API
    debugLog.info('Home', 'Fetching initial data from API');
    fetchRooms();
    // fetchUsers() will be called after rooms are loaded

    // Listen for messages from parent window
    const handleMessage = (event: MessageEvent) => {
      debugLog.info('Home', 'Message received from parent window', {
        message_type: event.data.type,
        origin: event.origin,
      });

      if (event.data.type === 'SEND_MESSAGE') {
        debugLog.info('Home', 'Processing parent message request', {
          message: event.data.message,
        });
        addMessage('text', event.data.message);
      } else if (event.data.type === 'SET_ROOM') {
        debugLog.info('Home', 'Processing parent room change request', {
          room: event.data.room,
        });
        changeRoom(event.data.room);
      } else {
        debugLog.debug('Home', 'Unknown parent message type', {
          message_type: event.data.type,
        });
      }
    };

    window.addEventListener('message', handleMessage);

    // Handle window resize for mobile sidebar auto-hide
    const handleResize = () => {
      const isMobileNow = window.innerWidth < 768;
      debugLog.debug('Home', 'Window resize detected', {
        new_width: window.innerWidth,
        is_mobile: isMobileNow,
      });
      setSidebarCollapsed(isMobileNow);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      debugLog.info('Home', 'Cleaning up event listeners');
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('resize', handleResize);
      // Don't close WebSocket here - let it be managed by the connection logic
      // This prevents React Strict Mode from closing connections prematurely
    };
  }, [addMessage, currentRoom, changeRoom, fetchRooms, fetchUsers, fetchMessages, roomIdMap, isEmbedded, compactMode, messages, reconnectAttempts, username]);

  // Connect WebSocket after rooms are loaded
  useEffect(() => {
    if (Object.keys(roomIdMap).length > 0 && !hasInitiatedConnectionRef.current && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
      debugLog.info('Home', 'Rooms loaded, connecting WebSocket');
      hasInitiatedConnectionRef.current = true;
      connectWebSocket();
    }
  }, [roomIdMap, connectWebSocket]); // connectWebSocket is stable now (no reconnectAttempts dependency)

  // Fetch messages when rooms are loaded or current room changes
  useEffect(() => {
    if (Object.keys(roomIdMap).length > 0) {
      const roomIdNum = roomIdMap[currentRoom];
      if (roomIdNum) {
        debugLog.info('Home', 'Auto-fetching messages for current room', {
          room_name: currentRoom,
          room_id: roomIdNum,
        });
        fetchMessages(roomIdNum);
      } else {
        debugLog.warn('Home', 'Cannot fetch messages - no room ID mapping found', {
          room_name: currentRoom,
          available_mappings: Object.keys(roomIdMap),
        });
      }
    } else {
      debugLog.debug('Home', 'Skipping message fetch - room mappings not loaded yet');
    }
  }, [roomIdMap, currentRoom, fetchMessages]);

  // Fetch users after rooms are loaded
  useEffect(() => {
    if (rooms.length > 0 && Object.keys(roomIdMap).length > 0) {
      debugLog.info('Home', 'Rooms loaded, fetching users for all rooms');
      fetchUsers();
    }
  }, [rooms, roomIdMap, fetchUsers]);

  // Component cleanup - only runs on actual unmount
  useEffect(() => {
    return () => {
      debugLog.info('Home', 'Component unmounting, closing WebSocket connection');
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, []);

  // Separate effect for hydration
  useEffect(() => {
    debugLog.info('Home', 'Application hydrated and ready');
    setIsHydrated(true);
  }, []);

  return (
    <>
      {isHydrated && isModalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className={`rounded-lg shadow-xl overflow-hidden transition-all duration-300 ${
            isModalMaximized
              ? 'w-full h-full rounded-none'
              : 'w-11/12 h-5/6 max-w-6xl'
          }`}>
            {/* Modal Header */}
            {!hideModalHeader && (
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold">Chat</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMaximize}
                    className="p-1 hover:bg-gray-200 rounded"
                    title={isModalMaximized ? "Restore" : "Maximize"}
                  >
                    {isModalMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button
                    onClick={closeModal}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            {/* Modal Content */}
            <div className="h-full">
              <div className={`flex ${compactMode ? 'h-full' : 'h-screen'} bg-discord-bg-primary`}>
                {/* Sidebar - collapsible in embedded mode */}
                {(!compactMode || !sidebarCollapsed) && (
                  <aside className={`${compactMode ? 'w-48' : 'w-64'} bg-discord-bg-secondary shadow-md flex flex-col transition-all duration-300 border-r border-discord-border-primary`}>
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-discord-border-primary">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {renderIcon(selectedIcon, 32)}
                          <div className="flex-1">
                            <p className="font-semibold text-discord-text-primary">{username}</p>
                            <select
                              value={selectedIcon}
                              onChange={(e) => setSelectedIcon(e.target.value)}
                              className="text-sm text-discord-text-muted bg-transparent border-none outline-none cursor-pointer"
                            >
                              {availableIcons.map(icon => (
                                <option key={icon.name} value={icon.name}>
                                  {icon.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ThemeToggle />
                          {isEmbedded && (
                            <button
                              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus size={16} className={`transform ${sidebarCollapsed ? 'rotate-45' : 'rotate-0'} transition-transform`} />
                            </button>
                          )}
                        </div>
                      </div>
                      <button onClick={handleLogout} className="mt-4 w-full bg-red-500 text-white py-2 rounded flex items-center justify-center space-x-2">
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>

                    {/* Users List */}
                    <UserList
                      users={roomUsers[currentRoom.startsWith('private-') ? 'general' : currentRoom] || []}
                      currentUser={{ id: 'current', username, status: 'online' }}
                      onUserClick={(userId) => {
                        // Find the user object to get username
                        const allUsers = Object.values(roomUsers).flat();
                        const clickedUser = allUsers.find(u => u.id === userId);
                        if (clickedUser) {
                          setSelectedUserFilter(selectedUserFilter === clickedUser.username ? null : clickedUser.username);
                        }
                      }}
                      onUserBan={async (userId) => {
                        try {
                          debugLog.info('MainPage', 'Banning user', { userId });

                          const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          });

                          const data = await response.json();

                          if (data.success) {
                            debugLog.info('MainPage', 'User banned successfully', { userId });

                            // Update local user status
                            setRoomUsers(prev => {
                              const updatedUsers = { ...prev };
                              Object.keys(updatedUsers).forEach(roomKey => {
                                updatedUsers[roomKey] = updatedUsers[roomKey]?.map(user =>
                                  user.id === userId ? { ...user, status: 'banned' as const } : user
                                ) || [];
                              });
                              return updatedUsers;
                            });

                            // Notify via WebSocket if needed
                            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                              const statusMessage = {
                                type: 'user_status',
                                user_id: userId,
                                status: 'banned',
                                room: currentRoom,
                                timestamp: new Date().toISOString()
                              };
                              wsRef.current.send(JSON.stringify(statusMessage));
                            }
                          } else {
                            debugLog.error('MainPage', 'Failed to ban user', undefined, { userId, error: data.error });
                            alert('Failed to ban user: ' + (data.error || 'Unknown error'));
                          }
                        } catch (error) {
                          debugLog.error('MainPage', 'Error banning user', error as Error, { userId });
                          alert('Error banning user: ' + (error as Error).message);
                        }
                      }}
                      onUserUnban={async (userId) => {
                        try {
                          debugLog.info('MainPage', 'Unbanning user', { userId });

                          const response = await fetch(`${API_BASE_URL}/users/${userId}/unban`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          });

                          const data = await response.json();

                          if (data.success) {
                            debugLog.info('MainPage', 'User unbanned successfully', { userId });

                            // Update local user status
                            setRoomUsers(prev => {
                              const updatedUsers = { ...prev };
                              Object.keys(updatedUsers).forEach(roomKey => {
                                updatedUsers[roomKey] = updatedUsers[roomKey]?.map(user =>
                                  user.id === userId ? { ...user, status: 'offline' as const } : user
                                ) || [];
                              });
                              return updatedUsers;
                            });

                            // Notify via WebSocket if needed
                            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                              const statusMessage = {
                                type: 'user_status',
                                user_id: userId,
                                status: 'offline',
                                room: currentRoom,
                                timestamp: new Date().toISOString()
                              };
                              wsRef.current.send(JSON.stringify(statusMessage));
                            }
                          } else {
                            debugLog.error('MainPage', 'Failed to unban user', undefined, { userId, error: data.error });
                            alert('Failed to unban user: ' + (data.error || 'Unknown error'));
                          }
                        } catch (error) {
                          debugLog.error('MainPage', 'Error unbanning user', error as Error, { userId });
                          alert('Error unbanning user: ' + (error as Error).message);
                        }
                      }}
                    />

                    {/* Invite Section */}
                    <div className="p-4 border-t border-discord-border-primary">
                      <input
                        type="text"
                        placeholder="Email or Username"
                        className="w-full p-2 border border-discord-border-secondary rounded bg-black text-white placeholder-gray-400"
                        value={inviteInput}
                        onChange={(e) => setInviteInput(e.target.value)}
                      />
                      <button onClick={handleInvite} className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-all duration-200">
                        Invite User
                      </button>
                    </div>
                  </aside>
                )}

                {/* Chat Container */}
                <div className="flex-1 flex flex-col">
                  {/* Header with Rooms */}
                  <header className={`bg-discord-bg-secondary shadow-sm border-b border-discord-border-primary ${compactMode ? 'p-2' : 'p-4'}`}>
                    <div className="flex items-center space-x-4 overflow-x-auto">
                      <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 hover:bg-discord-bg-tertiary rounded-lg text-discord-text-primary shrink-0"
                        title={sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
                      >
                        <Menu size={20} />
                      </button>
                      <RoomList
                        rooms={rooms}
                        currentRoom={currentRoom}
                        onRoomClick={changeRoom}
                        onAddRoom={addRoom}
                        compactMode={compactMode}
                      />
                      {selectedUserFilter && (
                        <div className="flex items-center space-x-2 bg-discord-bg-tertiary px-3 py-1 rounded-lg border border-discord-border-secondary">
                          <span className="text-sm text-discord-text-primary">Filtering by: {selectedUserFilter}</span>
                          <button
                            onClick={() => setSelectedUserFilter(null)}
                            className="text-discord-text-accent hover:text-discord-bg-accent-hover"
                            title="Clear filter"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </header>

                  {/* Chat Area */}
                  <main className="flex-1 overflow-y-auto p-4">
                    <div className="mb-4">
                      <button onClick={loadChatHistory} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Load Chat History
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(messages[currentRoom] || [])
                        .filter(message => !selectedUserFilter || message.username === selectedUserFilter)
                        .map(message => {
                          const isOwnMessage = message.username === username || !message.username;
                          return (
                            <div key={message.id} className={`flex items-start space-x-2 min-w-0 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              {renderIcon(selectedIcon, 24, 'text-discord-text-muted mt-1 flex-shrink-0')}
                              <div className="bg-green-200 bg-opacity-50 p-3 rounded-lg shadow-sm border border-discord-border-secondary text-white max-w-[90%] min-w-0 overflow-x-auto">
                                <ChatMessage message={message} selectedIcon={selectedIcon} renderIcon={renderIcon} onVote={handleVote} currentUsername={username} />
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-black">{message.timestamp.toLocaleString()}</p>
                                  <span className="text-xs text-black">
                                    {message.status === 'sending' && 'Sending...'}
                                    {message.status === 'sent' && '✓'}
                                    {message.status === 'read' && '✓✓'}
                                    {message.status === 'unread' && '○'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {isTyping && (
                        <div className="flex items-start space-x-2">
                          {renderIcon(selectedIcon, 24, 'text-discord-text-muted mt-1')}
                          <div className="bg-discord-bg-tertiary p-3 rounded-lg">
                            <p className="text-sm text-black italic">Someone is typing...</p>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </main>

                  {/* Input Area */}
                  <ChatInput
                    onSendMessage={handleChatInputSendMessage}
                    onSendVoice={handleChatInputSendVoice}
                    onSendImage={handleChatInputSendImage}
                    onSendFile={handleChatInputSendFile}
                    placeholder="Type a message..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex ${compactMode ? 'h-full' : 'h-screen'} bg-discord-bg-primary`}>
          {/* Sidebar - collapsible in embedded mode */}
          {(!compactMode || !sidebarCollapsed) && (
            <aside className={`${compactMode ? 'w-48' : 'w-64'} bg-discord-bg-secondary shadow-md flex flex-col transition-all duration-300 border-r border-discord-border-primary`}>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-discord-border-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {renderIcon(selectedIcon, 32)}
                    <div className="flex-1">
                      <p className="font-semibold text-discord-text-primary">{username}</p>
                      <select
                        value={selectedIcon}
                        onChange={(e) => setSelectedIcon(e.target.value)}
                        className="text-sm text-discord-text-muted bg-transparent border-none outline-none cursor-pointer"
                      >
                        {availableIcons.map(icon => (
                          <option key={icon.name} value={icon.name}>
                            {icon.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    {isEmbedded && (
                      <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus size={16} className={`transform ${sidebarCollapsed ? 'rotate-45' : 'rotate-0'} transition-transform`} />
                      </button>
                    )}
                  </div>
                </div>
                <button onClick={handleLogout} className="mt-4 w-full bg-red-500 text-white py-2 rounded flex items-center justify-center space-x-2">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>

              {/* Users List */}
              <UserList
                users={roomUsers[currentRoom.startsWith('private-') ? 'general' : currentRoom] || []}
                currentUser={{ id: 'current', username, status: 'online' }}
                onUserClick={(userId) => {
                  // Find the user object to get username
                  const allUsers = Object.values(roomUsers).flat();
                  const clickedUser = allUsers.find(u => u.id === userId);
                  if (clickedUser) {
                    setSelectedUserFilter(selectedUserFilter === clickedUser.username ? null : clickedUser.username);
                  }
                }}
                onUserBan={async (userId) => {
                  try {
                    debugLog.info('MainPage', 'Banning user', { userId });

                    const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });

                    const data = await response.json();

                    if (data.success) {
                      debugLog.info('MainPage', 'User banned successfully', { userId });

                      // Update local user status
                      setRoomUsers(prev => {
                        const updatedUsers = { ...prev };
                        Object.keys(updatedUsers).forEach(roomKey => {
                          updatedUsers[roomKey] = updatedUsers[roomKey]?.map(user =>
                            user.id === userId ? { ...user, status: 'banned' as const } : user
                          ) || [];
                        });
                        return updatedUsers;
                      });

                      // Notify via WebSocket if needed
                      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        const statusMessage = {
                          type: 'user_status',
                          user_id: userId,
                          status: 'banned',
                          room: currentRoom,
                          timestamp: new Date().toISOString()
                        };
                        wsRef.current.send(JSON.stringify(statusMessage));
                      }
                    } else {
                      debugLog.error('MainPage', 'Failed to ban user', undefined, { userId, error: data.error });
                      alert('Failed to ban user: ' + (data.error || 'Unknown error'));
                    }
                  } catch (error) {
                    debugLog.error('MainPage', 'Error banning user', error as Error, { userId });
                    alert('Error banning user: ' + (error as Error).message);
                  }
                }}
                onUserUnban={async (userId) => {
                  try {
                    debugLog.info('MainPage', 'Unbanning user', { userId });

                    const response = await fetch(`${API_BASE_URL}/users/${userId}/unban`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });

                    const data = await response.json();

                    if (data.success) {
                      debugLog.info('MainPage', 'User unbanned successfully', { userId });

                      // Update local user status
                      setRoomUsers(prev => {
                        const updatedUsers = { ...prev };
                        Object.keys(updatedUsers).forEach(roomKey => {
                          updatedUsers[roomKey] = updatedUsers[roomKey]?.map(user =>
                            user.id === userId ? { ...user, status: 'offline' as const } : user
                          ) || [];
                        });
                        return updatedUsers;
                      });

                      // Notify via WebSocket if needed
                      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        const statusMessage = {
                          type: 'user_status',
                          user_id: userId,
                          status: 'offline',
                          room: currentRoom,
                          timestamp: new Date().toISOString()
                        };
                        wsRef.current.send(JSON.stringify(statusMessage));
                      }
                    } else {
                      debugLog.error('MainPage', 'Failed to unban user', undefined, { userId, error: data.error });
                      alert('Failed to unban user: ' + (data.error || 'Unknown error'));
                    }
                  } catch (error) {
                    debugLog.error('MainPage', 'Error unbanning user', error as Error, { userId });
                    alert('Error unbanning user: ' + (error as Error).message);
                  }
                }}
              />

              {/* Invite Section */}
              <div className="p-4 border-t border-discord-border-primary">
                <input
                  type="text"
                  placeholder="Email or Username"
                  className="w-full p-2 border border-discord-border-secondary rounded bg-black text-white placeholder-gray-400"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                />
                <button onClick={handleInvite} className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-all duration-200">
                  Invite User
                </button>
              </div>
            </aside>
          )}

          {/* Chat Container */}
          <div className="flex-1 flex flex-col">
                  {/* Header with Rooms */}
                  <header className={`bg-discord-bg-secondary shadow-sm border-b border-discord-border-primary ${compactMode ? 'p-2' : 'p-4'}`}>
                    <div className="flex items-center space-x-4 overflow-x-auto">
                      <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 hover:bg-discord-bg-tertiary rounded-lg text-discord-text-primary shrink-0"
                        title={sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
                      >
                        <Menu size={20} />
                      </button>
                      <RoomList
                        rooms={rooms}
                        currentRoom={currentRoom}
                        onRoomClick={changeRoom}
                        onAddRoom={addRoom}
                        compactMode={compactMode}
                      />
                      {selectedUserFilter && (
                        <div className="flex items-center space-x-2 bg-discord-bg-tertiary px-3 py-1 rounded-lg border border-discord-border-secondary">
                          <span className="text-sm text-discord-text-primary">Filtering by: {selectedUserFilter}</span>
                          <button
                            onClick={() => setSelectedUserFilter(null)}
                            className="text-discord-text-accent hover:text-discord-bg-accent-hover"
                            title="Clear filter"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </header>            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <button onClick={loadChatHistory} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Load Chat History
                </button>
              </div>
              <div className="space-y-2">
                {(messages[currentRoom] || [])
                  .filter(message => !selectedUserFilter || message.username === selectedUserFilter)
                  .map(message => {
                    const isOwnMessage = message.username === username || !message.username;
                    return (
                      <div key={message.id} className={`flex items-start space-x-2 min-w-0 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {renderIcon(selectedIcon, 24, 'text-discord-text-muted mt-1 flex-shrink-0')}
                        <div className="bg-green-200 bg-opacity-50 p-3 rounded-lg shadow-sm border border-discord-border-secondary text-white flex-1 min-w-0 overflow-x-auto">
                          <ChatMessage message={message} selectedIcon={selectedIcon} renderIcon={renderIcon} onVote={handleVote} currentUsername={username} />
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-black">{message.timestamp.toLocaleString()}</p>
                            <span className="text-xs text-black">
                              {message.status === 'sending' && 'Sending...'}
                              {message.status === 'sent' && '✓'}
                              {message.status === 'read' && '✓✓'}
                              {message.status === 'unread' && '○'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {isTyping && (
                  <div className="flex items-start space-x-2">
                    {renderIcon(selectedIcon, 24, 'text-discord-text-muted mt-1')}
                    <div className="bg-discord-bg-tertiary p-3 rounded-lg">
                      <p className="text-sm text-black italic">Someone is typing...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </main>

            {/* Input Area */}
            <ChatInput
              onSendMessage={handleChatInputSendMessage}
              onSendVoice={handleChatInputSendVoice}
              onSendImage={handleChatInputSendImage}
              onSendFile={handleChatInputSendFile}
              placeholder="Type a message..."
            />
          </div>
        </div>
      )}
    </>
  );
}
