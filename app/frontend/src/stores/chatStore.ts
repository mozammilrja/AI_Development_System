import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Conversation, Message, TypingUser, UserPresence, PresenceStatus } from '../types/chat';

interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  conversationsLoading: boolean;
  conversationsCursor: string | null;
  hasMoreConversations: boolean;

  // Messages
  messagesByConversation: Record<string, Message[]>;
  messagesLoading: boolean;
  messagesCursor: Record<string, string | null>;
  hasMoreMessages: Record<string, boolean>;

  // Typing indicators
  typingUsers: Record<string, TypingUser[]>;

  // Presence
  presence: Record<string, UserPresence>;

  // Read receipts
  readReceipts: Record<string, Record<string, string[]>>; // convId -> msgId -> userIds[]
  readHorizons: Record<string, Record<string, string>>; // convId -> userId -> lastReadMsgId

  // Reply
  replyingTo: Message | null;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  addConversation: (conversation: Conversation) => void;
  removeConversation: (conversationId: string) => void;

  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessages: (conversationId: string, messages: Message[], prepend?: boolean) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;

  setTypingUsers: (conversationId: string, users: TypingUser[]) => void;
  addTypingUser: (conversationId: string, user: TypingUser) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;

  setPresence: (userId: string, presence: UserPresence) => void;
  updatePresence: (userId: string, status: PresenceStatus, lastSeen?: string) => void;

  updateReadReceipt: (convId: string, msgId: string, userId: string) => void;
  updateReadHorizon: (convId: string, userId: string, msgId: string) => void;

  setReplyingTo: (message: Message | null) => void;

  setConversationsLoading: (loading: boolean) => void;
  setMessagesLoading: (loading: boolean) => void;
  setMessagesCursor: (conversationId: string, cursor: string | null) => void;
  setHasMoreMessages: (conversationId: string, hasMore: boolean) => void;
  setConversationsCursor: (cursor: string | null) => void;
  setHasMoreConversations: (hasMore: boolean) => void;

  reset: () => void;
}

