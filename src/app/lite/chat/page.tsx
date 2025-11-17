'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatInputLite, ChatMessage } from '../../../components';
import { useLanguage } from '@/utils/LanguageContext';

// Environment-based configuration
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088'}/api`;
const WS_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088'}/ws`;

type MessageType = 'text' | 'image' | 'voice' | 'graph' | 'voting' | 'attachment' | 'emoticon' | 'gif_emoticon';

interface Message {
  id: string;
  type: MessageType;
  content: string | File | Blob | { name: string; value: number }[] | { question: string; options: string[]; votes: number[]; voters?: string[] };
  timestamp: Date;
  status: 'sending' | 'sent' | 'read' | 'unread';
  userId?: string;
  username?: string;
  isMine: boolean;
  fileURL?: string;
  fileName?: string;
  fileSize?: number;
}

function ChatRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState('Guest');

  // Get chat info from URL params
  const room = searchParams.get('room') || '';
  const roomId = searchParams.get('roomId') || '1';
  const user = searchParams.get('user') || '';
  const userId = searchParams.get('userId') || '';

  // Check for logged-in user from localStorage (wallet login) or URL
  useEffect(() => {
    const urlUsername = searchParams.get('username');
    
    if (urlUsername) {
      setUsername(urlUsername);
    } else {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData.username) {
            setUsername(userData.username);
          }
        }
      } catch (e) {
        console.warn('Failed to load user from localStorage:', e);
      }
    }
  }, [searchParams]);

  const chatName = room || user || 'Chat';
  const isGroupChat = !!room;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/messages?room_id=${roomId}&username=${encodeURIComponent(username)}`);
      const data = await response.json();

      if (data.success && data.data) {
        const formattedMessages: Message[] = data.data.map((msg: any) => ({
          id: msg.id.toString(),
          type: msg.type || msg.message_type || 'text',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          status: 'read',
          userId: msg.user_id?.toString(),
          username: msg.user?.username || msg.user?.display_name || 'Unknown',
          isMine: msg.user?.username === username,
          fileURL: msg.file_url,
          fileName: msg.file_name,
          fileSize: msg.file_size,
        }));

        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [roomId, username]);

  // Connect WebSocket
  useEffect(() => {
    if (!roomId) return;

    const wsUrl = `${WS_BASE_URL}?room_id=${roomId}&user_id=1&username=${encodeURIComponent(username)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Join room
      ws.send(JSON.stringify({
        type: 'join',
        room: room || 'general',
        user: username
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'message') {
          const newMessage: Message = {
            id: data.id || crypto.randomUUID(),
            type: data.messageType || 'text',
            content: data.content,
            timestamp: new Date(data.timestamp || Date.now()),
            status: 'read',
            username: data.user,
            isMine: data.user === username,
            fileURL: data.fileURL,
            fileName: data.fileName,
            fileSize: data.fileSize,
          };

          setMessages(prev => [...prev, newMessage]);
        } else if (data.type === 'vote') {
          // Update voting message with new vote
          setMessages(prev => prev.map(msg => {
            if (msg.id === data.messageId && msg.type === 'voting') {
              const poll = typeof msg.content === 'string' 
                ? JSON.parse(msg.content) 
                : msg.content as { question: string; options: string[]; votes: number[]; voters?: string[] };
              
              if (poll.voters && poll.voters.includes(data.user)) {
                return msg; // User already voted
              }
              
              const updatedVoters = [...(poll.voters || []), data.user];
              const updatedVotes = [...poll.votes];
              updatedVotes[data.optionIndex] = (updatedVotes[data.optionIndex] || 0) + 1;
              
              const updatedPoll = {
                ...poll,
                votes: updatedVotes,
                voters: updatedVoters,
              };

              return {
                ...msg,
                content: typeof msg.content === 'string' ? JSON.stringify(updatedPoll) : updatedPoll
              };
            }
            return msg;
          }));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Fetch initial messages
    fetchMessages();

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId, room, username, fetchMessages]);

  // Send message handler
  const handleSendMessage = useCallback((message: string, type: string, content?: { options?: string[]; data?: { name: string; value: number }[] }) => {
    if (!wsRef.current) return;

    let messageContent = message;
    let messageType = type;

    if (type === 'voting' && content?.options) {
      const poll = {
        question: message,
        options: content.options,
        votes: content.options.map(() => 0),
        voters: [],
      };
      messageContent = JSON.stringify(poll);
      messageType = 'voting';
    } else if (type === 'graph' && content?.data) {
      messageContent = JSON.stringify(content.data);
      messageType = 'graph';
    }

    const wsMessage = {
      type: 'message',
      room: room || 'general',
      user: username,
      messageType,
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    wsRef.current.send(JSON.stringify(wsMessage));

    // Add to local state
    const newMessage: Message = {
      id: crypto.randomUUID(),
      type: messageType as MessageType,
      content: type === 'voting' || type === 'graph' ? (type === 'voting' ? JSON.parse(messageContent) : content!.data!) : message,
      timestamp: new Date(),
      status: 'sending',
      username,
      isMine: true,
    };

    setMessages(prev => [...prev, newMessage]);
  }, [room, username]);

  // Send voice handler
  const handleSendVoice = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.wav');

      const response = await fetch(`${API_BASE_URL}/upload?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        handleSendMessage(data.data.url, 'voice');
      }
    } catch (error) {
      console.error('Voice upload error:', error);
    }
  }, [username, handleSendMessage]);

  // Send image handler
  const handleSendImage = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        handleSendMessage(data.data.url, 'image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
    }
  }, [handleSendMessage]);

  // Send file handler
  const handleSendFile = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        handleSendMessage(data.data.url, 'attachment');
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  }, [handleSendMessage]);

  // Handle vote
  const handleVote = useCallback((messageId: string, optionIndex: number) => {
    if (!wsRef.current) return;

    const voteMessage = {
      type: 'vote',
      room: room || 'general',
      user: username,
      messageId,
      optionIndex,
      timestamp: new Date().toISOString()
    };

    wsRef.current.send(JSON.stringify(voteMessage));

    // Update local state optimistically
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.type === 'voting') {
        const poll = typeof msg.content === 'string' 
          ? JSON.parse(msg.content) 
          : msg.content as { question: string; options: string[]; votes: number[]; voters?: string[] };
        
        if (poll.voters && poll.voters.includes(username)) {
          return msg; // Already voted
        }
        
        const updatedVoters = [...(poll.voters || []), username];
        const updatedVotes = [...poll.votes];
        updatedVotes[optionIndex] = (updatedVotes[optionIndex] || 0) + 1;
        
        const updatedPoll = {
          ...poll,
          votes: updatedVotes,
          voters: updatedVoters,
        };

        return {
          ...msg,
          content: typeof msg.content === 'string' ? JSON.stringify(updatedPoll) : updatedPoll
        };
      }
      return msg;
    }));
  }, [room, username]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Chat header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/lite?username=${encodeURIComponent(username)}`)}
              className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={28} className="text-gray-700" />
            </button>
            
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                isGroupChat 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                  : 'bg-gradient-to-br from-blue-500 to-cyan-500'
              }`}>
                {chatName.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {chatName.charAt(0).toUpperCase() + chatName.slice(1)}
                </h1>
                <p className="text-base text-gray-500">
                  {isGroupChat ? t.members : t.online}
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => router.push(`/lite/settings?username=${encodeURIComponent(username)}`)}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            title="Settings"
          >
            <Settings size={28} className="text-gray-700" />
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-400">No messages yet</p>
            <p className="text-lg text-gray-400 mt-2">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`${msg.type === 'graph' ? 'w-full max-w-3xl' : 'max-w-[85%]'} ${msg.isMine ? 'items-end' : 'items-start'}`}>
                {!msg.isMine && (
                  <p className="text-base font-semibold mb-1 text-gray-600 px-2">
                    {msg.username}
                  </p>
                )}
                
                <div
                  className={`rounded-2xl p-4 ${
                    msg.type === 'graph'
                      ? 'bg-white border-2 border-gray-200 shadow-lg w-full'
                      : msg.isMine
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <ChatMessage 
                    message={msg} 
                    selectedIcon="User"
                    renderIcon={() => null}
                    onVote={handleVote}
                    currentUsername={username}
                  />
                </div>

                <p className={`text-sm mt-1 px-2 ${msg.isMine ? 'text-right text-gray-500' : 'text-left text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.isMine && msg.status && (
                    <span className="ml-2">
                      {msg.status === 'sending' && '⏳'}
                      {msg.status === 'sent' && '✓'}
                      {msg.status === 'read' && '✓✓'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t sticky bottom-0">
        <ChatInputLite
          onSendMessage={handleSendMessage}
          onSendVoice={handleSendVoice}
          onSendImage={handleSendImage}
          onSendFile={handleSendFile}
          placeholder="Type a message..."
        />
      </div>
    </div>
  );
}

export default function LiteChatRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-2xl text-gray-400">Loading chat...</p>
      </div>
    }>
      <ChatRoomContent />
    </Suspense>
  );
}
