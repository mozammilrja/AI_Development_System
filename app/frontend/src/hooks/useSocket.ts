import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../stores/chatStore';
import type { Message, Conversation, ConversationMember, Reaction } from '../types/chat';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const {
    addMessage,
    updateMessage,
    updateConversation,
    addTypingUser,
    removeTypingUser,
    updatePresence,
    updateReadReceipt,
    updateReadHorizon,
  } = useChatStore();

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Message events
    socket.on('message:new', (message: Message) => {
      addMessage(message);
    });

    socket.on('message:edited', ({ messageId, content, editedAt }) => {
      updateMessage(messageId, { content: { text: content }, editedAt });
    });

    socket.on('message:deleted', ({ messageId, deletedAt }) => {
      updateMessage(messageId, {
        deletedAt,
        content: { text: 'This message was deleted' },
      });
    });

    socket.on('message:reaction', ({ messageId, reactions }) => {
      updateMessage(messageId, { reactions: reactions as Reaction[] });
    });

    socket.on('message:read', ({ conversationId, userId, messageId }) => {
      // Update read receipt state
      updateReadReceipt(conversationId, messageId, userId);
      updateReadHorizon(conversationId, userId, messageId);
    });

    // Typing events
    socket.on('typing:start', ({ conversationId, userId, userName }) => {
      addTypingUser(conversationId, { userId, userName });
      // Auto-remove after 5 seconds
      setTimeout(() => {
        removeTypingUser(conversationId, userId);
      }, 5000);
    });

    socket.on('typing:stop', ({ conversationId, userId }) => {
      removeTypingUser(conversationId, userId);
    });

    // Presence events
    socket.on('presence:update', ({ userId, status, lastSeen }) => {
      updatePresence(userId, status as any, lastSeen);
    });

    // Conversation events
    socket.on('conversation:update', (conversation: Conversation) => {
      updateConversation(conversation._id, conversation);
    });

    socket.on('conversation:member_added', ({ conversationId, member }) => {
      // Update conversation members
      const conversations = useChatStore.getState().conversations;
      const conv = conversations.find((c) => c._id === conversationId);
      if (conv) {
        updateConversation(conversationId, {
          members: [...conv.members, member as ConversationMember],
        });
      }
    });

    socket.on('conversation:member_removed', ({ conversationId, userId }) => {
      const conversations = useChatStore.getState().conversations;
      const conv = conversations.find((c) => c._id === conversationId);
      if (conv) {
        updateConversation(conversationId, {
          members: conv.members.filter((m) => {
            const memberId = typeof m.userId === 'string' ? m.userId : m.userId._id;
            return memberId !== userId;
          }),
        });
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, addMessage, updateMessage, updateConversation, addTypingUser, removeTypingUser, updatePresence]);

  // Socket actions
  const sendMessage = useCallback((data: {
    conversationId: string;
    content: { text?: string };
    type: string;
    replyTo?: string;
  }) => {
    socketRef.current?.emit('message:send', data);
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:start', { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:stop', { conversationId });
  }, []);

  const updateStatus = useCallback((status: string, customMessage?: string) => {
    socketRef.current?.emit('presence:update', { status, customMessage });
  }, []);

  const markAsRead = useCallback((conversationId: string, messageId: string) => {
    socketRef.current?.emit('message:mark_read', { conversationId, messageId });
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', conversationId);
  }, []);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    sendMessage,
    startTyping,
    stopTyping,
    updateStatus,
    markAsRead,
    joinConversation,
    leaveConversation,
  };
}
