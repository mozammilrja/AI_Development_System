// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Presence types
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  customMessage?: string;
  lastSeen?: string;
}

// Conversation types
export type ConversationType = 'dm' | 'group' | 'channel';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface ConversationMember {
  userId: User;
  role: MemberRole;
  joinedAt: string;
  lastReadAt: string;
  muted: boolean;
  mutedUntil?: string;
  nickname?: string;
}

export interface LastMessage {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: string;
  timestamp: string;
}

export interface ConversationSettings {
  encrypted: boolean;
  messageRetention?: number;
  membersCanInvite: boolean;
  slowMode?: number;
}

export interface Conversation {
  _id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  avatar?: string;
  isPublic?: boolean;
  topic?: string;
  members: ConversationMember[];
  dmParticipants?: [string, string];
  settings: ConversationSettings;
  lastMessage?: LastMessage;
  pinnedMessages: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Message types
export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'video' | 'system' | 'call';

export interface MessageContent {
  text?: string;
  encrypted?: string;
  iv?: string;
  systemAction?: 'member_added' | 'member_removed' | 'name_changed' | 'call_started' | 'call_ended';
  systemData?: Record<string, unknown>;
}

export interface MediaAttachment {
  _id: string;
  type: 'image' | 'file' | 'voice' | 'video';
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  blurhash?: string;
  duration?: number;
  waveform?: number[];
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface ReplyTo {
  messageId: string;
  senderId: string;
  senderName: string;
  preview: string;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
  count: number;
}

export interface Mentions {
  users: string[];
  everyone: boolean;
  here: boolean;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: User;
  type: MessageType;
  content: MessageContent;
  media?: MediaAttachment[];
  linkPreviews?: LinkPreview[];
  replyTo?: ReplyTo;
  threadRoot?: string;
  threadCount?: number;
  reactions: Reaction[];
  mentions: Mentions;
  readBy: string[];
  editedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
}

// Typing indicator
export interface TypingUser {
  userId: string;
  userName: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  nextCursor: string | null;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Socket Events
export interface SocketEvents {
  // Server -> Client
  'message:new': (message: Message) => void;
  'message:edited': (data: { messageId: string; content: string; editedAt: string }) => void;
  'message:deleted': (data: { messageId: string; deletedAt: string }) => void;
  'message:reaction': (data: { messageId: string; reactions: Reaction[] }) => void;
  'message:read': (data: { conversationId: string; userId: string; messageId: string }) => void;
  'typing:start': (data: { conversationId: string; userId: string; userName: string }) => void;
  'typing:stop': (data: { conversationId: string; userId: string }) => void;
  'presence:update': (data: { userId: string; status: string; lastSeen?: string }) => void;
  'conversation:update': (conversation: Conversation) => void;
  'conversation:member_added': (data: { conversationId: string; member: ConversationMember }) => void;
  'conversation:member_removed': (data: { conversationId: string; userId: string }) => void;
  'call:incoming': (data: unknown) => void;
  'call:answered': (data: unknown) => void;
  'call:ended': (data: unknown) => void;
  'error': (error: { code: string; message: string }) => void;
}
