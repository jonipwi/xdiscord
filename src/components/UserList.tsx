import React, { useEffect } from 'react';
import { Ban, User } from 'lucide-react';
import { debugLog } from '../utils/debugLogger';

interface User {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'banned';
  avatar?: string;
}

interface UserListProps {
  users: User[];
  currentUser: User | null;
  onUserClick: (userId: string) => void;
  onUserBan?: (userId: string) => void;
  onUserUnban?: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  currentUser,
  onUserClick,
  onUserBan,
  onUserUnban,
}) => {
  const onlineUsers = users.filter(user => user.status === 'online');
  const offlineUsers = users.filter(user => user.status === 'offline');
  const bannedUsers = users.filter(user => user.status === 'banned');

  useEffect(() => {
    debugLog.debug('UserList', 'Component mounted', {
      total_users: users.length,
      online_count: onlineUsers.length,
      offline_count: offlineUsers.length,
      banned_count: bannedUsers.length,
      current_user: currentUser?.username,
    });

    return () => {
      debugLog.debug('UserList', 'Component unmounting');
    };
  }, [users.length, onlineUsers.length, offlineUsers.length, bannedUsers.length, currentUser?.username]);

  useEffect(() => {
    debugLog.debug('UserList', 'Users list updated', {
      total_users: users.length,
      online_users: onlineUsers.map(u => u.username),
      offline_users: offlineUsers.map(u => u.username),
      banned_users: bannedUsers.map(u => u.username),
    });
  }, [users, onlineUsers, offlineUsers, bannedUsers]);

  const handleUserClick = (userId: string) => {
    const user = users.find(u => u.id === userId);
    debugLog.info('UserList', 'User clicked', {
      clicked_user: user?.username,
      clicked_user_id: userId,
      user_status: user?.status,
      is_current_user: currentUser?.id === userId,
    });
    onUserClick(userId);
  };

  const handleBanClick = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const user = users.find(u => u.id === userId);
    debugLog.info('UserList', 'Ban button clicked', {
      target_user: user?.username,
      target_user_id: userId,
      target_status: user?.status,
      initiated_by: currentUser?.username,
    });
    if (onUserBan) {
      onUserBan(userId);
    }
  };

  const handleUnbanClick = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const user = users.find(u => u.id === userId);
    debugLog.info('UserList', 'Unban button clicked', {
      target_user: user?.username,
      target_user_id: userId,
      initiated_by: currentUser?.username,
    });
    if (onUserUnban) {
      onUserUnban(userId);
    }
  };

  debugLog.debug('UserList', 'Rendering user sections', {
    online_count: onlineUsers.length,
    offline_count: offlineUsers.length,
    banned_count: bannedUsers.length,
    show_banned_section: bannedUsers.length > 0,
    current_user_id: currentUser?.id,
    current_user_name: currentUser?.username,
    all_user_ids: users.map(u => u.id),
    all_usernames: users.map(u => u.username),
  });

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Online Users */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2 text-discord-status-online">
          Online ({onlineUsers.length})
        </h3>
        <ul className="space-y-1">
          {onlineUsers.map((user) => (
            <li
              key={user.id}
              className={`flex flex-col group cursor-pointer hover:bg-discord-bg-tertiary p-2 rounded ${
                currentUser?.id === user.id ? 'bg-discord-bg-accent bg-opacity-20' : ''
              }`}
              onClick={() => handleUserClick(user.id)}
            >
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-discord-status-online"></span>
                <span className="font-medium flex-1 text-discord-text-primary hover:text-discord-text-link">
                  {user.username}
                </span>
                {currentUser?.id !== user.id && (
                  <button
                    onClick={(e) => handleBanClick(user.id, e)}
                    className="text-discord-status-dnd hover:text-red-700 p-1 hover:bg-red-50 rounded"
                    title="Ban user"
                  >
                    <Ban size={12} />
                  </button>
                )}
                {currentUser?.id === user.id && (
                  <span className="text-xs text-discord-text-muted">(you)</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Offline Users */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2 text-discord-text-muted">
          Offline ({offlineUsers.length})
        </h3>
        <ul className="space-y-1">
          {offlineUsers.map((user) => (
            <li
              key={user.id}
              className={`flex flex-col group cursor-pointer hover:bg-discord-bg-tertiary p-2 rounded ${
                currentUser?.id === user.id ? 'bg-discord-bg-accent bg-opacity-20' : ''
              }`}
              onClick={() => handleUserClick(user.id)}
            >
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-discord-status-offline"></span>
                <span className="font-medium flex-1 text-discord-text-primary hover:text-discord-text-link">
                  {user.username}
                </span>
                {currentUser?.id !== user.id && (
                  <button
                    onClick={(e) => handleBanClick(user.id, e)}
                    className="text-discord-status-dnd hover:text-red-700 p-1 hover:bg-red-50 rounded"
                    title="Ban user"
                  >
                    <Ban size={12} />
                  </button>
                )}
                {currentUser?.id === user.id && (
                  <span className="text-xs text-discord-text-muted">(you)</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Banned Users */}
      {bannedUsers.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-discord-status-dnd">
            Banned ({bannedUsers.length})
          </h3>
          <ul className="space-y-1">
            {bannedUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center space-x-2 p-2 bg-discord-status-dnd bg-opacity-10 rounded cursor-pointer hover:bg-discord-status-dnd hover:bg-opacity-20"
                onClick={() => handleUserClick(user.id)}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-discord-status-dnd"></span>
                <span className="font-medium flex-1 text-discord-text-primary">{user.username}</span>
                <button
                  onClick={(e) => handleUnbanClick(user.id, e)}
                  className="text-discord-text-link hover:text-discord-text-accent text-sm underline"
                  title="Unban user"
                >
                  Unban
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};