# ChatHub - Database Schema

**Version:** 1.0  
**Date:** March 13, 2026  
**Database:** MongoDB 7.x  

---

## 1. Overview

### 1.1 Collections

| Collection | Purpose | Estimated Size (100k users) |
|------------|---------|----------------------------|
| `users` | User accounts (existing) | ~500MB |
| `conversations` | Chat conversations | ~100MB |
| `messages` | Chat messages | ~50GB/year |
| `presence` | User online status | ~10MB |
| `encryption_keys` | E2E encryption keys | ~200MB |
| `read_receipts` | Message read status | ~5GB/year |
| `media_metadata` | File/image metadata | ~1GB |
| `push_subscriptions` | Web push endpoints | ~50MB |

### 1.2 Relationships

```
users (1) ──────────── (N) conversations.members
  │
  └──── (1) ──────────── (N) messages.senderId
  │
  └──── (1) ──────────── (1) presence.userId
  │
  └──── (1) ──────────── (1) encryption_keys.userId

conversations (1) ──── (N) messages.conversationId
```

---

## 2. Collection Schemas

### 2.1 Users (Extended)

Extends existing User model with chat-specific fields.

```typescript
// models/User.ts (extended)
interface User {
  _id: ObjectId;
  
  // Existing fields
  name: string;
  email: string;
  password: string;              // bcrypt hashed
  role: 'user' | 'admin';
  
  // New chat fields
  username: string;              // Unique, for @mentions
  avatar?: string;               // URL to avatar image
  status: {
    type: 'online' | 'away' | 'busy' | 'offline';
    customMessage?: string;      // "In a meeting"
    updatedAt: Date;
  };
  settings: {
    notifications: {
      enabled: boolean;
      sound: boolean;
      desktop: boolean;
      mentionsOnly: boolean;
    };
    privacy: {
      readReceipts: boolean;     // Show read receipts
      typingIndicators: boolean; // Show typing
      lastSeen: 'everyone' | 'contacts' | 'nobody';
    };
    theme: 'light' | 'dark' | 'system';
  };
  contacts: ObjectId[];          // User IDs of contacts
  blockedUsers: ObjectId[];      // Blocked user IDs
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ email: 1 }           // unique
{ username: 1 }        // unique
{ 'status.type': 1 }   // presence queries
```

### 2.2 Conversations

```typescript
interface Conversation {
  _id: ObjectId;
  
  type: 'dm' | 'group' | 'channel';
  
  // For groups and channels
  name?: string;
  description?: string;
  avatar?: string;
  
  // Channel-specific
  isPublic?: boolean;            // true = anyone can join
  topic?: string;                // Channel topic
  
  members: Array<{
    userId: ObjectId;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
    lastReadAt: Date;            // For unread counts
    muted: boolean;
    mutedUntil?: Date;
    nickname?: string;           // Display name override
  }>;
  
  // DM-specific: store both user IDs for efficient lookup
  dmParticipants?: [ObjectId, ObjectId];
  
  settings: {
    encrypted: boolean;          // E2E encryption enabled
    messageRetention?: number;   // Days to keep (null = forever)
    membersCanInvite: boolean;
    slowMode?: number;           // Seconds between messages
  };
  
  // Denormalized for list performance
  lastMessage?: {
    _id: ObjectId;
    senderId: ObjectId;
    senderName: string;
    content: string;             // Truncated preview
    type: MessageType;
    timestamp: Date;
  };
  
  pinnedMessages: ObjectId[];    // Message IDs
  
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ 'members.userId': 1 }                           // Find user's conversations
{ dmParticipants: 1 }                             // Find existing DM
{ type: 1, isPublic: 1 }                          // Channel discovery
{ 'lastMessage.timestamp': -1 }                   // Sort by recent
{ createdAt: 1 }, { expireAfterSeconds: 0 }       // TTL for temp convos
```

### 2.3 Messages