const initialState = {
  conversations: [],
  activeConversationId: null,
  conversationsLoading: false,
  conversationsCursor: null,
  hasMoreConversations: true,
  messagesByConversation: {},
  messagesLoading: false,
  messagesCursor: {},
  hasMoreMessages: {},
  typingUsers: {},
  presence: {},
  readReceipts: {},
  readHorizons: {},
  replyingTo: null,
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Conversation actions
      setConversations: (conversations) =>
        set({ conversations }, false, 'setConversations'),

      addConversations: (newConversations) =>
        set(
          (state) => ({
            conversations: [...state.conversations, ...newConversations],
          }),
          false,
          'addConversations'
        ),

      setActiveConversation: (conversationId) =>
        set({ activeConversationId: conversationId }, false, 'setActiveConversation'),

      updateConversation: (conversationId, updates) =>
        set(
          (state) => ({
            conversations: state.conversations.map((conv) =>
              conv._id === conversationId ? { ...conv, ...updates } : conv
            ),
          }),
          false,
          'updateConversation'
        ),

      addConversation: (conversation) =>
        set(
          (state) => ({
            conversations: [conversation, ...state.conversations],
          }),
          false,
          'addConversation'
        ),

      removeConversation: (conversationId) =>
        set(
          (state) => ({
            conversations: state.conversations.filter((c) => c._id !== conversationId),
            activeConversationId:
              state.activeConversationId === conversationId ? null : state.activeConversationId,
          }),
          false,
          'removeConversation'
        ),

      // Message actions
      setMessages: (conversationId, messages) =>
        set(
          (state) => ({
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: messages,
            },
          }),
          false,
          'setMessages'
        ),

      addMessages: (conversationId, messages, prepend = false) =>
        set(
          (state) => {
            const existing = state.messagesByConversation[conversationId] || [];
            return {
              messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: prepend
                  ? [...messages, ...existing]
                  : [...existing, ...messages],
              },
            };
          },
          false,
          'addMessages'
        ),

      addMessage: (message) =>
        set(
          (state) => {
            const conversationId = message.conversationId;
            const existing = state.messagesByConversation[conversationId] || [];
            
            // Update last message in conversation
            const conversations = state.conversations.map((conv) => {
              if (conv._id === conversationId) {
                return {
                  ...conv,
                  lastMessage: {
                    _id: message._id,
                    senderId: typeof message.senderId === 'string' ? message.senderId : message.senderId._id,
                    senderName: typeof message.senderId === 'string' ? '' : message.senderId.name,
                    content: message.content.text?.substring(0, 100) || '[Media]',
                    type: message.type,
                    timestamp: message.createdAt,
                  },
                };
              }
              return conv;
            });

            // Move conversation to top
            const convIndex = conversations.findIndex((c) => c._id === conversationId);
            if (convIndex > 0) {
              const [conv] = conversations.splice(convIndex, 1);
              conversations.unshift(conv);
            }

            return {
              messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: [...existing, message],
              },
              conversations,
            };
          },
          false,
          'addMessage'
        ),

      updateMessage: (messageId, updates) =>
        set(
          (state) => {
            const newMessagesByConversation = { ...state.messagesByConversation };
            for (const [convId, messages] of Object.entries(newMessagesByConversation)) {
              const index = messages.findIndex((m) => m._id === messageId);
              if (index !== -1) {
                newMessagesByConversation[convId] = messages.map((m) =>
                  m._id === messageId ? { ...m, ...updates } : m
                );
                break;
              }
            }
            return { messagesByConversation: newMessagesByConversation };
          },
          false,
          'updateMessage'
        ),

      removeMessage: (messageId) =>
        set(
          (state) => {
            const newMessagesByConversation = { ...state.messagesByConversation };
            for (const [convId, messages] of Object.entries(newMessagesByConversation)) {
              const index = messages.findIndex((m) => m._id === messageId);
              if (index !== -1) {
                newMessagesByConversation[convId] = messages.filter((m) => m._id !== messageId);
                break;
              }
            }
            return { messagesByConversation: newMessagesByConversation };
          },
          false,
          'removeMessage'
        ),

      // Typing actions
      setTypingUsers: (conversationId, users) =>
        set(
          (state) => ({
            typingUsers: { ...state.typingUsers, [conversationId]: users },
          }),
          false,
          'setTypingUsers'
        ),

      addTypingUser: (conversationId, user) =>
        set(
          (state) => {
            const existing = state.typingUsers[conversationId] || [];
            if (existing.some((u) => u.userId === user.userId)) {
              return state;
            }
            return {
              typingUsers: {
                ...state.typingUsers,
                [conversationId]: [...existing, user],
              },
            };
          },
          false,
          'addTypingUser'
        ),

      removeTypingUser: (conversationId, userId) =>
        set(
          (state) => ({
            typingUsers: {
              ...state.typingUsers,
              [conversationId]: (state.typingUsers[conversationId] || []).filter(
                (u) => u.userId !== userId
              ),
            },
          }),
          false,
          'removeTypingUser'
        ),

      // Presence actions
      setPresence: (userId, presence) =>
        set(
          (state) => ({
            presence: { ...state.presence, [userId]: presence },
          }),
          false,
          'setPresence'
        ),

      updatePresence: (userId, status, lastSeen) =>
        set(
          (state) => ({
            presence: {
              ...state.presence,
              [userId]: {
                ...state.presence[userId],
                userId,
                status,
                lastSeen,
              },
            },
          }),
          false,
          'updatePresence'
        ),

      // Read receipt actions
      updateReadReceipt: (convId, msgId, userId) =>
        set(
          (state) => {
            const convReceipts = state.readReceipts[convId] || {};
            const msgReceipts = convReceipts[msgId] || [];
            
            // Don't add duplicate
            if (msgReceipts.includes(userId)) {
              return state;
            }

            return {
              readReceipts: {
                ...state.readReceipts,
                [convId]: {
                  ...convReceipts,
                  [msgId]: [...msgReceipts, userId],
                },
              },
            };
          },
          false,
          'updateReadReceipt'
        ),

      updateReadHorizon: (convId, userId, msgId) =>
        set(
          (state) => {
            const convHorizons = state.readHorizons[convId] || {};
            return {
              readHorizons: {
                ...state.readHorizons,
                [convId]: {
                  ...convHorizons,
                  [userId]: msgId,
                },
              },
            };
          },
          false,
          'updateReadHorizon'
        ),

      // Reply
      setReplyingTo: (message) => set({ replyingTo: message }, false, 'setReplyingTo'),

      // Loading states
      setConversationsLoading: (loading) =>
        set({ conversationsLoading: loading }, false, 'setConversationsLoading'),

      setMessagesLoading: (loading) =>
        set({ messagesLoading: loading }, false, 'setMessagesLoading'),

      setMessagesCursor: (conversationId, cursor) =>
        set(
          (state) => ({
            messagesCursor: { ...state.messagesCursor, [conversationId]: cursor },
          }),
          false,
          'setMessagesCursor'
        ),

      setHasMoreMessages: (conversationId, hasMore) =>
        set(
          (state) => ({
            hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: hasMore },
          }),
          false,
          'setHasMoreMessages'
        ),

      setConversationsCursor: (cursor) =>
        set({ conversationsCursor: cursor }, false, 'setConversationsCursor'),

      setHasMoreConversations: (hasMore) =>
        set({ hasMoreConversations: hasMore }, false, 'setHasMoreConversations'),

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'chat-store' }
  )
);
