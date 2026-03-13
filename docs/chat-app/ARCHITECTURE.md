# ChatHub - Technical Architecture

**Version:** 1.0  
**Date:** March 13, 2026  

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Web Browser │  │  Mobile Web  │  │   Desktop    │  │  Future Apps │    │
│  │   (React)    │  │   (React)    │  │   (Electron) │  │  (RN/Native) │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼──────────────────┼──────────────────┼──────────────────┼──────────┘
          │                  │                  │                  │
          └──────────────────┼──────────────────┼──────────────────┘
                             │                  │
                    ┌────────▼──────────────────▼────────┐
                    │         LOAD BALANCER              │
                    │      (NGINX / HAProxy / ALB)       │
                    │   HTTP/HTTPS + WebSocket Upgrade   │
                    └────────────────┬───────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
   ┌──────▼──────┐           ┌───────▼──────┐          ┌───────▼──────┐
   │  API Pod 1  │           │  API Pod 2   │          │  API Pod N   │
   │ ┌─────────┐ │           │ ┌─────────┐  │          │ ┌─────────┐  │
   │ │ Express │ │           │ │ Express │  │          │ │ Express │  │
   │ │   API   │ │           │ │   API   │  │          │ │   API   │  │
   │ └─────────┘ │           │ └─────────┘  │          │ └─────────┘  │
   │ ┌─────────┐ │           │ ┌─────────┐  │          │ ┌─────────┐  │
   │ │Socket.IO│ │           │ │Socket.IO│  │          │ │Socket.IO│  │
   │ │ Server  │ │           │ │ Server  │  │          │ │ Server  │  │
   │ └─────────┘ │           │ └─────────┘  │          │ └─────────┘  │
   └──────┬──────┘           └───────┬──────┘          └───────┬──────┘
          │                          │                          │
          └──────────────────────────┼──────────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │         REDIS CLUSTER           │
                    │   ┌─────────────────────────┐   │
                    │   │  Pub/Sub (Socket.IO     │   │
                    │   │  Adapter for scaling)   │   │
                    │   ├─────────────────────────┤   │
                    │   │  Session Cache          │   │
                    │   ├─────────────────────────┤   │
                    │   │  Presence Store         │   │
                    │   ├─────────────────────────┤   │
                    │   │  Rate Limiting          │   │
                    │   └─────────────────────────┘   │
                    └────────────────┬────────────────┘
                                     │
     ┌───────────────────────────────┼───────────────────────────────┐
     │                               │                               │
┌────▼─────┐                  ┌──────▼──────┐                 ┌──────▼──────┐
│ MongoDB  │                  │   MinIO/S3  │                 │Elasticsearch│
│ Cluster  │                  │   (Files)   │                 │  (Search)   │
│          │                  │             │                 │             │
│ Primary  │                  │ ┌─────────┐ │                 │ ┌─────────┐ │
│ Secondary│                  │ │ Buckets │ │                 │ │ Indices │ │
│ Secondary│                  │ │-messages│ │                 │ │-messages│ │
│          │                  │ │-avatars │ │                 │ │-users   │ │
│          │                  │ │-files   │ │                 │ └─────────┘ │
└──────────┘                  │ └─────────┘ │                 └─────────────┘
                              └─────────────┘

                    ┌────────────────────────────────┐
                    │        MEDIASOUP SFU           │
                    │    (Video/Audio Calls)         │
                    │                                │
                    │  ┌────────┐  ┌────────┐       │
                    │  │ Worker │  │ Worker │  ...  │
                    │  └────────┘  └────────┘       │
                    └────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.x | UI components |
| | TypeScript | 5.x | Type safety |
| | Vite | 5.x | Build tooling |
| | Zustand | 4.x | State management |
| | TanStack Query | 5.x | Server state |
| | Socket.IO Client | 4.x | Real-time |
| | Tailwind CSS | 3.x | Styling |
| **Backend** | Node.js | 20.x LTS | Runtime |
| | Express.js | 4.x | HTTP server |
| | Socket.IO | 4.x | WebSocket server |
| | Mongoose | 8.x | MongoDB ODM |
| | Zod | 3.x | Validation |
| **Database** | MongoDB | 7.x | Primary datastore |
| | Redis | 7.x | Cache, pub/sub |
| | Elasticsearch | 8.x | Full-text search |
| **Storage** | MinIO | Latest | S3-compatible storage |
| **Video** | mediasoup | 3.x | WebRTC SFU |
| **Security** | libsignal | Latest | E2E encryption |

---

## 2. Component Architecture

### 2.1 Backend Services