```typescript
type MessageType = 
  | 'text' 
  | 'image' 
  | 'file' 
  | 'voice' 
  | 'video'
  | 'system'     // "User joined", "User left"
  | 'call';      // Call started/ended

interface Message {
  _id: ObjectId;
  conversationId: ObjectId;
  senderId: ObjectId;
  
  type: MessageType;
  
  content: {
    text?: string;               // Plain text or markdown
    encrypted?: string;          // Base64 encrypted payload
    iv?: string;                 // Initialization vector
    
    // For system messages
    systemAction?: 'member_added' | 'member_removed' | 'name_changed' | 'call_started' | 'call_ended';
    systemData?: Record<string, any>;
  };
  
  // Media attachments
  media?: Array<{
    _id: ObjectId;
    type: 'image' | 'file' | 'voice' | 'video';
    url: string;                 // MinIO/S3 URL
    filename: string;
    mimeType: string;
    size: number;                // Bytes
    
    // Image-specific
    width?: number;
    height?: number;
    thumbnail?: string;          // Thumbnail URL
    blurhash?: string;           // Placeholder hash
    
    // Voice-specific
    duration?: number;           // Seconds
    waveform?: number[];         // Amplitude samples
  }>;
  
  // Link previews
  linkPreviews?: Array<{
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  }>;
  
  // Threading
  replyTo?: {
    messageId: ObjectId;
    senderId: ObjectId;
    senderName: string;
    preview: string;             // Truncated content
  };
  threadRoot?: ObjectId;         // If this starts a thread
  threadCount?: number;          // Replies count
  
  // Reactions
  reactions: Array<{
    emoji: string;               // Unicode or shortcode
    userIds: ObjectId[];
    count: number;               // Denormalized
  }>;
  
  // Mentions
  mentions: {
    users: ObjectId[];           // @user mentions
    everyone: boolean;           // @everyone
    here: boolean;               // @here (online users)
  };
  
  // Status
  editedAt?: Date;
  deletedAt?: Date;              // Soft delete
  deletedBy?: ObjectId;
  
  // Encryption metadata
  encryptionVersion?: number;
  
  createdAt: Date;
}

// Indexes
{ conversationId: 1, createdAt: -1 }              // Message history
{ conversationId: 1, _id: -1 }                    // Cursor pagination
{ senderId: 1, createdAt: -1 }                    // User's messages
{ 'replyTo.messageId': 1 }                        // Thread messages
{ threadRoot: 1, createdAt: 1 }                   // Thread view
{ 'mentions.users': 1, createdAt: -1 }            // Mention notifications
{ createdAt: 1 }, { expireAfterSeconds: 86400*365 } // Optional TTL (1 year)

// Text search index (if not using Elasticsearch)
{ 'content.text': 'text' }
```

### 2.4 Read Receipts

Separate collection for scalability.

```typescript
interface ReadReceipt {
  _id: ObjectId;
  
  messageId: ObjectId;
  conversationId: ObjectId;      // Denormalized for queries
  userId: ObjectId;
  
  readAt: Date;
  
  // For delivery receipts
  deliveredAt?: Date;
}

// Indexes
{ messageId: 1, userId: 1 }      // unique compound
{ conversationId: 1, userId: 1, readAt: -1 }  // Unread count
{ userId: 1, readAt: -1 }        // User's read history
```

### 2.5 Presence

Redis is primary, MongoDB for persistence.

```typescript
interface Presence {
  _id: ObjectId;
  
  userId: ObjectId;              // unique
  
  status: 'online' | 'away' | 'busy' | 'offline';
  customMessage?: string;
  
  lastSeen: Date;
  
  // Multi-device support
  connections: Array<{
    socketId: string;
    device: 'web' | 'mobile' | 'desktop';
    userAgent?: string;
    connectedAt: Date;
    lastActiveAt: Date;
  }>;
  
  updatedAt: Date;
}

// Indexes
{ userId: 1 }                    // unique
{ status: 1 }                    // Online users
{ lastSeen: -1 }                 // Recent users
```

### 2.6 Encryption Keys

Signal Protocol key storage.

