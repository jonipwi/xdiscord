import { debugLog } from '../utils/debugLogger';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088'}/api`;

export interface Room {
  id: string;
  name: string;
  description?: string;
  is_private?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id?: number;
  name: string;
  created_at?: string;
}

export interface Message {
  id: string;
  type: string;
  content: string;
  user_id?: number;
  room: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Rooms API
export const roomsApi = {
  async getRooms(): Promise<Room[]> {
    const endTimer = debugLog.startTimer('api.rooms', 'getRooms');
    debugLog.logApiCall('api.rooms', 'GET', `${API_BASE_URL}/rooms`);

    try {
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/rooms`);
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('api.rooms', 'GET', `${API_BASE_URL}/rooms`, response.status, duration);

      const data: ApiResponse<Room[]> = await response.json();

      if (data.success) {
        debugLog.debug('api.rooms', 'Successfully fetched rooms', {
          count: data.data.length,
          duration_ms: Math.round(duration),
        });
        endTimer();
        return data.data;
      }

      debugLog.error('api.rooms', 'Failed to fetch rooms', new Error(data.error), {
        status: response.status,
        duration_ms: Math.round(duration),
      });
      throw new Error(data.error || 'Failed to fetch rooms');
    } catch (error) {
      debugLog.error('api.rooms', 'Exception in getRooms', error as Error);
      endTimer();
      throw error;
    }
  },

  async createRoom(room: Partial<Room>): Promise<Room> {
    const endTimer = debugLog.startTimer('api.rooms', 'createRoom');
    debugLog.logApiCall('api.rooms', 'POST', `${API_BASE_URL}/rooms`, room);

    try {
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(room),
      });
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('api.rooms', 'POST', `${API_BASE_URL}/rooms`, response.status, duration);

      const data: ApiResponse<Room> = await response.json();

      if (data.success) {
        debugLog.info('api.rooms', 'Successfully created room', {
          room_id: data.data.id,
          room_name: data.data.name,
          duration_ms: Math.round(duration),
        });
        endTimer();
        return data.data;
      }

      debugLog.error('api.rooms', 'Failed to create room', new Error(data.error), {
        room_data: room,
        status: response.status,
        duration_ms: Math.round(duration),
      });
      throw new Error(data.error || 'Failed to create room');
    } catch (error) {
      debugLog.error('api.rooms', 'Exception in createRoom', error as Error, { room_data: room });
      endTimer();
      throw error;
    }
  },
};

// Users API
export const usersApi = {
  async getUsers(): Promise<User[]> {
    const endTimer = debugLog.startTimer('api.users', 'getUsers');
    debugLog.logApiCall('api.users', 'GET', `${API_BASE_URL}/users`);

    try {
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/users`);
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('api.users', 'GET', `${API_BASE_URL}/users`, response.status, duration);

      const data: ApiResponse<User[]> = await response.json();

      if (data.success) {
        debugLog.debug('api.users', 'Successfully fetched users', {
          count: data.data.length,
          duration_ms: Math.round(duration),
        });
        endTimer();
        return data.data;
      }

      debugLog.error('api.users', 'Failed to fetch users', new Error(data.error), {
        status: response.status,
        duration_ms: Math.round(duration),
      });
      throw new Error(data.error || 'Failed to fetch users');
    } catch (error) {
      debugLog.error('api.users', 'Exception in getUsers', error as Error);
      endTimer();
      throw error;
    }
  },

  async createUser(user: Partial<User>): Promise<User> {
    const endTimer = debugLog.startTimer('api.users', 'createUser');
    debugLog.logApiCall('api.users', 'POST', `${API_BASE_URL}/users`, user);

    try {
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('api.users', 'POST', `${API_BASE_URL}/users`, response.status, duration);

      const data: ApiResponse<User> = await response.json();

      if (data.success) {
        debugLog.info('api.users', 'Successfully created user', {
          user_id: data.data.id,
          user_name: data.data.name,
          duration_ms: Math.round(duration),
        });
        endTimer();
        return data.data;
      }

      debugLog.error('api.users', 'Failed to create user', new Error(data.error), {
        user_data: user,
        status: response.status,
        duration_ms: Math.round(duration),
      });
      throw new Error(data.error || 'Failed to create user');
    } catch (error) {
      debugLog.error('api.users', 'Exception in createUser', error as Error, { user_data: user });
      endTimer();
      throw error;
    }
  },
};

// Messages API
export const messagesApi = {
  async getMessages(room: string): Promise<Message[]> {
    const endTimer = debugLog.startTimer('api.messages', 'getMessages');
    const url = `${API_BASE_URL}/messages?room_id=${room}`;
    debugLog.logApiCall('api.messages', 'GET', url);

    try {
      const startTime = performance.now();
      const response = await fetch(url);
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('api.messages', 'GET', url, response.status, duration);

      const data: ApiResponse<Message[]> = await response.json();

      if (data.success) {
        debugLog.debug('api.messages', 'Successfully fetched messages', {
          room,
          count: data.data.length,
          duration_ms: Math.round(duration),
        });
        endTimer();
        return data.data;
      }

      debugLog.error('api.messages', 'Failed to fetch messages', new Error(data.error), {
        room,
        status: response.status,
        duration_ms: Math.round(duration),
      });
      throw new Error(data.error || 'Failed to fetch messages');
    } catch (error) {
      debugLog.error('api.messages', 'Exception in getMessages', error as Error, { room });
      endTimer();
      throw error;
    }
  },

  async createMessage(message: Partial<Message>): Promise<Message> {
    const endTimer = debugLog.startTimer('api.messages', 'createMessage');
    debugLog.logApiCall('api.messages', 'POST', `${API_BASE_URL}/messages`, message);

    try {
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('api.messages', 'POST', `${API_BASE_URL}/messages`, response.status, duration);

      const data: ApiResponse<Message> = await response.json();

      if (data.success) {
        debugLog.info('api.messages', 'Successfully created message', {
          message_id: data.data.id,
          room: data.data.room,
          message_type: data.data.type,
          duration_ms: Math.round(duration),
        });
        endTimer();
        return data.data;
      }

      debugLog.error('api.messages', 'Failed to create message', new Error(data.error), {
        message_data: message,
        status: response.status,
        duration_ms: Math.round(duration),
      });
      throw new Error(data.error || 'Failed to create message');
    } catch (error) {
      debugLog.error('api.messages', 'Exception in createMessage', error as Error, { message_data: message });
      endTimer();
      throw error;
    }
  },
};

