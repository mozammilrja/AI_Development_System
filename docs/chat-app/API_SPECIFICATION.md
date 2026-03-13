# ChatHub - API Specification

**Version:** 1.0  
**Date:** March 13, 2026  
**Base URL:** `/api/v1`  

---

## 1. Overview

### 1.1 API Design Principles

- RESTful endpoints for CRUD operations
- Socket.IO for real-time events
- JSON request/response bodies
- JWT Bearer token authentication
- Consistent error responses
- Cursor-based pagination

### 1.2 Authentication

All endpoints require authentication unless noted.

```http
Authorization: Bearer <jwt_token>
```

### 1.3 Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Messages | 60 requests | 1 minute |
| File uploads | 20 requests | 1 hour |
| Search | 30 requests | 1 minute |
| General | 100 requests | 1 minute |

### 1.4 Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human-readable message",
  "details": { ... }
}
```

**Paginated Response:**
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "nextCursor": "abc123",
      "hasMore": true
    }
  }
}
```

---

## 2. Authentication Endpoints

### 2.1 Register

Creates a new user account.

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123",
  "username": "johndoe"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "avatar": null,
      "createdAt": "2026-03-13T10:00:00Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2.2 Login

Authenticates user and returns tokens.

```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "avatar": "https://..."
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2.3 Refresh Token

Gets new access token using refresh token.

```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2.4 Logout

Invalidates refresh token.