```typescript
interface EncryptionKeys {
  _id: ObjectId;
  
  userId: ObjectId;              // unique
  
  // Identity key (long-term, changes = new device)
  identityKey: {
    public: string;              // Base64
    // Private key stored client-side only!
  };
  
  // Signed pre-key (medium-term, rotated monthly)
  signedPreKey: {
    keyId: number;
    public: string;
    signature: string;           // Signed by identity key
    createdAt: Date;
  };
  
  // One-time pre-keys (consumed on first message)
  oneTimePreKeys: Array<{
    keyId: number;
    public: string;
  }>;
  
  // Key rotation tracking
  lastKeyRotation: Date;
  keyRotationCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ userId: 1 }                    // unique
{ 'oneTimePreKeys.keyId': 1 }    // Fast lookup
```

### 2.7 Media Metadata

```typescript
interface MediaMetadata {
  _id: ObjectId;
  
  uploaderId: ObjectId;
  conversationId?: ObjectId;     // null for profile pics
  messageId?: ObjectId;
  
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  
  // Storage location
  bucket: string;
  key: string;                   // S3/MinIO key
  url: string;                   // Public URL
  
  // Processing status
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  
  // Image processing results
  processing?: {
    thumbnail?: {
      key: string;
      url: string;
      width: number;
      height: number;
    };
    optimized?: {
      key: string;
      url: string;
      width: number;
      height: number;
    };
    blurhash?: string;
  };
  
  // Virus scan
  scanStatus?: 'pending' | 'clean' | 'infected';
  scanResult?: string;
  
  // Access control
  accessLevel: 'public' | 'conversation' | 'private';
  
  createdAt: Date;
  expiresAt?: Date;              // Temporary uploads
}

// Indexes
{ uploaderId: 1, createdAt: -1 }
{ conversationId: 1 }
{ messageId: 1 }
{ status: 1 }
{ expiresAt: 1 }, { expireAfterSeconds: 0 }   // TTL
```

### 2.8 Push Subscriptions

Web Push notifications.

```typescript
interface PushSubscription {
  _id: ObjectId;
  
  userId: ObjectId;
  
  // Web Push subscription object
  subscription: {
    endpoint: string;
    expirationTime?: number;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  
  // Device info
  device: {
    type: 'web' | 'mobile' | 'desktop';
    browser?: string;
    os?: string;
    userAgent?: string;
  };
  
  // Notification preferences per subscription
  settings: {
    enabled: boolean;
    dms: boolean;
    mentions: boolean;
    groups: boolean;
    channels: boolean;
  };
  
  lastUsed: Date;
  failureCount: number;          // Remove after N failures
  
  createdAt: Date;
}

// Indexes
{ userId: 1 }
{ 'subscription.endpoint': 1 }   // unique
{ failureCount: 1, lastUsed: 1 } // Cleanup old/failed
```

### 2.9 Call History

```typescript
interface Call {
  _id: ObjectId;
  
  conversationId: ObjectId;
  initiatorId: ObjectId;
  
  type: 'audio' | 'video';
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  
  participants: Array<{
    userId: ObjectId;
    joinedAt?: Date;
    leftAt?: Date;
    duration?: number;           // Seconds
    role: 'initiator' | 'participant';
  }>;
  
  // mediasoup room info
  roomId: string;
  
  // Stats
  maxParticipants: number;
  totalDuration: number;         // Seconds
  
  startedAt: Date;
  endedAt?: Date;
  
  // End reason
  endReason?: 'completed' | 'declined' | 'missed' | 'failed' | 'busy';
}

// Indexes
{ conversationId: 1, startedAt: -1 }
{ initiatorId: 1, startedAt: -1 }
{ 'participants.userId': 1, startedAt: -1 }
{ status: 1, startedAt: -1 }
```

---

## 3. Redis Schemas

### 3.1 Presence (Primary Storage)

```
Key: presence:{userId}
Type: Hash
Fields:
  - status: "online" | "away" | "busy" | "offline"
  - customMessage: string
  - lastActive: timestamp
  - socketIds: JSON array of socket IDs
TTL: 300 seconds (refresh on activity)

Key: socket:{socketId}
Type: String
Value: userId
TTL: 300 seconds
```

### 3.2 Typing Indicators

```
Key: typing:{conversationId}
Type: Sorted Set
Members: userId
Score: timestamp
TTL: 10 seconds (auto-expire old entries)
```

### 3.3 Rate Limiting

```
Key: ratelimit:{type}:{identifier}
Type: String (counter)
Value: request count
TTL: window duration
```

### 3.4 Session Cache

