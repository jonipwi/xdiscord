import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { debugLog } from '../utils/debugLogger';

export type MessageType = 'text' | 'image' | 'voice' | 'graph' | 'voting' | 'attachment' | 'emoticon' | 'gif_emoticon';

export interface Message {
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

interface ChatMessageProps {
  message: Message;
  selectedIcon: string;
  renderIcon: (iconName: string, size?: number, className?: string) => React.ReactNode;
  onVote?: (messageId: string, optionIndex: number) => void;
  currentUsername?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, selectedIcon, renderIcon, onVote, currentUsername }) => {
  useEffect(() => {
    debugLog.debug('ChatMessage', 'Component mounted', {
      message_id: message.id,
      message_type: message.type,
      message_status: message.status,
      timestamp: message.timestamp.toISOString(),
    });

    return () => {
      debugLog.debug('ChatMessage', 'Component unmounting', {
        message_id: message.id,
      });
    };
  }, [message.id, message.type, message.status, message.timestamp]);

  useEffect(() => {
    debugLog.debug('ChatMessage', 'Message status changed', {
      message_id: message.id,
      status: message.status,
    });
  }, [message.id, message.status]);

  const renderMessageContent = (message: Message) => {
    debugLog.debug('ChatMessage', 'Rendering message content', {
      message_id: message.id,
      type: message.type,
      content_type: typeof message.content,
    });

    switch (message.type) {
      case 'text':
        const textContent = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
        return <p className="text-black">{textContent}</p>;
      case 'image':
        if (message.fileURL) {
          debugLog.debug('ChatMessage', 'Rendering image message (URL)', {
            message_id: message.id,
            src: message.fileURL,
          });
          return (
            <div>
              {typeof message.content === 'string' && message.content && (
                <p className="mb-2 text-black">{message.content}</p>
              )}
              <img src={message.fileURL} alt={message.fileName || "Uploaded"} className="rounded" style={{ maxWidth: '256px', height: 'auto' }} />
            </div>
          );
        } else if (typeof message.content === 'string') {
          debugLog.debug('ChatMessage', 'Rendering image message (string URL)', {
            message_id: message.id,
            src: message.content,
          });
          return (
            <div>
              <img src={message.content} alt={message.fileName || "Uploaded"} className="rounded" style={{ maxWidth: '256px', height: 'auto' }} />
            </div>
          );
        } else if (message.content instanceof File || message.content instanceof Blob) {
          const imageSrc = URL.createObjectURL(message.content);
          debugLog.debug('ChatMessage', 'Rendering image message (File/Blob)', {
            message_id: message.id,
            file_name: message.content instanceof File ? message.content.name : 'blob',
            object_url: imageSrc,
          });
          return (
            <div>
              <img src={imageSrc} alt={message.fileName || "Uploaded"} className="rounded" style={{ maxWidth: '256px', height: 'auto' }} />
            </div>
          );
        } else {
          debugLog.warn('ChatMessage', 'Cannot render image - invalid content type', {
            message_id: message.id,
            content_type: typeof message.content,
          });
          return <p className="text-gray-500">Image unavailable</p>;
        }
      case 'voice':
        if (message.fileURL) {
          debugLog.debug('ChatMessage', 'Rendering voice message (URL)', {
            message_id: message.id,
            src: message.fileURL,
          });
          return <audio controls src={message.fileURL} className="max-w-xs" />;
        } else if (typeof message.content === 'string') {
          debugLog.debug('ChatMessage', 'Rendering voice message (string URL)', {
            message_id: message.id,
            src: message.content,
          });
          return <audio controls src={message.content} className="max-w-xs" />;
        } else if (message.content instanceof Blob) {
          const voiceSrc = URL.createObjectURL(message.content);
          debugLog.debug('ChatMessage', 'Rendering voice message (Blob)', {
            message_id: message.id,
            blob_size: message.content.size,
            object_url: voiceSrc,
          });
          return <audio controls src={voiceSrc} className="max-w-xs" />;
        } else {
          debugLog.warn('ChatMessage', 'Cannot render voice message - invalid content type', {
            message_id: message.id,
            content_type: typeof message.content,
          });
          return <p className="text-gray-500">Voice message unavailable</p>;
        }
      case 'emoticon':
        debugLog.debug('ChatMessage', 'Rendering emoticon message', {
          message_id: message.id,
          emoticon_content: message.content as string,
        });
        return <span className="text-2xl">{typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}</span>;
      case 'gif_emoticon':
        if (typeof message.content === 'string') {
          debugLog.debug('ChatMessage', 'Rendering GIF emoticon message', {
            message_id: message.id,
            gif_src: message.content,
          });
          return (
            <img
              src={message.content}
              alt="GIF Emoticon"
              className="rounded"
              style={{ width: '128px', height: '128px', objectFit: 'cover' }}
              onError={(e) => {
                // Fallback to text if GIF fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallbackText = document.createElement('span');
                  fallbackText.textContent = 'GIF';
                  fallbackText.className = 'text-gray-500 text-sm';
                  parent.appendChild(fallbackText);
                }
              }}
            />
          );
        } else {
          debugLog.warn('ChatMessage', 'Cannot render GIF emoticon - invalid content type', {
            message_id: message.id,
            content_type: typeof message.content,
          });
          return <p className="text-gray-500">GIF emoticon unavailable</p>;
        }
      case 'graph':
        let graphData: { name: string; value: number }[];
        if (typeof message.content === 'string') {
          try {
            graphData = JSON.parse(message.content);
          } catch {
            graphData = [];
          }
        } else if (Array.isArray(message.content)) {
          graphData = message.content as { name: string; value: number }[];
        } else {
          graphData = [];
        }
        debugLog.debug('ChatMessage', 'Rendering graph message', {
          message_id: message.id,
          data_points: graphData.length,
        });
        return (
          <div style={{ width: '300px', maxWidth: '100%', aspectRatio: '16/9' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'voting':
        let poll: { question: string; options: string[]; votes: number[]; voters: string[] };
        if (typeof message.content === 'string') {
          try {
            poll = JSON.parse(message.content);
          } catch {
            poll = { question: 'Invalid poll', options: [], votes: [], voters: [] };
          }
        } else if (typeof message.content === 'object' && message.content !== null) {
          poll = message.content as { question: string; options: string[]; votes: number[]; voters: string[] };
        } else {
          poll = { question: 'Invalid poll', options: [], votes: [], voters: [] };
        }

        const hasUserVoted = currentUsername && poll.voters && poll.voters.includes(currentUsername);

        debugLog.debug('ChatMessage', 'Rendering voting message', {
          message_id: message.id,
          question: poll.question,
          options_count: poll.options.length,
          has_user_voted: hasUserVoted,
          current_username: currentUsername,
        });
        return (
          <div className="space-y-2">
            <p className="font-medium text-black">{poll.question}</p>
            {hasUserVoted && (
              <p className="text-sm text-green-600 font-medium">✓ You have voted</p>
            )}
            {poll.options.map((option: string, index: number) => (
              <button
                key={index}
                className={`block w-full px-3 py-2 rounded text-left transition-colors ${
                  hasUserVoted
                    ? 'bg-gray-100 text-gray-700 cursor-not-allowed opacity-75'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                onClick={() => {
                  if (!hasUserVoted) {
                    debugLog.info('ChatMessage', 'Vote button clicked', {
                      message_id: message.id,
                      option_index: index,
                      option_text: option,
                    });
                    onVote?.(message.id, index);
                  }
                }}
                disabled={!!hasUserVoted}
              >
                {option} ({poll.votes[index] || 0})
              </button>
            ))}
          </div>
        );
      case 'attachment':
        if (message.fileURL) {
          debugLog.debug('ChatMessage', 'Rendering attachment message (URL)', {
            message_id: message.id,
            attachment_url: message.fileURL,
            file_name: message.fileName,
          });
          return (
            <div>
              {typeof message.content === 'string' && message.content && (
                <p className="mb-2 text-black">{message.content}</p>
              )}
              <a
                href={message.fileURL}
                download={message.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                {message.fileName || 'Download File'}
              </a>
            </div>
          );
        } else if (typeof message.content === 'string') {
          debugLog.debug('ChatMessage', 'Rendering attachment message (URL)', {
            message_id: message.id,
            attachment_url: message.content,
          });
          return (
            <a
              href={message.content}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Download File
            </a>
          );
        } else {
          const file = message.content as File;
          debugLog.debug('ChatMessage', 'Rendering attachment message (File)', {
            message_id: message.id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          });
          return (
            <a
              href={URL.createObjectURL(file)}
              download
              className="text-blue-500 hover:text-blue-700 underline"
            >
              {file.name}
            </a>
          );
        }
      default:
        debugLog.warn('ChatMessage', 'Unknown message type encountered', {
          message_id: message.id,
          type: message.type,
        });
        return <p className="text-gray-500">Unknown message type</p>;
    }
  };

  return (
    <div>
      {message.username && (
        <div className="text-xs font-medium text-black mb-1">
          {message.username}
        </div>
      )}
      {renderMessageContent(message)}
    </div>
  );
};