```http
POST /api/v1/auth/logout
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## 3. User Endpoints

### 3.1 Get Current User

```http
GET /api/v1/users/me
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "avatar": "https://...",
      "status": {
        "type": "online",
        "customMessage": "Working on ChatHub"
      },
      "settings": {
        "notifications": { ... },
        "privacy": { ... },
        "theme": "dark"
      },
      "createdAt": "2026-03-13T10:00:00Z"
    }
  }
}
```

### 3.2 Update Profile

```http
PATCH /api/v1/users/me
```

**Request Body:**
```json
{
  "name": "John D.",
  "username": "john_d",
  "avatar": "https://..."
}
```

### 3.3 Update Settings

```http
PATCH /api/v1/users/me/settings
```

**Request Body:**
```json
{
  "notifications": {
    "enabled": true,
    "sound": false
  },
  "privacy": {
    "readReceipts": false
  }
}
```

### 3.4 Update Status

```http
PATCH /api/v1/users/me/status
```

**Request Body:**
```json
{
  "type": "away",
  "customMessage": "Be right back"
}
```

### 3.5 Search Users

```http
GET /api/v1/users/search?q=john&limit=10
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "_id": "user_123",
        "name": "John Doe",
        "username": "johndoe",
        "avatar": "https://..."
      }
    ]
  }
}
```

### 3.6 Get User by ID

```http
GET /api/v1/users/:userId
```

### 3.7 Block User

```http
POST /api/v1/users/:userId/block
```

### 3.8 Unblock User

```http
DELETE /api/v1/users/:userId/block
```

---

## 4. Conversation Endpoints

### 4.1 List Conversations

```http
GET /api/v1/conversations?cursor=abc&limit=20
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| cursor | string | - | Pagination cursor |
| limit | number | 20 | Max items (1-50) |
| type | string | - | Filter: dm, group, channel |

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "conversations": [
      {
        "_id": "conv_123",
        "type": "dm",
        "members": [
          {
            "userId": "user_456",
            "name": "Jane Smith",
            "username": "janesmith",
            "avatar": "https://..."
          }
        ],
        "lastMessage": {
          "_id": "msg_789",
          "senderId": "user_456",
          "senderName": "Jane Smith",
          "content": "Hey, how are you?",
          "type": "text",
          "timestamp": "2026-03-13T10:30:00Z"
        },
        "unreadCount": 3,
        "muted": false,
        "updatedAt": "2026-03-13T10:30:00Z"
      },
      {
        "_id": "conv_456",
        "type": "group",
        "name": "Project Team",
        "avatar": "https://...",
        "memberCount": 8,
        "lastMessage": { ... },
        "unreadCount": 0,
        "muted": false
      }
    ],
    "pagination": {
      "nextCursor": "conv_789",
      "hasMore": true
    }
  }
}
```

### 4.2 Create Conversation

```http
POST /api/v1/conversations
```

**Request Body (DM):**
```json
{
  "type": "dm",
  "participantId": "user_456"
}
```

**Request Body (Group):**
```json
{
  "type": "group",
  "name": "Project Team",
  "memberIds": ["user_456", "user_789"]
}
```

**Request Body (Channel):**
```json
{
  "type": "channel",
  "name": "announcements",
  "description": "Company announcements",
  "isPublic": true
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "conversation": {
      "_id": "conv_123",
      "type": "group",
      "name": "Project Team",
      "members": [ ... ],
      "settings": { ... },
      "createdAt": "2026-03-13T10:00:00Z"
    }
  }
}
```

### 4.3 Get Conversation

```http
GET /api/v1/conversations/:conversationId
```

### 4.4 Update Conversation

```http
PATCH /api/v1/conversations/:conversationId
```

**Request Body:**
```json
{
  "name": "New Project Team",
  "description": "Updated description"
}
```

### 4.5 Delete Conversation

```http
DELETE /api/v1/conversations/:conversationId
```

### 4.6 Leave Conversation

```http
POST /api/v1/conversations/:conversationId/leave
```

### 4.7 Add Members

```http
POST /api/v1/conversations/:conversationId/members
```

**Request Body:**
```json
{
  "userIds": ["user_123", "user_456"]
}
```

### 4.8 Remove Member

```http
DELETE /api/v1/conversations/:conversationId/members/:userId
```

### 4.9 Update Member Role

```http
PATCH /api/v1/conversations/:conversationId/members/:userId
```

**Request Body:**
```json
{
  "role": "admin"
}
```

### 4.10 Mute Conversation

```http
POST /api/v1/conversations/:conversationId/mute
```

**Request Body:**
```json
{
  "duration": 3600
}
```

### 4.11 Unmute Conversation

```http
DELETE /api/v1/conversations/:conversationId/mute
```

### 4.12 Pin Message

```http
POST /api/v1/conversations/:conversationId/pins/:messageId
```

### 4.13 Unpin Message

```http
DELETE /api/v1/conversations/:conversationId/pins/:messageId
```

### 4.14 Discover Channels

```http
GET /api/v1/conversations/channels/discover?q=tech&limit=20
```

### 4.15 Join Channel

```http
POST /api/v1/conversations/:conversationId/join
```

---

## 5. Message Endpoints

### 5.1 Get Messages

```http
GET /api/v1/conversations/:conversationId/messages?cursor=msg_abc&limit=50
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| cursor | string | - | Message ID to start from |
| limit | number | 50 | Max messages (1-100) |
| direction | string | before | before or after cursor |

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "_id": "msg_123",
        "conversationId": "conv_456",
        "senderId": "user_789",
        "sender": {
          "_id": "user_789",
          "name": "Jane Smith",
          "username": "janesmith",
          "avatar": "https://..."
        },
        "type": "text",
        "content": {
          "text": "Hello everyone!"
        },
        "reactions": [
          {
            "emoji": "👍",
            "count": 3,
            "userIds": ["user_1", "user_2", "user_3"],
            "reacted": true
          }
        ],
        "replyTo": null,
        "readBy": ["user_1", "user_2"],
        "createdAt": "2026-03-13T10:00:00Z",
        "editedAt": null
      }
    ],
    "pagination": {
      "nextCursor": "msg_100",
      "hasMore": true
    }
  }
}
```

### 5.2 Send Message (REST Fallback)

Primary method is Socket.IO, but REST is available.

```http
POST /api/v1/conversations/:conversationId/messages
```

**Request Body (Text):**
```json
{
  "type": "text",
  "content": {
    "text": "Hello everyone!"
  }
}
```

**Request Body (With Reply):**
```json
{
  "type": "text",
  "content": {
    "text": "I agree!"
  },
  "replyTo": "msg_123"
}
```

**Request Body (With Media):**
```json
{
  "type": "image",
  "content": {
    "text": "Check this out"
  },
  "mediaIds": ["media_123"]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "message": {
      "_id": "msg_456",
      "conversationId": "conv_123",
      "senderId": "user_current",
      "type": "text",
      "content": { "text": "Hello everyone!" },
      "createdAt": "2026-03-13T10:05:00Z"
    }
  }
}
```

### 5.3 Edit Message

```http
PATCH /api/v1/messages/:messageId
```

**Request Body:**
```json
{
  "content": {
    "text": "Updated message text"
  }
}
```

### 5.4 Delete Message

```http
DELETE /api/v1/messages/:messageId?forEveryone=true
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| forEveryone | boolean | false | Delete for all users |

### 5.5 Add Reaction

```http
POST /api/v1/messages/:messageId/reactions
```

**Request Body:**
```json
{
  "emoji": "👍"
}
```

### 5.6 Remove Reaction

```http
DELETE /api/v1/messages/:messageId/reactions/:emoji
```

### 5.7 Mark as Read

```http
POST /api/v1/conversations/:conversationId/read
```

**Request Body:**
```json
{
  "messageId": "msg_123"
}
```

### 5.8 Get Thread

```http
GET /api/v1/messages/:messageId/thread?cursor=abc&limit=50
```

---

## 6. Media Endpoints

### 6.1 Upload File

