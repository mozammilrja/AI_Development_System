import { useMemo } from 'react';
import type { Conversation, PresenceStatus } from '../../types/chat';
import { useChatStore } from '../../stores/chatStore';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  onInfoClick?: () => void;
  onBackClick?: () => void;
}

export function ChatHeader({ conversation, currentUserId, onInfoClick, onBackClick }: ChatHeaderProps) {
  const { presence, typingUsers } = useChatStore();
  const typing = typingUsers[conversation._id] || [];

  // Get display info based on conversation type
  const displayInfo = useMemo(() => {
    if (conversation.type === 'dm') {
      const otherMember = conversation.members.find((m) => {
        const memberId = typeof m.userId === 'string' ? m.userId : m.userId._id;
        return memberId !== currentUserId;
      });
      const otherUser = otherMember?.userId;
      if (typeof otherUser === 'string') {
        return { name: 'User', avatar: undefined, userId: otherUser };
      }
      return {
        name: otherUser?.name || 'User',
        avatar: otherUser?.avatar,
        userId: otherUser?._id,
      };
    }
    return {
      name: conversation.name || 'Unnamed',
      avatar: conversation.avatar,
      userId: null,
    };
  }, [conversation, currentUserId]);

  const isOnline = displayInfo.userId 
    ? presence[displayInfo.userId]?.status === 'online'
    : false;

  const statusText = useMemo(() => {
    if (typing.length > 0) {
      if (typing.length === 1) {
        return `${typing[0].userName} is typing...`;
      }
      return `${typing.length} people are typing...`;
    }

    if (conversation.type === 'dm' && displayInfo.userId) {
      const userPresence = presence[displayInfo.userId];
      if (userPresence) {
        switch (userPresence.status) {
          case 'online':
            return 'Online';
          case 'away':
            return 'Away';
          case 'busy':
            return 'Do not disturb';
          default:
            return 'Offline';
        }
      }
      return 'Offline';
    }

    return `${conversation.members.length} members`;
  }, [conversation, displayInfo.userId, presence, typing]);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Back button (mobile) */}
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          {displayInfo.avatar ? (
            <img
              src={displayInfo.avatar}
              alt={displayInfo.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
              <span className="text-sm font-medium text-white">
                {conversation.type === 'channel' ? '#' : displayInfo.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Online indicator */}
          {conversation.type === 'dm' && displayInfo.userId && (
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                isOnline ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </div>

        {/* Info */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{displayInfo.name}</h2>
          <p className={`text-xs ${typing.length > 0 ? 'text-blue-500' : 'text-gray-500'}`}>
            {statusText}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Voice call */}
        <button
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Voice call"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>

        {/* Video call */}
        <button
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Video call"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Info/Settings */}
        {onInfoClick && (
          <button
            onClick={onInfoClick}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Conversation info"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