```
app/backend/src/
├── app.ts                    # Express app setup
├── server.ts                 # HTTP + Socket.IO server
├── config/
│   ├── database.ts           # MongoDB connection
│   ├── redis.ts              # Redis connection
│   ├── socket.ts             # Socket.IO configuration
│   ├── elasticsearch.ts      # Search client
│   └── minio.ts              # S3 client
├── models/
│   ├── User.ts               # (existing)
│   ├── Conversation.ts       # Chat conversations
│   ├── Message.ts            # Chat messages
│   ├── Presence.ts           # User presence
│   └── EncryptionKey.ts      # E2E encryption keys
├── controllers/
│   ├── conversation.controller.ts
│   ├── message.controller.ts
│   ├── media.controller.ts
│   ├── search.controller.ts
│   └── call.controller.ts
├── services/
│   ├── chat/
│   │   ├── conversationService.ts
│   │   ├── messageService.ts
│   │   └── notificationService.ts
│   ├── socket/
│   │   ├── socketManager.ts      # Connection management
│   │   ├── messageHandler.ts     # Message events
│   │   ├── presenceHandler.ts    # Presence events
│   │   ├── typingHandler.ts      # Typing indicators
│   │   └── callHandler.ts        # Call signaling
│   ├── media/
│   │   ├── uploadService.ts      # File uploads
│   │   ├── imageService.ts       # Image processing
│   │   └── voiceService.ts       # Voice processing
│   ├── search/
│   │   └── searchService.ts      # Elasticsearch
│   └── encryption/
│       ├── keyService.ts         # Key management
│       └── signalService.ts      # Signal Protocol
├── routes/
│   ├── conversation.routes.ts
│   ├── message.routes.ts
│   ├── media.routes.ts
│   ├── search.routes.ts
│   └── call.routes.ts
├── middleware/
│   ├── auth.ts                   # JWT auth (existing)
│   ├── socketAuth.ts             # Socket auth
│   ├── rateLimiter.ts            # Rate limiting
│   └── fileUpload.ts             # Multer config
└── utils/
    ├── AppError.ts               # (existing)
    └── asyncHandler.ts           # (existing)
```

### 2.2 Frontend Architecture

```
app/frontend/src/
├── App.tsx
├── main.tsx
├── pages/
│   ├── Chat/
│   │   ├── ChatPage.tsx          # Main chat view
│   │   ├── ConversationList.tsx  # Sidebar
│   │   └── MessageThread.tsx     # Message area
│   └── VideoCall/
│       └── CallPage.tsx          # Video call UI
├── components/
│   ├── chat/
│   │   ├── ConversationItem.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── ReadReceipt.tsx
│   │   ├── ReactionPicker.tsx
│   │   ├── ThreadView.tsx
│   │   └── SearchBar.tsx
│   ├── media/
│   │   ├── ImagePreview.tsx
│   │   ├── FileAttachment.tsx
│   │   ├── VoiceRecorder.tsx
│   │   └── VoicePlayer.tsx
│   ├── video/
│   │   ├── VideoGrid.tsx
│   │   ├── LocalVideo.tsx
│   │   ├── RemoteVideo.tsx
│   │   ├── CallControls.tsx
│   │   └── ScreenShare.tsx
│   └── presence/
│       ├── PresenceIndicator.tsx
│       └── UserStatus.tsx
├── hooks/
│   ├── useSocket.ts              # Socket.IO connection
│   ├── useChat.ts                # Chat operations
│   ├── useMessages.ts            # Message queries
│   ├── usePresence.ts            # Presence tracking
│   ├── useTyping.ts              # Typing indicators
│   ├── useVideoCall.ts           # WebRTC calls
│   └── useEncryption.ts          # E2E encryption
├── stores/
│   ├── chatStore.ts              # Conversations state
│   ├── messageStore.ts           # Messages state
│   ├── presenceStore.ts          # Online users
│   └── callStore.ts              # Active calls
├── lib/
│   ├── api.ts                    # (existing)
│   ├── socket.ts                 # Socket.IO client
│   ├── encryption.ts             # Signal Protocol
│   └── webrtc.ts                 # WebRTC utilities
└── types/
    ├── chat.ts                   # Chat types
    ├── message.ts                # Message types
    └── call.ts                   # Call types
```

---

## 3. Data Flow

### 3.1 Message Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Sender  │────▶│ Socket.IO│────▶│  Redis   │────▶│Socket.IO │────▶│ Receiver │
│  Client  │     │  Server  │     │  Pub/Sub │     │  Server  │     │  Client  │
└──────────┘     └────┬─────┘     └──────────┘     └──────────┘     └──────────┘
                      │
                      ▼
                ┌──────────┐
                │ MongoDB  │
                │ (persist)│
                └──────────┘
