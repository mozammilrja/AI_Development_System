import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation, PresenceStatus } from '../../types/chat';
import { useChatStore } from '../../stores/chatStore';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  onSelect: (conversationId: string) => void;
}

export function ConversationList({ conversations, currentUserId, onSelect }: ConversationListProps) {
  const { activeConversationId, presence } = useChatStore();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <h3 className="mb-1 text-sm font-medium text-gray-900">No conversations</h3>
        <p className="text-xs text-gray-500">Start a new chat to get going!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation._id}
          conversation={conversation}
          currentUserId={currentUserId}
          isActive={activeConversationId === conversation._id}
          presence={presence}
          onClick={() => onSelect(conversation._id)}
        />
      ))}
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  presence: Record<string, { status: PresenceStatus }>;
  onClick: () => void;
}

function ConversationItem({ conversation, currentUserId, isActive, presence, onClick }: ConversationItemProps) {
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

  const lastMessageTime = conversation.lastMessage?.timestamp
    ? formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })
    : '';

  const unreadCount = 0; // TODO: Implement unread count

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        isActive ? 'bg-blue-50' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {displayInfo.avatar ? (
          <img
            src={displayInfo.avatar}
            alt={displayInfo.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
            <span className="text-lg font-medium text-white">
              {conversation.type === 'channel' ? '#' : displayInfo.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {/* Online indicator for DMs */}
        {conversation.type === 'dm' && displayInfo.userId && (
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="truncate text-sm font-medium text-gray-900">
            {displayInfo.name}
          </h3>
          {lastMessageTime && (
            <span className="text-xs text-gray-400">{lastMessageTime}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-sm text-gray-500">
            {conversation.lastMessage ? (
              <>
                {conversation.type !== 'dm' && conversation.lastMessage.senderName && (
                  <span className="font-medium">{conversation.lastMessage.senderName}: </span>
                )}
                {conversation.lastMessage.content}
              </>
            ) : (
              <span className="italic">No messages yet</span>
            )}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
