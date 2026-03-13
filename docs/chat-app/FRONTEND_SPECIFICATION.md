# ChatHub - Frontend Specification

**Version:** 1.0  
**Date:** March 13, 2026  
**Framework:** React 18 + TypeScript + Vite  

---

## 1. Overview

### 1.1 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| Zustand | 4.x | Global state |
| TanStack Query | 5.x | Server state |
| Socket.IO Client | 4.x | Real-time |
| React Router | 6.x | Routing |
| libsignal-protocol | Latest | E2E encryption |

### 1.2 Design Principles

1. **Real-time first** — Optimistic updates, instant feedback
2. **Offline capable** — Queue messages when offline
3. **Accessible** — WCAG 2.1 AA compliance
4. **Mobile responsive** — Works on all screen sizes
5. **Performance** — 60fps animations, lazy loading

---

## 2. Application Structure

### 2.1 Directory Structure

```
app/frontend/src/
├── App.tsx
├── main.tsx
├── vite-env.d.ts
│
├── pages/
│   ├── Auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── Chat/
│   │   ├── ChatPage.tsx              # Main chat layout
│   │   ├── ConversationView.tsx      # Selected conversation
│   │   └── WelcomeView.tsx           # No conversation selected
│   ├── VideoCall/
│   │   └── CallPage.tsx              # Full-screen call view
│   └── Settings/
│       ├── SettingsPage.tsx
│       ├── ProfileSettings.tsx
│       ├── NotificationSettings.tsx
│       └── PrivacySettings.tsx
│
├── components/
│   ├── ui/                           # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   │
│   ├── layout/
│   │   ├── AppLayout.tsx             # Main app shell
│   │   ├── Sidebar.tsx               # Left sidebar
│   │   └── Header.tsx                # Top header
│   │
│   ├── chat/
│   │   ├── ConversationList/
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ConversationItem.tsx
│   │   │   ├── ConversationSearch.tsx
│   │   │   └── NewConversationModal.tsx
│   │   │
│   │   ├── MessageThread/
│   │   │   ├── MessageThread.tsx     # Message container
│   │   │   ├── MessageBubble.tsx     # Single message
│   │   │   ├── MessageGroup.tsx      # Grouped by sender
│   │   │   ├── MessageInput.tsx      # Compose area
│   │   │   ├── MessageActions.tsx    # Reply, react, etc.
│   │   │   └── ThreadPanel.tsx       # Thread side panel
│   │   │
│   │   ├── MessageContent/
│   │   │   ├── TextContent.tsx       # Text + markdown
│   │   │   ├── ImageContent.tsx      # Image with lightbox
│   │   │   ├── FileContent.tsx       # File attachment
│   │   │   ├── VoiceContent.tsx      # Voice message player
│   │   │   ├── LinkPreview.tsx       # URL previews
│   │   │   └── SystemMessage.tsx     # System notifications
│   │   │
│   │   ├── Indicators/
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── ReadReceipt.tsx
│   │   │   └── UnreadBadge.tsx
│   │   │
│   │   ├── Reactions/
│   │   │   ├── ReactionBar.tsx       # Reactions on message
│   │   │   ├── ReactionPicker.tsx    # Emoji picker
│   │   │   └── ReactionDetails.tsx   # Who reacted modal
│   │   │
│   │   └── Header/
│   │       ├── ConversationHeader.tsx
│   │       ├── MemberList.tsx
│   │       └── ConversationSettings.tsx
│   │
│   ├── media/
│   │   ├── ImagePreview.tsx          # Full-screen image
│   │   ├── ImageLightbox.tsx         # Gallery view
│   │   ├── FileUploader.tsx          # Drag-drop upload
│   │   ├── VoiceRecorder.tsx         # Record voice
│   │   ├── VoicePlayer.tsx           # Playback controls
│   │   └── MediaGallery.tsx          # Conversation media
│   │
│   ├── video/
│   │   ├── VideoGrid.tsx             # Participant grid
│   │   ├── VideoTile.tsx             # Single participant
│   │   ├── LocalVideo.tsx            # Self view
│   │   ├── CallControls.tsx          # Mute, camera, etc.
│   │   ├── ScreenSharePreview.tsx    # Screen share view
│   │   ├── IncomingCallModal.tsx     # Call notification
│   │   └── CallQualityIndicator.tsx  # Connection status
│   │
│   ├── presence/
│   │   ├── PresenceIndicator.tsx     # Online dot
│   │   ├── UserStatus.tsx            # Status with message
│   │   └── StatusPicker.tsx          # Status selector
│   │
│   ├── search/
│   │   ├── SearchModal.tsx           # Global search
│   │   ├── SearchResults.tsx         # Results list
│   │   └── SearchFilters.tsx         # Date, sender, etc.
│   │
│   └── user/
│       ├── UserCard.tsx              # User info popup
│       ├── UserProfile.tsx           # Profile page
│       └── AvatarUploader.tsx        # Avatar change
│
├── hooks/
│   ├── useSocket.ts                  # Socket.IO connection
│   ├── useChat.ts                    # Chat operations
│   ├── useConversations.ts           # Conversation list
│   ├── useMessages.ts                # Message queries
│   ├── useTyping.ts                  # Typing indicators
│   ├── usePresence.ts                # User presence
│   ├── useVideoCall.ts               # WebRTC calls
│   ├── useEncryption.ts              # E2E encryption
│   ├── useMediaUpload.ts             # File uploads
│   ├── useVoiceRecorder.ts           # Voice recording
│   ├── useNotifications.ts           # Push notifications
│   └── useSearch.ts                  # Search functionality
│
├── stores/
│   ├── authStore.ts                  # Auth state
│   ├── chatStore.ts                  # Conversations
│   ├── messageStore.ts               # Messages cache
│   ├── presenceStore.ts              # Online users
│   ├── typingStore.ts                # Who's typing
│   ├── callStore.ts                  # Active calls
│   └── uiStore.ts                    # UI state
│
├── lib/
│   ├── api.ts                        # REST API client
│   ├── socket.ts                     # Socket.IO client
│   ├── encryption.ts                 # Signal Protocol
│   ├── webrtc.ts                     # WebRTC utilities
│   ├── notifications.ts              # Push notification
│   ├── storage.ts                    # IndexedDB wrapper
│   └── utils.ts                      # Helper functions
│
├── types/
│   ├── chat.ts                       # Chat types
│   ├── message.ts                    # Message types
│   ├── user.ts                       # User types
│   ├── call.ts                       # Call types
│   └── api.ts                        # API response types
│
└── styles/
    ├── globals.css                   # Global styles
    └── animations.css                # CSS animations
```