```
Key: session:{sessionId}
Type: Hash
Fields:
  - userId
  - email
  - role
  - createdAt
TTL: 7 days
```

### 3.5 Unread Counts

```
Key: unread:{userId}:{conversationId}
Type: String (counter)
Value: unread message count
No TTL (cleared on read)
```

---

## 4. Elasticsearch Indices

### 4.1 Messages Index

```json
{
  "mappings": {
    "properties": {
      "conversationId": { "type": "keyword" },
      "senderId": { "type": "keyword" },
      "senderName": { "type": "text" },
      "content": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "exact": { "type": "keyword" }
        }
      },
      "type": { "type": "keyword" },
      "mentions": { "type": "keyword" },
      "hasMedia": { "type": "boolean" },
      "mediaTypes": { "type": "keyword" },
      "createdAt": { "type": "date" },
      "deleted": { "type": "boolean" }
    }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
```

### 4.2 Users Index

```json
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "username": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "email": { "type": "keyword" }
    }
  }
}
```

---

## 5. Data Lifecycle

### 5.1 Retention Policies

| Data | Default Retention | Configurable |
|------|------------------|--------------|
| Messages | Forever | Yes (per conversation) |
| Read receipts | 90 days | No |
| Presence history | 30 days | No |
| Media files | Forever | Yes |
| Call history | 1 year | No |
| Audit logs | 2 years | No |

### 5.2 Soft Deletes

Messages use soft delete for:
- "Delete for everyone" feature
- Compliance/audit requirements
- Data recovery

```typescript
// Soft deleted message
{
  deletedAt: new Date(),
  deletedBy: userId,
  content: { text: null }  // Content cleared
}
```

### 5.3 Hard Deletes (GDPR)

User data deletion:
1. Remove from `users`
2. Anonymize messages (`senderId` → "Deleted User")
3. Remove from `encryption_keys`
4. Remove from `presence`
5. Remove from `push_subscriptions`
6. Remove media files

---

## 6. Migration Scripts

### 6.1 Initial Setup

```javascript
// migrations/001_chat_collections.js
db.createCollection('conversations');
db.createCollection('messages');
db.createCollection('presence');
db.createCollection('encryption_keys');
db.createCollection('read_receipts');
db.createCollection('media_metadata');
db.createCollection('push_subscriptions');
db.createCollection('calls');

// Create indexes (see each schema above)
```

### 6.2 User Schema Extension

```javascript
// migrations/002_extend_users.js
db.users.updateMany(
  {},
  {
    $set: {
      username: null,  // Will be set by user
      avatar: null,
      status: {
        type: 'offline',
        updatedAt: new Date()
      },
      settings: {
        notifications: {
          enabled: true,
          sound: true,
          desktop: true,
          mentionsOnly: false
        },
        privacy: {
          readReceipts: true,
          typingIndicators: true,
          lastSeen: 'everyone'
        },
        theme: 'system'
      },
      contacts: [],
      blockedUsers: []
    }
  }
);

db.users.createIndex({ username: 1 }, { unique: true, sparse: true });
```

---

## 7. Performance Considerations

### 7.1 Query Patterns

| Query | Index Used | Expected Performance |
|-------|------------|---------------------|
| User's conversations | `members.userId` | <10ms |
| Conversation messages | `conversationId, createdAt` | <20ms |
| Unread count | `conversationId, userId, readAt` | <5ms |
| User search | Elasticsearch | <50ms |
| Message search | Elasticsearch | <100ms |

### 7.2 Pagination

All list queries use cursor-based pagination:

```typescript
// Messages pagination
const messages = await Message.find({
  conversationId,
  _id: { $lt: cursor }  // Cursor = last message ID
})
.sort({ _id: -1 })
.limit(50);
```

### 7.3 Sharding Strategy (Future)

When single MongoDB instance is insufficient:

| Collection | Shard Key | Reason |
|------------|-----------|--------|
| `messages` | `{ conversationId: 'hashed' }` | Even distribution, locality |
| `read_receipts` | `{ conversationId: 'hashed' }` | Same as messages |
| `media_metadata` | `{ _id: 'hashed' }` | Random distribution |

---

**Related Documents:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) — API details