```http
POST /api/v1/media/upload
Content-Type: multipart/form-data
```

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | The file to upload |
| conversationId | string | No | Target conversation |
| type | string | No | image, file, voice |

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "media": {
      "_id": "media_123",
      "filename": "image.jpg",
      "originalFilename": "photo.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "url": "https://storage.../image.jpg",
      "thumbnail": {
        "url": "https://storage.../thumb_image.jpg",
        "width": 200,
        "height": 150
      },
      "status": "ready"
    }
  }
}
```

### 6.2 Get Upload URL (Presigned)

For large files, get presigned URL for direct upload.

```http
POST /api/v1/media/upload-url
```

**Request Body:**
```json
{
  "filename": "large-video.mp4",
  "mimeType": "video/mp4",
  "size": 104857600
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "uploadUrl": "https://storage.../presigned...",
    "mediaId": "media_456",
    "expiresAt": "2026-03-13T11:00:00Z"
  }
}
```

### 6.3 Confirm Upload

After direct upload, confirm completion.

```http
POST /api/v1/media/:mediaId/confirm
```

### 6.4 Get Media Info

```http
GET /api/v1/media/:mediaId
```

### 6.5 Delete Media

```http
DELETE /api/v1/media/:mediaId
```

---

## 7. Search Endpoints

### 7.1 Search Messages

```http
GET /api/v1/search/messages
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | string | Yes | Search query |
| conversationId | string | No | Limit to conversation |
| senderId | string | No | Filter by sender |
| from | string | No | Start date (ISO) |
| to | string | No | End date (ISO) |
| hasMedia | boolean | No | Has attachments |
| cursor | string | No | Pagination |
| limit | number | No | Max 50 |

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "message": {
          "_id": "msg_123",
          "content": { "text": "Meeting tomorrow at 3pm" },
          "sender": { ... },
          "createdAt": "2026-03-13T10:00:00Z"
        },
        "conversation": {
          "_id": "conv_456",
          "type": "group",
          "name": "Project Team"
        },
        "highlights": [
          "<em>Meeting</em> tomorrow at 3pm"
        ]
      }
    ],
    "pagination": {
      "nextCursor": "...",
      "hasMore": true
    },
    "total": 42
  }
}
```

### 7.2 Search Users

```http
GET /api/v1/search/users?q=john&limit=10
```

### 7.3 Search Channels

```http
GET /api/v1/search/channels?q=tech&limit=10
```

---

## 8. Call Endpoints

### 8.1 Start Call

```http
POST /api/v1/calls
```

**Request Body:**
```json
{
  "conversationId": "conv_123",
  "type": "video"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "call": {
      "_id": "call_123",
      "conversationId": "conv_456",
      "type": "video",
      "status": "ringing",
      "roomId": "room_xyz",
      "initiator": { ... }
    },
    "signalingToken": "..."
  }
}
```

### 8.2 Get Call Status

```http
GET /api/v1/calls/:callId
```

### 8.3 End Call

```http
POST /api/v1/calls/:callId/end
```

### 8.4 Get Call History

```http
GET /api/v1/calls?conversationId=conv_123&limit=20
```

---

## 9. Presence Endpoints

### 9.1 Get Online Users

```http
GET /api/v1/presence/online?userIds=user_1,user_2,user_3
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "users": {
      "user_1": {
        "status": "online",
        "customMessage": "Working",
        "lastSeen": null
      },
      "user_2": {
        "status": "away",
        "customMessage": null,
        "lastSeen": null
      },
      "user_3": {
        "status": "offline",
        "customMessage": null,
        "lastSeen": "2026-03-13T09:00:00Z"
      }
    }
  }
}
```

---

## 10. Encryption Endpoints

### 10.1 Upload Keys

Upload encryption keys for E2E setup.

```http
POST /api/v1/encryption/keys
```

**Request Body:**
```json
{
  "identityKey": "base64...",
  "signedPreKey": {
    "keyId": 1,
    "public": "base64...",
    "signature": "base64..."
  },
  "oneTimePreKeys": [
    { "keyId": 1, "public": "base64..." },
    { "keyId": 2, "public": "base64..." }
  ]
}
```

### 10.2 Get User Keys

Get keys for establishing encrypted session.

```http
GET /api/v1/encryption/keys/:userId
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "identityKey": "base64...",
    "signedPreKey": {
      "keyId": 1,
      "public": "base64...",
      "signature": "base64..."
    },
    "oneTimePreKey": {
      "keyId": 5,
      "public": "base64..."
    }
  }
}
```

### 10.3 Replenish One-Time Keys

```http
POST /api/v1/encryption/keys/replenish
```

**Request Body:**
```json
{
  "oneTimePreKeys": [
    { "keyId": 10, "public": "base64..." },
    { "keyId": 11, "public": "base64..." }
  ]
}
```

---

## 11. Push Notification Endpoints

### 11.1 Register Subscription

```http
POST /api/v1/push/subscribe
```

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "device": {
    "type": "web",
    "browser": "Chrome"
  }
}
```

