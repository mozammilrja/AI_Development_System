import { useMemo } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import type { Message } from '../../types/chat';
import { useChatStore } from '../../stores/chatStore';
import { useReaction, useDeleteMessage } from '../../hooks/useChat';
import { ReadReceiptIndicator } from './ReadReceiptIndicator';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showSender?: boolean;
}

export function MessageBubble({ 
  message, 
  isOwnMessage, 
  showAvatar = true,
  showSender = true 
}: MessageBubbleProps) {
  const { setReplyingTo } = useChatStore();
  const reactionMutation = useReaction();
  const deleteMutation = useDeleteMessage();

  const sender = typeof message.senderId === 'string' 
    ? { _id: message.senderId, name: 'User', avatar: undefined }
    : message.senderId;

  const formattedTime = useMemo(() => {
    const date = new Date(message.createdAt);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  }, [message.createdAt]);

  const handleReply = () => {
    setReplyingTo(message);
  };

  const handleReact = (emoji: string) => {
    const hasReacted = message.reactions.some(
      (r) => r.emoji === emoji && r.userIds.includes(sender._id)
    );
    reactionMutation.mutate({ messageId: message._id, emoji, remove: hasReacted });
  };

  const handleDelete = () => {
    if (confirm('Delete this message?')) {
      deleteMutation.mutate(message._id);
    }
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
          {message.content.text || getSystemMessageText(message)}
        </span>
      </div>
    );
  }

  if (message.deletedAt) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} px-4 py-1`}>
        <div className="rounded-lg bg-gray-100 px-3 py-2 italic text-gray-400">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-end gap-2 px-4 py-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <div className="flex-shrink-0">
          {sender.avatar ? (
            <img
              src={sender.avatar}
              alt={sender.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-medium text-white">
              {sender.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      {!showAvatar && !isOwnMessage && <div className="w-8" />}

      {/* Message content */}
      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Sender name */}
        {showSender && !isOwnMessage && (
          <p className="mb-1 text-xs font-medium text-gray-600">{sender.name}</p>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className="mb-1 rounded-lg border-l-2 border-blue-400 bg-gray-100 px-2 py-1">
            <p className="text-xs font-medium text-blue-600">{message.replyTo.senderName}</p>
            <p className="truncate text-xs text-gray-500">{message.replyTo.preview}</p>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Text content */}
          {message.content.text && (
            <p className="whitespace-pre-wrap break-words text-sm">{message.content.text}</p>
          )}

          {/* Media attachments */}
          {message.media && message.media.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.media.map((attachment) => (
                <MediaAttachment key={attachment._id} attachment={attachment} />
              ))}
            </div>
          )}

          {/* Timestamp and status */}
          <div className={`mt-1 flex items-center gap-1 text-[10px] ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-400'
          }`}>
            <span>{formattedTime}</span>
            {message.editedAt && <span>(edited)</span>}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReact(reaction.emoji)}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs hover:bg-gray-200"
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-500">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Read receipts - only for own messages */}
        {isOwnMessage && (
          <ReadReceiptIndicator
            messageId={message._id}
            conversationId={message.conversationId}
            senderId={sender._id}
            isOwnMessage={isOwnMessage}
          />
        )}
      </div>

      {/* Message actions (hidden on mobile, shown on hover) */}
      <div className={`invisible flex items-center gap-1 group-hover:visible ${
        isOwnMessage ? 'flex-row-reverse' : ''
      }`}>
        <button
          onClick={handleReply}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="Reply"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={() => handleReact('👍')}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          title="React"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        {isOwnMessage && (
          <button
            onClick={handleDelete}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="Delete"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Media attachment component
function MediaAttachment({ attachment }: { attachment: NonNullable<Message['media']>[0] }) {
  if (attachment.type === 'image') {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
        <img
          src={attachment.thumbnail || attachment.url}
          alt={attachment.filename}
          className="max-h-60 max-w-full rounded-lg"
          loading="lazy"
        />
      </a>
    );
  }

  if (attachment.type === 'video') {
    return (
      <video
        src={attachment.url}
        controls
        className="max-h-60 max-w-full rounded-lg"
        poster={attachment.thumbnail}
      />
    );
  }

  if (attachment.type === 'voice') {
    return (
      <audio src={attachment.url} controls className="w-full" />
    );
  }

  // File attachment
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2"
    >
      <svg className="h-8 w-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{attachment.filename}</p>
        <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
      </div>
    </a>
  );
}

// Helpers
function getSystemMessageText(message: Message): string {
  const action = message.content.systemAction;
  switch (action) {
    case 'member_added':
      return 'A member was added to the conversation';
    case 'member_removed':
      return 'A member left the conversation';
    case 'name_changed':
      return 'The conversation name was changed';
    case 'call_started':
      return 'A call was started';
    case 'call_ended':
      return 'The call ended';
    default:
      return 'System message';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