```

**Sequence:**
1. Sender emits `message:send` via Socket.IO
2. Server validates and stores message in MongoDB
3. Server publishes to Redis channel for conversation
4. All API pods subscribed to channel receive event
5. Each pod emits to connected clients in that conversation
6. Receivers get `message:new` event

### 3.2 Presence Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ Socket.IO│────▶│  Redis   │
│ connect  │     │  Server  │     │ SETEX    │
└──────────┘     └──────────┘     │ (TTL)    │
                                  └──────────┘
                                       │
      ┌────────────────────────────────┼────────────────────────────────┐
      │                                │                                │
      ▼                                ▼                                ▼
┌───────────┐                   ┌───────────┐                   ┌───────────┐
│ Friend 1  │◀── presence:      │ Friend 2  │◀── presence:      │ Friend N  │
│           │    update         │           │    update         │           │
└───────────┘                   └───────────┘                   └───────────┘
```

**Presence States:**
- `online` — Active WebSocket connection
- `away` — Connected but idle >5 minutes
- `offline` — No connection, show last seen

### 3.3 File Upload Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   API    │────▶│  MinIO   │────▶│ MongoDB  │
│  Upload  │     │  Server  │     │  Store   │     │ (URL)    │
└──────────┘     └────┬─────┘     └──────────┘     └──────────┘
                      │
                      ▼
                ┌──────────┐
                │  Image   │
                │ Process  │ (if image: thumbnail, compress)
                └──────────┘
```

### 3.4 Video Call Flow (WebRTC)

```
┌────────────────────────────────────────────────────────────────────────┐
│                           SIGNALING (Socket.IO)                         │
└────────────────────────────────────────────────────────────────────────┘
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      │                              │                              │
      ▼                              ▼                              ▼
┌───────────┐                 ┌─────────────┐                ┌───────────┐
│ Caller    │◀───────────────▶│  mediasoup  │◀──────────────▶│ Callee    │
│ (WebRTC)  │     media       │     SFU     │     media      │ (WebRTC)  │
└───────────┘                 └─────────────┘                └───────────┘

Signaling Events:
  call:initiate  → Start call
  call:offer     → SDP offer
  call:answer    → SDP answer
  call:ice       → ICE candidates
  call:join      → Join room (group)
  call:leave     → Leave call
```

---

## 4. Scaling Strategy

### 4.1 Horizontal Scaling

| Component | Strategy | Details |
|-----------|----------|---------|
| API/Socket servers | Add pods | Stateless, Redis for state |
| MongoDB | Replica set | 1 primary + 2 secondaries |
| Redis | Cluster | 3 masters + 3 replicas |
| Elasticsearch | Cluster | 3 nodes minimum |
| MinIO | Distributed | 4+ nodes for HA |
| mediasoup | Add workers | 1 worker per CPU core |

### 4.2 Connection Distribution

```
10,000 concurrent connections
÷ 4 API pods (initially)
= 2,500 connections per pod

Socket.IO Redis Adapter enables:
- Messages route to any pod
- Presence syncs across pods
- Rooms work across pods
```

### 4.3 Database Sharding (Future)

When messages exceed single-node capacity:

```
Shard Key: conversationId (hashed)

Benefits:
- Conversation messages stay together
- Even distribution across shards
- Range queries within conversation
```

---

## 5. Security Architecture

### 5.1 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   API    │────▶│ MongoDB  │
│  Login   │     │  /auth   │     │  User    │
└──────────┘     └────┬─────┘     └──────────┘
                      │
                      ▼
                ┌──────────┐
                │   JWT    │
                │ (15min)  │──────────────────────────┐
                └──────────┘                          │
                      │                               │
                      ▼                               ▼
                ┌──────────┐                   ┌──────────┐
                │ Refresh  │                   │ Socket   │
                │  Token   │                   │   Auth   │
                │ (7 days) │                   │ (query)  │
                └──────────┘                   └──────────┘
```

### 5.2 E2E Encryption (Signal Protocol)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        KEY EXCHANGE (X3DH)                          │
└─────────────────────────────────────────────────────────────────────┘

User Registration:
1. Generate Identity Key Pair (long-term)
2. Generate Signed Pre-Key (medium-term)
3. Generate One-Time Pre-Keys (single use)
4. Upload public keys to server

┌──────────┐                                           ┌──────────┐
│  Alice   │                                           │   Bob    │
└────┬─────┘                                           └────┬─────┘
     │                                                      │
     │  1. Fetch Bob's key bundle                          │
     │ ─────────────────────────────────────────────────▶  │
     │                                                      │
     │  2. Perform X3DH, derive shared secret              │
     │                                                      │
     │  3. Send initial message with ephemeral key         │
     │ ─────────────────────────────────────────────────▶  │
     │                                                      │
     │                    4. Bob derives same secret       │
     │                       using X3DH                    │
     │                                                      │
     │  5. Double Ratchet for ongoing messages             │
     │ ◀────────────────────────────────────────────────▶ │
     │                                                      │

