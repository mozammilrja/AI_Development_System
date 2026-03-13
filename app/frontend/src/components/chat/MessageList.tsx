import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useMessages } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  conversationId: string;
  currentUserId: string;
}

export function MessageList({ conversationId, currentUserId }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const { messagesByConversation, messagesLoading, typingUsers, hasMoreMessages } = useChatStore();
  const messages = messagesByConversation[conversationId] || [];
  const typing = typingUsers[conversationId] || [];

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(conversationId);

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
      isInitialLoad.current = false;
    }
  }, [messages.length]);

  // Scroll to bottom when new message from self
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      const senderId = typeof lastMessage.senderId === 'string' 
        ? lastMessage.senderId 
        : lastMessage.senderId._id;
      if (senderId === currentUserId) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, currentUserId]);

  // Load more messages on scroll to top
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      const prevScrollHeight = container.scrollHeight;
      fetchNextPage().then(() => {
        // Maintain scroll position
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight;
      });
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Check if we should show sender name and avatar (for grouping)
  const shouldShowSender = (index: number): boolean => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    const currentMessage = messages[index];
    
    const prevSenderId = typeof prevMessage.senderId === 'string' 
      ? prevMessage.senderId 
      : prevMessage.senderId._id;
    const currSenderId = typeof currentMessage.senderId === 'string' 
      ? currentMessage.senderId 
      : currentMessage.senderId._id;
    
    // Show sender if different from previous or more than 5 min gap
    if (prevSenderId !== currSenderId) return true;
    
    const timeDiff = new Date(currentMessage.createdAt).getTime() - 
                     new Date(prevMessage.createdAt).getTime();
    return timeDiff > 5 * 60 * 1000;
  };

  if (messagesLoading && messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 rounded-full bg-blue-100 p-4">
          <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-medium text-gray-900">No messages yet</h3>
        <p className="text-sm text-gray-500">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <svg className="h-5 w-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {/* Messages */}
      <div className="py-4">
        {messages.map((message, index) => {
          const senderId = typeof message.senderId === 'string' 
            ? message.senderId 
            : message.senderId._id;
          const isOwnMessage = senderId === currentUserId;
          const showSender = shouldShowSender(index);

          return (
            <MessageBubble
              key={message._id}
              message={message}
              isOwnMessage={isOwnMessage}
              showAvatar={showSender}
              showSender={showSender}
            />
          );
        })}
      </div>

      {/* Typing indicator */}
      {typing.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex -space-x-1">
            {typing.slice(0, 3).map((user) => (
              <div
                key={user.userId}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-600 ring-2 ring-white"
              >
                {user.userName.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-gray-500">
              {typing.length === 1
                ? `${typing[0].userName} is typing...`
                : `${typing.length} people are typing...`}
            </span>
          </div>
        </div>
      )}

      {/* Bottom scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