// Upload API
export const uploadApi = {
  async uploadFile(file: File): Promise<{ url: string }> {
    const endTimer = debugLog.startTimer('api.upload', 'uploadFile');
    debugLog.logApiCall('api.upload', 'POST', `${API_BASE_URL}/upload`, {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    });

    try {
      const startTime = performance.now();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const duration = performance.now() - startTime;

      debugLog.logApiResponse('api.upload', 'POST', `${API_BASE_URL}/upload`, response.status, duration);

      const data: ApiResponse<{ url: string }> = await response.json();

      if (data.success) {
        debugLog.info('api.upload', 'Successfully uploaded file', {
          file_name: file.name,
          file_size: file.size,
          url: data.data.url,
          duration_ms: Math.round(duration),
        });
        endTimer();
        return data.data;
      }

      debugLog.error('api.upload', 'Failed to upload file', new Error(data.error), {
        file_name: file.name,
        file_size: file.size,
        status: response.status,
        duration_ms: Math.round(duration),
      });
      throw new Error(data.error || 'Failed to upload file');
    } catch (error) {
      debugLog.error('api.upload', 'Exception in uploadFile', error as Error, {
        file_name: file.name,
        file_size: file.size,
      });
      endTimer();
      throw error;
    }
  },
};

// WebSocket service
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageHandlers: ((data: WebSocketMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088'}/ws`) {
    debugLog.info('websocket.service', 'Initiating WebSocket connection', { url });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      debugLog.warn('websocket.service', 'WebSocket already connected, ignoring connect request');
      return;
    }

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        debugLog.info('websocket.service', 'WebSocket connection established', {
          url,
          reconnect_attempts: this.reconnectAttempts,
        });
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          debugLog.logWebSocketEvent('websocket.service', 'message_received', {
            type: data.type,
            room: data.room,
            user: data.user,
            message_size: event.data.length,
          });

          this.messageHandlers.forEach(handler => {
            try {
              handler(data);
            } catch (error) {
              debugLog.error('websocket.service', 'Error in message handler', error as Error, {
                handler_count: this.messageHandlers.length,
                message_type: data.type,
              });
            }
          });
        } catch (error) {
          debugLog.error('websocket.service', 'Failed to parse WebSocket message', error as Error, {
            raw_data: event.data.substring(0, 200), // First 200 chars for debugging
          });
        }
      };

      this.ws.onclose = (event) => {
        debugLog.warn('websocket.service', 'WebSocket connection closed', {
          code: event.code,
          reason: event.reason,
          was_clean: event.wasClean,
          url,
        });

        // Attempt to reconnect if not a clean close and under max attempts
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s

          debugLog.info('websocket.service', 'Scheduling WebSocket reconnection', {
            attempt: this.reconnectAttempts,
            max_attempts: this.maxReconnectAttempts,
            delay_ms: delay,
          });

          this.reconnectTimeout = setTimeout(() => this.connect(url), delay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          debugLog.error('websocket.service', 'Max WebSocket reconnection attempts reached', undefined, {
            max_attempts: this.maxReconnectAttempts,
          });
        }
      };

      this.ws.onerror = () => {
        debugLog.error('websocket.service', 'WebSocket error occurred', new Error('WebSocket error event'), { url });
      };

    } catch (error) {
      debugLog.error('websocket.service', 'Failed to create WebSocket connection', error as Error, { url });
    }
  }

  disconnect() {
    debugLog.info('websocket.service', 'Disconnecting WebSocket');

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting'); // Clean close
      this.ws = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
    debugLog.debug('websocket.service', 'WebSocket disconnected and cleaned up');
  }

  send(data: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const messageStr = JSON.stringify(data);
        this.ws.send(messageStr);

        debugLog.logWebSocketEvent('websocket.service', 'message_sent', {
          type: data.type,
          room: data.room,
          user: data.user,
          message_size: messageStr.length,
        });
      } catch (error) {
        debugLog.error('websocket.service', 'Failed to send WebSocket message', error as Error, {
          message_type: data.type,
          room: data.room,
        });
      }
    } else {
      debugLog.warn('websocket.service', 'Attempted to send message on closed WebSocket', {
        ready_state: this.ws?.readyState,
        message_type: data.type,
        room: data.room,
      });
    }
  }

  onMessage(handler: (data: WebSocketMessage) => void) {
    debugLog.debug('websocket.service', 'Adding message handler', {
      total_handlers: this.messageHandlers.length + 1,
    });

    this.messageHandlers.push(handler);

    return () => {
      debugLog.debug('websocket.service', 'Removing message handler', {
        remaining_handlers: this.messageHandlers.length - 1,
      });
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  joinRoom(room: string, user: string) {
    debugLog.info('websocket.service', 'Joining room', { room, user });
    this.send({ type: 'join', room, user });
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

export interface WebSocketMessage {
  type: string;
  room?: string;
  user?: string;
  messageType?: string;
  content?: string;
  timestamp?: string;
  id?: string;
  isTyping?: boolean;
}