Message Encryption:
- AES-256-GCM for message content
- New key per message (Double Ratchet)
- Forward secrecy: past keys unrecoverable
```

### 5.3 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth (login/register) | 5 requests | 15 minutes |
| Message send | 60 messages | 1 minute |
| File upload | 20 files | 1 hour |
| Search | 30 queries | 1 minute |
| API general | 100 requests | 1 minute |

---

## 6. Caching Strategy

### 6.1 Redis Cache Layers

| Data | TTL | Purpose |
|------|-----|---------|
| User sessions | 7 days | JWT validation |
| User presence | 60s | Online status |
| Conversation metadata | 5 min | Quick lookups |
| Unread counts | 30s | Badge counts |
| Rate limit counters | Variable | Abuse prevention |

### 6.2 Client-Side Caching

| Data | Strategy | Tool |
|------|----------|------|
| Messages | Infinite query | TanStack Query |
| Conversations | Stale-while-revalidate | TanStack Query |
| User profiles | Cache + invalidate | Zustand |
| Presence | Real-time updates | Socket events |

---

## 7. Error Handling

### 7.1 Error Response Format

```json
{
  "status": "error",
  "code": "CONVERSATION_NOT_FOUND",
  "message": "The requested conversation does not exist",
  "details": {
    "conversationId": "abc123"
  },
  "requestId": "req_xyz789"
}
```

### 7.2 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_REQUIRED` | 401 | Missing or invalid token |
| `AUTH_EXPIRED` | 401 | Token expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### 7.3 Socket Error Events

```typescript
socket.on('error', (error: SocketError) => {
  // { code: 'MESSAGE_FAILED', message: string, data?: any }
});
```

---

## 8. Monitoring & Observability

### 8.1 Metrics (Prometheus)

| Metric | Type | Description |
|--------|------|-------------|
| `chat_messages_total` | Counter | Total messages sent |
| `chat_connections_active` | Gauge | Current WebSocket connections |
| `chat_message_latency_ms` | Histogram | Message delivery time |
| `chat_api_requests_total` | Counter | API requests by endpoint |
| `chat_api_latency_ms` | Histogram | API response time |

### 8.2 Logging (Structured JSON)

```json
{
  "timestamp": "2026-03-13T10:30:00Z",
  "level": "info",
  "service": "chat-api",
  "event": "message_sent",
  "userId": "user_123",
  "conversationId": "conv_456",
  "messageId": "msg_789",
  "duration_ms": 45,
  "requestId": "req_abc"
}
```

### 8.3 Tracing (OpenTelemetry)

- Distributed traces across services
- Correlation IDs for request tracking
- Jaeger/Zipkin compatible

---

## 9. Deployment Environments

### 9.1 Local Development

```yaml
# docker-compose.dev.yml
services:
  backend:
    build: ./app/backend
    ports: ["3001:3001"]
    volumes: ["./app/backend:/app"]
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/chathub
      - REDIS_URL=redis://redis:6379
      
  frontend:
    build: ./app/frontend
    ports: ["5173:5173"]
    volumes: ["./app/frontend:/app"]
    
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongodb_data:/data/db"]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  minio:
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"
    
  elasticsearch:
    image: elasticsearch:8.11.0
    ports: ["9200:9200"]
    environment:
      - discovery.type=single-node
```

### 9.2 Cloud Production

See [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) for:
- Kubernetes manifests
- Terraform configurations
- CI/CD pipelines
- Monitoring setup

---

## 10. API Integration Points

### 10.1 REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/conversations` | List user's conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/:id/messages` | Get messages |
| POST | `/api/conversations/:id/messages` | Send message (REST fallback) |
| POST | `/api/media/upload` | Upload file |
| GET | `/api/search` | Search messages |

### 10.2 Socket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `message:send` | Client → Server | Send message |
| `message:new` | Server → Client | New message |
| `message:read` | Client → Server | Mark as read |
| `typing:start` | Client → Server | Start typing |
| `typing:stop` | Client → Server | Stop typing |
| `typing:update` | Server → Client | Typing users |
| `presence:update` | Server → Client | User status change |
| `call:initiate` | Client → Server | Start call |
| `call:join` | Client → Server | Join call |

---

## 11. Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Real-time transport | Socket.IO | Better reconnection, rooms, Redis adapter |
| Primary database | MongoDB | Flexible schema, horizontal scaling |
| Pub/sub system | Redis | Simple, sufficient for 10k concurrent |
| File storage | MinIO | S3-compatible, self-hostable |
| Search engine | Elasticsearch | Powerful full-text, scalable |
| Video SFU | mediasoup | Open source, efficient, customizable |
| E2E encryption | Signal Protocol | Industry standard, proven security |
| State management | Zustand | Simple, performant, TypeScript-first |

---

**Related Documents:**
- [PRD.md](./PRD.md) — Product requirements
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — Data models
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) — API details
- [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) — Deployment
