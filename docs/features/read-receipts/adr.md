# Architecture Decision Record: Read Receipts

**ADR-001:** Read Receipts Implementation  
**Status:** Accepted  
**Date:** 2026-03-14  
**Owner:** Architect Agent  

---

## Context

The chat application needs read receipt functionality to show users when their messages have been delivered and read. This is a standard feature in modern messaging platforms.

## Decision

### Architecture Approach

1. **Separate Collection**: Store read receipts in dedicated `read_receipts` collection (already exists in schema)
2. **Real-time via Socket.IO**: Use existing Socket.IO infrastructure for instant updates
3. **Optimistic UI**: Show pending status immediately, confirm via server response
4. **Privacy-Respecting**: Honor user privacy settings in all read receipt operations

### Component Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   API Gateway    │────▶│   Read Receipt  │
│   Components    │     │   (Express)      │     │   Service       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   State Store   │     │   Socket.IO      │     │   MongoDB       │
│   (Zustand)     │◀────│   (Real-time)    │◀────│   read_receipts │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Data Flow

#### Sending Read Receipt
1. User views message in UI
2. Frontend calls `socket.emit('message:read', { messageId })`
3. Socket handler validates user is participant
4. Check sender's privacy settings (if receipts disabled, skip)
5. Create/update ReadReceipt document
6. Emit `receipt:read` to message sender's devices
7. For groups, emit `receipt:readCount` to all participants

#### Fetching Read Receipts
1. User taps "Read by X" on group message
2. Frontend calls `GET /messages/:id/receipts`
3. API returns list with user info (respecting privacy)
4. UI displays read receipt list modal

### Privacy Implementation

Privacy is **bidirectional**:
- If User A has read receipts disabled: A's reads are not reported, AND A cannot see others' read receipts
- This prevents asymmetric information

```typescript
// Privacy check pseudocode
const canSeeReceipts = sender.settings.privacy.readReceipts 
                    && reader.settings.privacy.readReceipts;
```

## Alternatives Considered

### 1. Embed receipts in Message document
- **Pros**: Single read for message + receipts
- **Cons**: Unbounded array growth in groups, write contention
- **Decision**: Rejected

### 2. Redis-only storage
- **Pros**: Fast writes, built-in TTL
- **Cons**: Data loss on restart, complex persistence
- **Decision**: Rejected

### 3. Polling instead of WebSocket
- **Pros**: Simpler server implementation
- **Cons**: Higher latency, more bandwidth, worse UX
- **Decision**: Rejected

## Consequences

### Positive
- Clean separation of concerns
- Scalable with existing infrastructure
- Real-time experience
- Privacy-preserving

### Negative
- Additional database writes per read
- Slight latency for read receipt delivery
- Storage growth (mitigated by TTL)

### Risks
- High write volume in active groups
- Mitigation: Batch writes, consider write-behind cache

## Implementation Notes

1. Use existing `read_receipts` collection from DATABASE_SCHEMA.md
2. Leverage existing Socket.IO setup for real-time
3. Add TTL index for automatic cleanup (90 days)
4. Implement rate limiting to prevent abuse