---

## 3. State Management

### 3.1 Zustand Stores

#### Auth Store

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: async (email, password) => {
        const { user, accessToken, refreshToken } = await api.auth.login(email, password);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        socket.disconnect();
      },
      
      // ... more actions
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

#### Chat Store

```typescript
// stores/chatStore.ts
interface ChatState {
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  isLoading: boolean;
  
  // Computed
  activeConversation: Conversation | null;
  sortedConversations: Conversation[];
  
  // Actions
  setActiveConversation: (id: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  updateLastMessage: (id: string, message: Message) => void;
  incrementUnread: (id: string) => void;
  clearUnread: (id: string) => void;
}
```

#### Message Store

```typescript
// stores/messageStore.ts
interface MessageState {
  messages: Map<string, Message[]>;  // conversationId -> messages
  pendingMessages: Map<string, Message>;  // tempId -> message
  
  // Actions
  addMessage: (conversationId: string, message: Message) => void;
  addMessages: (conversationId: string, messages: Message[], prepend?: boolean) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  addPendingMessage: (message: Message) => void;
  confirmPendingMessage: (tempId: string, realMessage: Message) => void;
  failPendingMessage: (tempId: string, error: string) => void;
}
```

#### Presence Store

```typescript
// stores/presenceStore.ts
interface PresenceState {
  users: Map<string, PresenceInfo>;
  
  // Actions
  setPresence: (userId: string, info: PresenceInfo) => void;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
  isOnline: (userId: string) => boolean;
}
```

