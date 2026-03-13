# Architecture Decision Record: Read Receipts Feature

**Status:** Proposed  
**Date:** 2026-03-14  
**Author:** Architect Agent  

---

## Context

ChatHub requires read receipts to show users which messages have been seen. Current state:
- **Message model**: `readBy: ObjectId[]` (per-message tracking)
- **Conversation model**: `members[].lastReadAt: Date` (timestamp-based)

**Scalability concern:** Storing 1000+ user IDs per message in large groups is expensive (storage, indexing, bandwidth).

---

## Decision: Hybrid Read Horizon Approach

**Recommended:** Use **read horizon** (`lastReadMessageId`) as primary source, with optional per-message `readBy` for DMs/small groups.

### Rationale

| Approach | DMs (2 users) | Small Groups (<20) | Large Groups (100+) |
|----------|---------------|--------------------|--------------------|
| Per-message `readBy` | ✅ Efficient | ⚠️ Acceptable | ❌ N×M storage |
| Read horizon only | ⚠️ Loses granularity | ✅ Efficient | ✅ Efficient |
| **Hybrid** | ✅ Per-message | ✅ Per-message | ✅ Horizon only |

---

## Data Model Changes

### 1. Conversation Member Schema (Primary)

```typescript
// models/Conversation.ts - Update IConversationMember
interface IConversationMember {
  userId: Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
  lastReadAt: Date;           // KEEP: fallback for timestamp queries
  lastReadMessageId?: Types.ObjectId;  // ADD: read horizon pointer
  muted: boolean;
  mutedUntil?: Date;
  nickname?: string;
}
```

### 2. Message Schema (Conditional)

```typescript
// models/Message.ts - Keep readBy but limit population
interface IMessage {
  // ... existing fields
  readBy: Types.ObjectId[];  // KEEP: only populated for DMs/small groups
  // New: computed field for display
}

// Add static method
MessageSchema.statics.shouldPopulateReadBy = (memberCount: number) => memberCount <= 20;
```

### 3. New: ReadReceipt Collection (for analytics/audit only)

```typescript
// models/ReadReceipt.ts - Optional, for detailed tracking
interface IReadReceipt {
  conversationId: Types.ObjectId;
  userId: Types.ObjectId;
  lastReadMessageId: Types.ObjectId;
  updatedAt: Date;
}

// Index: { conversationId: 1, userId: 1 } unique
// TTL index on updatedAt for cleanup (optional)
```

---

## API Contract

### REST Endpoints

```typescript
// Mark messages as read up to a specific message
POST /api/conversations/:conversationId/read
Body: { messageId: string }
Response: { success: boolean, readAt: string }

// Get read receipts for a conversation (DM/small groups)
GET /api/conversations/:conversationId/read-receipts
Response: { 
  receipts: Array<{ userId: string, lastReadMessageId: string, lastReadAt: string }>,
  strategy: 'per-message' | 'horizon'
}
```

### Socket.IO Events

```typescript
// Client → Server: Mark as read
socket.emit('message:read', { 
  conversationId: string, 
  messageId: string 
});

// Server → Clients: Broadcast read update
socket.on('message:read', { 
  conversationId: string,
  userId: string,
  userName: string,      // For display
  userAvatar?: string,
  messageId: string,     // The message they read up to
  timestamp: string
});

// For DMs only: Detailed per-message receipts
socket.on('message:read:detailed', {
  conversationId: string,
  messageId: string,     // Specific message
  readBy: Array<{ userId: string, userName: string }>
});
```

---

## Backend Implementation

### ReadReceiptService

```typescript
// services/chat/readReceipt.service.ts
export class ReadReceiptService {
  
  static async markAsRead(
    userId: string, 
    conversationId: string, 
    messageId: string
  ): Promise<void> {
    const conversation = await Conversation.findById(conversationId);
    const memberCount = conversation.members.length;
    
    // Update horizon in conversation
    await Conversation.updateOne(
      { _id: conversationId, 'members.userId': userId },
      { 
        $set: { 
          'members.$.lastReadMessageId': messageId,
          'members.$.lastReadAt': new Date()
        }
      }
    );
    
    // For small groups: also update per-message readBy
    if (memberCount <= 20) {
      await Message.updateMany(
        {
          conversationId,
          createdAt: { $lte: targetMessage.createdAt },
          readBy: { $ne: userId }
        },
        { $addToSet: { readBy: userId } }
      );
    }
    
    // Emit socket event
    emitToConversation(conversationId, 'message:read', {
      conversationId,
      userId,
      messageId,
      timestamp: new Date().toISOString()
    });
  }

  static async getReadReceipts(conversationId: string): Promise<ReadReceiptDTO[]> {
    const conversation = await Conversation.findById(conversationId)
      .populate('members.userId', 'name avatar');
    
    return conversation.members.map(m => ({
      userId: m.userId._id,
      userName: m.userId.name,
      userAvatar: m.userId.avatar,
      lastReadMessageId: m.lastReadMessageId,
      lastReadAt: m.lastReadAt
    }));
  }
}
```

---

## Frontend Design

### State Management