### 11.2 Unsubscribe

```http
DELETE /api/v1/push/subscribe
```

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/..."
}
```

### 11.3 Test Push

```http
POST /api/v1/push/test
```

---

## 12. Socket.IO Events

### 12.1 Connection

```typescript
// Client connection with auth
const socket = io('https://api.chathub.com', {
  auth: {
    token: 'jwt_token_here'
  }
});

// Connection events
socket.on('connect', () => { });
socket.on('disconnect', (reason) => { });
socket.on('connect_error', (error) => { });
```

### 12.2 Message Events

**Client → Server:**

| Event | Payload | Description |
|-------|---------|-------------|
| `message:send` | `{ conversationId, type, content, replyTo?, mediaIds? }` | Send message |
| `message:edit` | `{ messageId, content }` | Edit message |
| `message:delete` | `{ messageId, forEveryone }` | Delete message |
| `message:react` | `{ messageId, emoji }` | Add reaction |
| `message:unreact` | `{ messageId, emoji }` | Remove reaction |
| `message:read` | `{ conversationId, messageId }` | Mark as read |

**Server → Client:**

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `{ message }` | New message received |
| `message:updated` | `{ message }` | Message edited |
| `message:deleted` | `{ messageId, conversationId, forEveryone }` | Message deleted |
| `message:reaction` | `{ messageId, reactions }` | Reactions updated |
| `message:read` | `{ conversationId, messageId, userId }` | Read receipt |

### 12.3 Typing Events

**Client → Server:**

| Event | Payload |
|-------|---------|
| `typing:start` | `{ conversationId }` |
| `typing:stop` | `{ conversationId }` |

**Server → Client:**

| Event | Payload |
|-------|---------|
| `typing:update` | `{ conversationId, users: [{ userId, name }] }` |

### 12.4 Presence Events

**Client → Server:**

| Event | Payload |
|-------|---------|
| `presence:update` | `{ status, customMessage? }` |

**Server → Client:**

| Event | Payload |
|-------|---------|
| `presence:change` | `{ userId, status, customMessage?, lastSeen? }` |

### 12.5 Call Events

**Client → Server:**

| Event | Payload |
|-------|---------|
| `call:initiate` | `{ conversationId, type }` |
| `call:accept` | `{ callId }` |
| `call:decline` | `{ callId }` |
| `call:join` | `{ callId }` |
| `call:leave` | `{ callId }` |
| `call:offer` | `{ callId, sdp }` |
| `call:answer` | `{ callId, sdp }` |
| `call:ice` | `{ callId, candidate }` |

**Server → Client:**

| Event | Payload |
|-------|---------|
| `call:incoming` | `{ call, initiator }` |
| `call:accepted` | `{ callId, userId }` |
| `call:declined` | `{ callId, userId }` |
| `call:joined` | `{ callId, userId }` |
| `call:left` | `{ callId, userId }` |
| `call:ended` | `{ callId, reason }` |
| `call:offer` | `{ callId, userId, sdp }` |
| `call:answer` | `{ callId, userId, sdp }` |
| `call:ice` | `{ callId, userId, candidate }` |

### 12.6 Conversation Events

**Server → Client:**

| Event | Payload |
|-------|---------|
| `conversation:created` | `{ conversation }` |
| `conversation:updated` | `{ conversation }` |
| `conversation:deleted` | `{ conversationId }` |
| `conversation:member_added` | `{ conversationId, user }` |
| `conversation:member_removed` | `{ conversationId, userId }` |

---

## 13. Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `AUTH_INVALID` | 401 | Invalid token |
| `AUTH_EXPIRED` | 401 | Token expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONVERSATION_NOT_FOUND` | 404 | Conversation doesn't exist |
| `MESSAGE_NOT_FOUND` | 404 | Message doesn't exist |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INVALID_FILE_TYPE` | 400 | Unsupported file type |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit |
| `RATE_LIMITED` | 429 | Too many requests |
| `BLOCKED_USER` | 403 | User is blocked |
| `ALREADY_MEMBER` | 400 | Already in conversation |
| `NOT_MEMBER` | 403 | Not a member |
| `ENCRYPTION_ERROR` | 400 | E2E encryption error |
| `CALL_IN_PROGRESS` | 400 | Call already active |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 14. Webhooks (Future)

For integrations, webhooks will fire on:

| Event | Payload |
|-------|---------|
| `message.created` | Full message object |
| `message.deleted` | Message ID and conversation |
| `member.joined` | User and conversation |
| `member.left` | User and conversation |

---

**Related Documents:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — Data models