### 3.2 TanStack Query Setup

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      gcTime: 1000 * 60 * 30,    // 30 minutes (previously cacheTime)
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.status === 401) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
```

---

## 4. Real-Time Integration

### 4.1 Socket.IO Client

```typescript
// lib/socket.ts
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  
  connect() {
    const token = useAuthStore.getState().accessToken;
    
    this.socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    
    this.setupListeners();
    return this.socket;
  }
  
  private setupListeners() {
    this.socket?.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });
    
    this.socket?.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
    
    this.socket?.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
    });
  }
  
  // Typed emit methods
  sendMessage(data: SendMessagePayload) {
    return this.emit('message:send', data);
  }
  
  startTyping(conversationId: string) {
    this.socket?.emit('typing:start', { conversationId });
  }
  
  stopTyping(conversationId: string) {
    this.socket?.emit('typing:stop', { conversationId });
  }
  
  // ... more methods
  
  private emit<T>(event: string, data: T): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(event, data, (response: any) => {
        if (response.error) reject(response.error);
        else resolve(response);
      });
    });
  }
}

export const socketClient = new SocketClient();
```

### 4.2 Socket Hook

```typescript
// hooks/useSocket.ts
import { useEffect, useCallback } from 'react';
import { socketClient } from '@/lib/socket';
import { useChatStore } from '@/stores/chatStore';
import { useMessageStore } from '@/stores/messageStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useTypingStore } from '@/stores/typingStore';

export function useSocket() {
  const addMessage = useMessageStore((s) => s.addMessage);
  const updatePresence = usePresenceStore((s) => s.setPresence);
  const setTypingUsers = useTypingStore((s) => s.setTypingUsers);
  
  useEffect(() => {
    const socket = socketClient.connect();
    
    // Message events
    socket.on('message:new', (message) => {
      addMessage(message.conversationId, message);
    });
    
    socket.on('message:updated', (message) => {
      // Handle edit
    });
    
    socket.on('message:deleted', ({ conversationId, messageId }) => {
      // Handle delete
    });
    
    // Typing events
    socket.on('typing:update', ({ conversationId, users }) => {
      setTypingUsers(conversationId, users);
    });
    
    // Presence events
    socket.on('presence:change', ({ userId, status, lastSeen }) => {
      updatePresence(userId, { status, lastSeen });
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);
  
  return socketClient;
}
```

---

## 5. Component Specifications

### 5.1 MessageBubble

```typescript
// components/chat/MessageThread/MessageBubble.tsx
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showSender: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showSender,
  isFirstInGroup,
  isLastInGroup,
  onReply,
  onReact,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div
      className={cn(
        'group flex gap-2',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        !isFirstInGroup && 'mt-0.5',
        isFirstInGroup && 'mt-3'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar user={message.sender} size="sm" />
      )}
      {!showAvatar && !isOwn && <div className="w-8" />}
      
      {/* Message content */}
      <div className={cn(
        'max-w-[70%] rounded-2xl px-4 py-2',
        isOwn 
          ? 'bg-primary-500 text-white' 
          : 'bg-gray-100 dark:bg-gray-800'
      )}>
        {/* Sender name */}
        {showSender && !isOwn && (
          <p className="text-xs font-medium text-gray-500 mb-1">
            {message.sender.name}
          </p>
        )}
        
        {/* Reply preview */}
        {message.replyTo && (
          <ReplyPreview message={message.replyTo} />
        )}
        
        {/* Content based on type */}
        <MessageContent message={message} />
        
        {/* Timestamp + read receipt */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">
            {formatTime(message.createdAt)}
          </span>
          {isOwn && <ReadReceipt message={message} />}
        </div>
        
        {/* Reactions */}
        {message.reactions.length > 0 && (
          <ReactionBar reactions={message.reactions} />
        )}
      </div>
      
      {/* Actions menu */}
      {showActions && (
        <MessageActions
          message={message}
          isOwn={isOwn}
          onReply={onReply}
          onReact={onReact}
          onEdit={isOwn ? onEdit : undefined}
          onDelete={isOwn ? onDelete : undefined}
        />
      )}
    </div>
  );
}
```

### 5.2 MessageInput

```typescript
// components/chat/MessageThread/MessageInput.tsx
interface MessageInputProps {
  conversationId: string;
  replyTo?: Message | null;
  onCancelReply: () => void;
}

export function MessageInput({ 
  conversationId, 
  replyTo, 
  onCancelReply 
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { sendMessage, isLoading } = useChat();
  const { startTyping, stopTyping } = useTyping(conversationId);
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [text]);
  
  // Typing indicator
  const handleTyping = useDebouncedCallback(() => {
    stopTyping();
  }, 2000);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    startTyping();
    handleTyping();
  };
  
  const handleSubmit = async () => {
    if (!text.trim() && attachments.length === 0) return;
    
    stopTyping();
    
    await sendMessage({
      conversationId,
      type: attachments.length > 0 ? 'image' : 'text',
      content: { text: text.trim() },
      replyTo: replyTo?._id,
      attachments,
    });
    
    setText('');
    setAttachments([]);
    onCancelReply();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <div className="border-t p-4">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded">
          <span className="text-sm text-gray-500">
            Replying to {replyTo.sender.name}
          </span>
          <button onClick={onCancelReply}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <AttachmentPreview
          files={attachments}
          onRemove={(index) => {
            setAttachments(attachments.filter((_, i) => i !== index));
          }}
        />
      )}
      
      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <FileUploader onUpload={(files) => setAttachments([...attachments, ...files])}>
          <Button variant="ghost" size="icon">
            <Paperclip className="w-5 h-5" />
          </Button>
        </FileUploader>
        
        {/* Voice recorder toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsRecording(!isRecording)}
        >
          <Mic className={cn('w-5 h-5', isRecording && 'text-red-500')} />
        </Button>
        
        {/* Text input */}
        {isRecording ? (
          <VoiceRecorder
            onRecorded={(blob) => {
              // Handle voice message
              setIsRecording(false);
            }}
            onCancel={() => setIsRecording(false)}
          />
        ) : (
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-lg border p-3 max-h-32"
            rows={1}
          />
        )}
        
        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || (!text.trim() && attachments.length === 0)}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