```typescript
// stores/chatStore.ts - Add read receipt state
interface ChatState {
  // ... existing
  readReceipts: Record<string, ReadReceipt[]>;  // by conversationId
  
  // Actions
  updateReadReceipt: (conversationId: string, receipt: ReadReceipt) => void;
  markConversationRead: (conversationId: string, messageId: string) => void;
}

// Selector for checking if message is read by user
const isMessageReadBy = (messageId: string, userId: string, receipts: ReadReceipt[]) => {
  const receipt = receipts.find(r => r.userId === userId);
  return receipt && receipt.lastReadMessageId >= messageId;
};
```

### Component Architecture

```
MessageList
├── MessageItem
│   ├── MessageContent
│   └── ReadReceiptIndicator  ← NEW
│       ├── DmReadReceipt (checkmarks: ✓ sent, ✓✓ delivered, blue ✓✓ read)
│       ├── GroupReadReceipt (avatar stack + "Seen by X")
│       └── LargeGroupReceipt ("Read" indicator only)
```

### ReadReceiptIndicator Component

```tsx
// components/chat/ReadReceiptIndicator.tsx
interface Props {
  message: Message;
  conversationType: ConversationType;
  memberCount: number;
  currentUserId: string;
}

export const ReadReceiptIndicator: React.FC<Props> = ({ 
  message, 
  conversationType,
  memberCount,
  currentUserId 
}) => {
  const receipts = useChatStore(s => s.readReceipts[message.conversationId]);
  
  // Only show for sender's own messages
  if (message.senderId._id !== currentUserId) return null;
  
  // DM: Show checkmarks
  if (conversationType === 'dm') {
    const otherUserRead = receipts?.some(
      r => r.userId !== currentUserId && 
           compareMessageIds(r.lastReadMessageId, message._id) >= 0
    );
    return <DmCheckmarks sent delivered={true} read={otherUserRead} />;
  }
  
  // Small group: Show avatar stack
  if (memberCount <= 20) {
    const readers = receipts?.filter(
      r => r.userId !== currentUserId &&
           compareMessageIds(r.lastReadMessageId, message._id) >= 0
    );
    return <AvatarStack users={readers} maxDisplay={3} />;
  }
  
  // Large group: Simple "Read" text
  const readCount = receipts?.filter(
    r => compareMessageIds(r.lastReadMessageId, message._id) >= 0
  ).length || 0;
  
  return readCount > 1 ? <span className="text-xs text-gray-500">Read</span> : null;
};
```

### Performance Optimizations

```typescript
// 1. Debounce read events (don't emit on every scroll)
const debouncedMarkRead = useMemo(
  () => debounce((messageId: string) => {
    socket.emit('message:read', { conversationId, messageId });
  }, 500),
  [conversationId]
);

// 2. Use intersection observer for visible messages
const { ref, inView } = useInView({ threshold: 0.5 });
useEffect(() => {
  if (inView && !isOwnMessage) {
    debouncedMarkRead(message._id);
  }
}, [inView]);

// 3. Memoize read receipt computation
const readReceiptData = useMemo(() => 
  computeReadReceipts(message._id, receipts),
  [message._id, receipts]
);
```

---

## Trade-offs Summary

| Aspect | Per-Message | Read Horizon | Hybrid (Recommended) |
|--------|-------------|--------------|---------------------|
| Storage | O(N×M) | O(N) | O(N) for large groups |
| Query "who read this message" | O(1) | O(N) scan | Depends on group size |
| Query "unread count" | Complex | Simple | Simple |
| Real-time updates | Fine-grained | Coarse | Adaptive |
| Migration effort | None | High | Low |

---

## Migration Strategy

1. **Phase 1**: Add `lastReadMessageId` to conversation members (non-breaking)
2. **Phase 2**: Implement read horizon API alongside existing `readBy`
3. **Phase 3**: Frontend uses horizon for display, falls back to `readBy`
4. **Phase 4**: Stop populating `readBy` for groups > 20 members
5. **Phase 5**: Backfill: compute `lastReadMessageId` from existing `readBy` data

---

## Files to Modify

| File | Changes |
|------|---------|
| `app/backend/src/models/Conversation.ts` | Add `lastReadMessageId` to member schema |
| `app/backend/src/services/chat/readReceipt.service.ts` | New service |
| `app/backend/src/routes/conversation.routes.ts` | Add read endpoints |
| `app/backend/src/config/socket.ts` | Add `message:read` handler |
| `app/frontend/src/stores/chatStore.ts` | Add `readReceipts` state |
| `app/frontend/src/types/chat.ts` | Add `ReadReceipt` type |
| `app/frontend/src/components/chat/ReadReceiptIndicator.tsx` | New component |
| `app/frontend/src/hooks/useReadReceipts.ts` | New hook |

---

## Recommendation

**Implement the Hybrid Read Horizon approach:**

1. Use `lastReadMessageId` on conversation members as the source of truth
2. Keep `readBy` array for DMs and groups ≤20 members for detailed receipts
3. Show checkmarks for DMs, avatar stacks for small groups, "Read" text for large groups
4. Debounce client-side read events to reduce server load
5. Use intersection observer for lazy read marking

This balances user experience (detailed receipts where it matters) with scalability (efficient for large groups).
