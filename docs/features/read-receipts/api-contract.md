# API Contract: Read Receipts

**Feature:** Chat Read Receipts  
**Version:** 1.0  
**Owner:** Architect Agent  

---

## Overview

This document defines the API contracts for the read receipts feature, including REST endpoints and Socket.IO events.

---

## REST Endpoints

### Mark Message as Read

```
POST /api/v1/messages/:messageId/read
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| messageId | string | MongoDB ObjectId of the message |

**Request Body:**
```json
{
  "readAt": "2026-03-14T10:30:00.000Z"  // Optional, defaults to now
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messageId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "readAt": "2026-03-14T10:30:00.000Z",
    "conversationId": "507f1f77bcf86cd799439013"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Message not found
- `403 Forbidden` - User not participant in conversation

---

### Mark Conversation as Read (Bulk)

```
POST /api/v1/conversations/:conversationId/read
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| conversationId | string | MongoDB ObjectId of the conversation |

**Request Body:**
```json
{
  "upToMessageId": "507f1f77bcf86cd799439011",  // Optional
  "readAt": "2026-03-14T10:30:00.000Z"  // Optional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversationId": "507f1f77bcf86cd799439013",
    "markedCount": 15,
    "lastReadMessageId": "507f1f77bcf86cd799439011"
  }
}
```

---

### Get Read Receipts for Message

```
GET /api/v1/messages/:messageId/receipts
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| messageId | string | MongoDB ObjectId of the message |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Max receipts to return |
| offset | number | 0 | Pagination offset |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messageId": "507f1f77bcf86cd799439011",
    "totalCount": 5,
    "receipts": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "username": "john_doe",
        "displayName": "John Doe",
        "avatar": "https://cdn.example.com/avatars/john.jpg",
        "readAt": "2026-03-14T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Get User Privacy Settings

```
GET /api/v1/users/me/settings/privacy
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "readReceipts": true,
    "lastSeen": true,
    "typing": true
  }
}
```

---

### Update Read Receipts Setting

```
PATCH /api/v1/users/me/settings/privacy
```

**Request Body:**
```json
{
  "readReceipts": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "readReceipts": false,
    "lastSeen": true,
    "typing": true
  }
}
```

---

## Socket.IO Events

### Client → Server

#### `message:read`
Mark a message as read.

```typescript
socket.emit('message:read', {
  messageId: string,
  conversationId: string,
  readAt?: string  // ISO8601, defaults to now
});
```

#### `conversation:markRead`
Mark all messages in conversation as read.

```typescript
socket.emit('conversation:markRead', {
  conversationId: string,
  upToMessageId?: string
});
```

---

### Server → Client

#### `receipt:delivered`
Message was delivered to recipient.

```typescript
socket.on('receipt:delivered', {
  messageId: string,
  conversationId: string,
  deliveredTo: string,  // userId
  deliveredAt: string   // ISO8601
});
```

#### `receipt:read`
Message was read by recipient.

```typescript
socket.on('receipt:read', {
  messageId: string,
  conversationId: string,
  readBy: string,    // userId
  readAt: string,    // ISO8601
  readerInfo?: {     // Only in group chats
    displayName: string,
    avatar: string
  }
});
```

#### `receipt:readCount`
Aggregated read count update for group messages.

```typescript
socket.on('receipt:readCount', {
  messageId: string,
  conversationId: string,
  readCount: number,
  totalParticipants: number
});
```

---

## Data Models

### ReadReceipt

```typescript
interface ReadReceipt {
  _id: ObjectId;
  messageId: ObjectId;
  conversationId: ObjectId;
  userId: ObjectId;
  readAt: Date;
  createdAt: Date;
}
```

### Indexes

```javascript
// Compound index for lookups
{ messageId: 1, userId: 1 }  // unique

// For user's unread count
{ conversationId: 1, userId: 1, readAt: 1 }

// TTL for cleanup (90 days)
{ createdAt: 1 }, { expireAfterSeconds: 7776000 }
```

---

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| POST /messages/:id/read | 100 req/min |
| POST /conversations/:id/read | 30 req/min |
| GET /messages/:id/receipts | 60 req/min |

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| READ_RECEIPT_DISABLED | "Read receipts are disabled" | User has disabled read receipts |
| MESSAGE_NOT_FOUND | "Message not found" | Invalid messageId |
| NOT_PARTICIPANT | "Not a conversation participant" | User not in conversation |
| ALREADY_READ | "Message already read" | Duplicate read attempt (not error, silent success) |
