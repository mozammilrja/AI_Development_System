import { useMemo } from 'react';
import { useReadReceipts } from '../../hooks/useReadReceipts';
import { useChatStore } from '../../stores/chatStore';
import type { ConversationType } from '../../types/chat';

interface ReadReceiptIndicatorProps {
  messageId: string;
  conversationId: string;
  senderId: string;
  isOwnMessage: boolean;
}

/**
 * Read receipt indicator component
 * Displays different indicators based on conversation type:
 * - DM: ✓✓ checkmarks (gray=sent, blue=delivered, double-blue=read)
 * - Small group (≤20): Avatar stack + "Seen by X, Y, +N"
 * - Large group: Simple "Read" indicator
 */
export function ReadReceiptIndicator({
  messageId,
  conversationId,
  senderId,
  isOwnMessage,
}: ReadReceiptIndicatorProps) {
  // Only show for own messages
  if (!isOwnMessage) {
    return null;
  }

  const conversations = useChatStore((state) => state.conversations);
  const presence = useChatStore((state) => state.presence);

  const conversation = useMemo(
    () => conversations.find((c) => c._id === conversationId),
    [conversations, conversationId]
  );

  if (!conversation) {
    return null;
  }

  const conversationType: ConversationType = conversation.type;
  const memberCount = conversation.members.length;

  const { status, readByUserIds, readByCount, displayMode } = useReadReceipts({
    conversationId,
    messageId,
    conversationType,
    memberCount,
    senderId,
  });

  // Get member details for avatar display
  const readByMembers = useMemo(() => {
    return conversation.members
      .filter((member) => readByUserIds.includes(member.userId._id))
      .map((member) => member.userId);
  }, [conversation.members, readByUserIds]);

  // DM: Checkmark display
  if (displayMode === 'checkmarks') {
    return (
      <div className="mt-0.5 flex justify-end">
        <CheckmarkIndicator status={status} />
      </div>
    );
  }

  // Small group: Avatar stack
  if (displayMode === 'avatars') {
    if (readByCount === 0) {
      return (
        <div className="mt-0.5 flex justify-end">
          <CheckmarkIndicator status={status} />
        </div>
      );
    }

    const maxAvatars = 3;
    const displayedMembers = readByMembers.slice(0, maxAvatars);
    const remainingCount = readByCount - maxAvatars;

    return (
      <div className="mt-1 flex items-center justify-end gap-1">
        {/* Avatar stack */}
        <div className="flex -space-x-1.5">
          {displayedMembers.map((user) => (
            <div
              key={user._id}
              className="relative h-4 w-4 rounded-full border border-white"
              title={user.name}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[8px] font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* "Seen by X, Y, +N" text */}
        <span className="text-[10px] text-gray-400">
          {formatSeenByText(readByMembers, remainingCount)}
        </span>
      </div>
    );
  }

  // Large group: Simple indicator
  if (displayMode === 'simple') {
    if (readByCount === 0) {
      return (
        <div className="mt-0.5 flex justify-end">
          <CheckmarkIndicator status={status} />
        </div>
      );
    }

    return (
      <div className="mt-0.5 flex justify-end">
        <span className="text-[10px] text-blue-400">
          Read by {readByCount}
        </span>
      </div>
    );
  }

  return null;
}

/**
 * Checkmark indicator for DMs and unread messages
 */
function CheckmarkIndicator({ status }: { status: 'sent' | 'delivered' | 'read' }) {
  const colorClass = status === 'read' 
    ? 'text-blue-400' 
    : status === 'delivered' 
      ? 'text-gray-400' 
      : 'text-gray-300';

  return (
    <span className={`text-xs ${colorClass}`} title={status}>
      {status === 'sent' ? (
        // Single checkmark for sent
        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
      ) : (
        // Double checkmark for delivered/read
        <svg className="h-3 w-4" viewBox="0 0 20 16" fill="currentColor">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
          <path d="M17.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-1-1a.5.5 0 1 1 .708-.708l.646.647 6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
      )}
    </span>
  );
}

/**
 * Format the "Seen by X, Y, +N" text
 */
function formatSeenByText(
  members: Array<{ _id: string; name: string }>,
  remainingCount: number
): string {
  if (members.length === 0) return '';

  const names = members.slice(0, 2).map((m) => m.name.split(' ')[0]);
  
  if (remainingCount > 0) {
    return `Seen by ${names.join(', ')} +${remainingCount}`;
  }
  
  if (names.length === 1) {
    return `Seen by ${names[0]}`;
  }
  
  return `Seen by ${names.join(', ')}`;
}
