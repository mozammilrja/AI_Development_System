import { useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useChatStore } from '../stores/chatStore';
import type { 
  Conversation, 
  Message, 
  ConversationType,
  ConversationsResponse,
  MessagesResponse 
} from '../types/chat';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// API functions
const api = {
  // Conversations
  async getConversations(cursor?: string): Promise<ConversationsResponse> {
    const url = new URL(`${API_URL}/api/conversations`);
    if (cursor) url.searchParams.set('cursor', cursor);
    
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  async getConversation(id: string): Promise<Conversation> {
    const res = await fetch(`${API_URL}/api/conversations/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch conversation');
    return res.json();
  },

  async createConversation(data: {
    type: ConversationType;
    name?: string;
    description?: string;
    members: string[];
    isPublic?: boolean;
    encrypted?: boolean;
  }): Promise<Conversation> {
    const res = await fetch(`${API_URL}/api/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    return res.json();
  },

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    const res = await fetch(`${API_URL}/api/conversations/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update conversation');
    return res.json();
  },

  async leaveConversation(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/conversations/${id}/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to leave conversation');
  },

  // Messages
  async getMessages(conversationId: string, cursor?: string): Promise<MessagesResponse> {
    const url = new URL(`${API_URL}/api/messages/conversation/${conversationId}`);
    if (cursor) url.searchParams.set('cursor', cursor);
    
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async sendMessage(conversationId: string, data: {
    type: string;
    content: { text?: string };
    replyTo?: string;
    threadRoot?: string;
  }): Promise<Message> {
    const res = await fetch(`${API_URL}/api/messages/conversation/${conversationId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async editMessage(messageId: string, content: { text: string }): Promise<Message> {
    const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to edit message');
    return res.json();
  },

  async deleteMessage(messageId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete message');
  },

  async addReaction(messageId: string, emoji: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emoji }),
    });
    if (!res.ok) throw new Error('Failed to add reaction');
  },

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/messages/${messageId}/reactions`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emoji }),
    });
    if (!res.ok) throw new Error('Failed to remove reaction');
  },

  async markAsRead(conversationId: string, messageId: string): Promise<void> {
    const res = await fetch(
      `${API_URL}/api/messages/conversation/${conversationId}/read/${messageId}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    if (!res.ok) throw new Error('Failed to mark as read');
  },

  async searchMessages(query: string, conversationId?: string): Promise<Message[]> {
    const url = new URL(`${API_URL}/api/messages/search`);
    url.searchParams.set('q', query);
    if (conversationId) url.searchParams.set('conversationId', conversationId);
    
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to search messages');
    return res.json();
  },

  // Media
  async uploadMedia(conversationId: string, files: File[]): Promise<Message> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    
    const res = await fetch(`${API_URL}/api/messages/conversation/${conversationId}/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload media');
    return res.json();
  },
};

// Hooks
export function useConversations() {
  const { setConversations, setConversationsLoading } = useChatStore();

  return useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: async ({ pageParam }) => {
      setConversationsLoading(true);
      try {
        const data = await api.getConversations(pageParam);
        return data;
      } finally {
        setConversationsLoading(false);
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 30000,
  });
}

export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => api.getConversation(conversationId!),
    enabled: !!conversationId,
    staleTime: 60000,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { addConversation, setActiveConversation } = useChatStore();

  return useMutation({
    mutationFn: api.createConversation,
    onSuccess: (conversation) => {
      addConversation(conversation);
      setActiveConversation(conversation._id);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useLeaveConversation() {
  const queryClient = useQueryClient();
  const { removeConversation } = useChatStore();

  return useMutation({
    mutationFn: api.leaveConversation,
    onSuccess: (_, conversationId) => {
      removeConversation(conversationId);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMessages(conversationId: string | null) {
  const { setMessages, setMessagesLoading, setMessagesCursor, setHasMoreMessages } = useChatStore();

  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam }) => {
      if (!conversationId) throw new Error('No conversation');
      setMessagesLoading(true);
      try {
        const data = await api.getMessages(conversationId, pageParam);
        if (!pageParam) {
          // First page - set messages
          setMessages(conversationId, data.messages.reverse());
        }
        setMessagesCursor(conversationId, data.nextCursor);
        setHasMoreMessages(conversationId, data.hasMore);
        return data;
      } finally {
        setMessagesLoading(false);
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
    staleTime: 0, // Always refetch messages
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, ...data }: Parameters<typeof api.sendMessage>[1] & { conversationId: string }) =>
      api.sendMessage(conversationId, data),
    onSuccess: () => {
      // Message is added via socket, no need to invalidate
    },
  });
}

export function useEditMessage() {
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: { text: string } }) =>
      api.editMessage(messageId, content),
  });
}

export function useDeleteMessage() {
  return useMutation({
    mutationFn: api.deleteMessage,
  });
}

export function useReaction() {
  return useMutation({
    mutationFn: ({ messageId, emoji, remove }: { messageId: string; emoji: string; remove?: boolean }) =>
      remove ? api.removeReaction(messageId, emoji) : api.addReaction(messageId, emoji),
  });
}

export function useSearchMessages() {
  return useMutation({
    mutationFn: ({ query, conversationId }: { query: string; conversationId?: string }) =>
      api.searchMessages(query, conversationId),
  });
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: ({ conversationId, files }: { conversationId: string; files: File[] }) =>
      api.uploadMedia(conversationId, files),
  });
}

// Typing indicator hook with debounce
export function useTypingIndicator(conversationId: string | null, startTyping: (id: string) => void, stopTyping: (id: string) => void) {
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(conversationId);
    }

    // Reset timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      stopTyping(conversationId);
    }, 2000);
  }, [conversationId, startTyping, stopTyping]);

  const handleStopTyping = useCallback(() => {
    if (!conversationId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      stopTyping(conversationId);
    }
  }, [conversationId, stopTyping]);

  return { handleTyping, handleStopTyping };
}