```

### 5.3 TypingIndicator

```typescript
// components/chat/Indicators/TypingIndicator.tsx
interface TypingIndicatorProps {
  conversationId: string;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const typingUsers = useTypingStore((s) => s.getTypingUsers(conversationId));
  
  if (typingUsers.length === 0) return null;
  
  const text = typingUsers.length === 1
    ? `${typingUsers[0].name} is typing...`
    : typingUsers.length === 2
    ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`
    : `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
      </div>
      <span>{text}</span>
    </div>
  );
}
```

### 5.4 VideoGrid

```typescript
// components/video/VideoGrid.tsx
interface VideoGridProps {
  participants: CallParticipant[];
  localStream: MediaStream | null;
  screenShare: MediaStream | null;
}

export function VideoGrid({ participants, localStream, screenShare }: VideoGridProps) {
  const gridClass = useMemo(() => {
    const count = participants.length + 1; // +1 for local
    if (screenShare) return 'grid-cols-1 grid-rows-[1fr_auto]';
    if (count <= 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-3 grid-rows-2';
    return 'grid-cols-4 grid-rows-2';
  }, [participants.length, screenShare]);
  
  return (
    <div className={cn('grid gap-2 h-full p-4', gridClass)}>
      {/* Screen share (takes main area) */}
      {screenShare && (
        <div className="bg-black rounded-lg overflow-hidden">
          <video
            autoPlay
            playsInline
            ref={(el) => {
              if (el) el.srcObject = screenShare;
            }}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      {/* Participant videos */}
      <div className={cn(
        'grid gap-2',
        screenShare ? 'grid-cols-4' : gridClass
      )}>
        {/* Local video */}
        <VideoTile
          stream={localStream}
          isLocal
          isMuted
          participant={{ name: 'You' }}
        />
        
        {/* Remote participants */}
        {participants.map((participant) => (
          <VideoTile
            key={participant.id}
            stream={participant.stream}
            participant={participant}
            isMuted={participant.audioMuted}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Pages

### 6.1 Chat Page (Main Layout)

```typescript
// pages/Chat/ChatPage.tsx
export function ChatPage() {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  
  // Initialize socket connection
  useSocket();
  
  // Sync presence
  usePresenceSync();
  
  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-80 border-r flex flex-col">
          <ConversationSearch />
          <ConversationList />
        </aside>
        
        {/* Main area */}
        <main className="flex-1 flex flex-col">
          {activeConversationId ? (
            <ConversationView conversationId={activeConversationId} />
          ) : (
            <WelcomeView />
          )}
        </main>
      </div>
      
      {/* Modals */}
      <IncomingCallModal />
      <NewConversationModal />
    </AppLayout>
  );
}
```

### 6.2 Conversation View

```typescript
// pages/Chat/ConversationView.tsx
interface ConversationViewProps {
  conversationId: string;
}

export function ConversationView({ conversationId }: ConversationViewProps) {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showThread, setShowThread] = useState(false);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  
  const { data: conversation } = useConversation(conversationId);
  const { 
    messages,
    isLoading,
    hasMore,
    fetchMore,
  } = useMessages(conversationId);
  
  // Mark as read when viewing
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead(conversationId, messages[0]._id);
    }
  }, [conversationId, messages]);
  
  const handleViewThread = (message: Message) => {
    setThreadMessage(message);
    setShowThread(true);
  };
  
  return (
    <div className="flex-1 flex">
      {/* Main thread */}
      <div className="flex-1 flex flex-col">
        <ConversationHeader conversation={conversation} />
        
        <MessageThread
          messages={messages}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={fetchMore}
          onReply={setReplyTo}
          onViewThread={handleViewThread}
        />
        
        <TypingIndicator conversationId={conversationId} />
        
        <MessageInput
          conversationId={conversationId}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </div>
      
      {/* Thread panel */}
      {showThread && threadMessage && (
        <ThreadPanel
          message={threadMessage}
          onClose={() => setShowThread(false)}
        />
      )}
    </div>
  );
}
```

---

## 7. Routing

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/call/:callId" element={<CallPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<ProfileSettings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/settings/privacy" element={<PrivacySettings />} />
          </Route>
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
```

---

## 8. Performance Optimizations

### 8.1 Virtualized Lists

```typescript
// components/chat/MessageThread/MessageThread.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function MessageThread({ messages, hasMore, onLoadMore }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
    getItemKey: (index) => messages[index]._id,
  });
  
  // Load more when scrolling to top
  useEffect(() => {
    const [firstItem] = virtualizer.getVirtualItems();
    if (firstItem?.index === 0 && hasMore) {
      onLoadMore();
    }
  }, [virtualizer.getVirtualItems()]);
  
  return (
    <div ref={parentRef} className="flex-1 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <MessageBubble message={messages[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 8.2 Image Lazy Loading

```typescript
// components/chat/MessageContent/ImageContent.tsx
import { useInView } from 'react-intersection-observer';

export function ImageContent({ media }: { media: MediaAttachment }) {
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '100px',
  });
  
  return (
    <div ref={ref} className="relative">
      {/* Blurhash placeholder */}
      {!loaded && media.blurhash && (
        <Blurhash
          hash={media.blurhash}
          width={media.width}
          height={media.height}
          className="absolute inset-0"
        />
      )}
      
      {/* Actual image */}
      {inView && (
        <img
          src={media.url}
          alt=""
          onLoad={() => setLoaded(true)}
          className={cn(
            'max-w-full rounded-lg transition-opacity',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}
```

### 8.3 Memoization

```typescript
// Important memoized components
export const MessageBubble = memo(MessageBubbleComponent);
export const ConversationItem = memo(ConversationItemComponent);
export const Avatar = memo(AvatarComponent);
```

---

## 9. Accessibility

### 9.1 Keyboard Navigation

- `Tab` — Navigate between focusable elements
- `Enter` — Send message, activate buttons
- `Escape` — Close modals, cancel actions
- `Arrow Up/Down` — Navigate conversations/messages
- `Ctrl+K` — Open search

### 9.2 ARIA Labels

```tsx
<button
  aria-label="Send message"
  aria-disabled={isLoading}
  onClick={handleSend}
>
  <Send />
</button>

<div
  role="log"
  aria-label="Messages"
  aria-live="polite"
>
  {messages.map(msg => <MessageBubble key={msg._id} message={msg} />)}
</div>
```

### 9.3 Screen Reader Support

- Announce new messages
- Read receipts conveyed in text
- Typing indicators announced
- Focus management in modals

---

## 10. Testing Strategy

### 10.1 Unit Tests (Vitest)

```bash
# Run unit tests
npm run test:unit
```

Coverage targets:
- Hooks: 80%
- Stores: 90%
- Utils: 95%
- Components: 70%

### 10.2 Integration Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e
```

Test scenarios:
- User registration and login
- Send/receive messages
- Create/join conversations
- File uploads
- Video calls
- Search functionality

---

**Related Documents:**
- [PRD.md](./PRD.md) — Product requirements
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) — API details
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
