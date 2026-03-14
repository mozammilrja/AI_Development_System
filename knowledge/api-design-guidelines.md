# API Design Guidelines

Guidelines for designing consistent, reliable, and developer-friendly APIs.

---

## RESTful API Principles

### Resource Naming

```
✓ Use nouns, not verbs
✓ Use plural forms
✓ Use lowercase with hyphens

GET    /api/users           # List users
GET    /api/users/:id       # Get user
POST   /api/users           # Create user
PUT    /api/users/:id       # Update user (full)
PATCH  /api/users/:id       # Update user (partial)
DELETE /api/users/:id       # Delete user

# Nested resources
GET    /api/users/:id/orders
POST   /api/users/:id/orders
```

### URL Structure

```
/api/v1/{resource}/{id}/{sub-resource}

Examples:
/api/v1/users
/api/v1/users/123
/api/v1/users/123/orders
/api/v1/users/123/orders/456
```

---

## HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | Yes | No |
| DELETE | Remove resource | Yes | No |

---

## HTTP Status Codes

### Success (2xx)

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |

### Client Errors (4xx)

| Code | Meaning | Use Case |
|------|---------|----------|
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limited |

### Server Errors (5xx)

| Code | Meaning | Use Case |
|------|---------|----------|
| 500 | Internal Server Error | Unexpected error |
| 502 | Bad Gateway | Upstream error |
| 503 | Service Unavailable | Maintenance |
| 504 | Gateway Timeout | Upstream timeout |

---

## Request/Response Format

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
X-Request-ID: <uuid>
```

### Response Structure

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-14T10:00:00Z",
    "requestId": "uuid"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-03-14T10:00:00Z",
    "requestId": "uuid"
  }
}
```

---

## Pagination

### Request

```
GET /api/users?page=1&limit=20
GET /api/users?cursor=abc123&limit=20
```

### Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Cursor-based (preferred for large datasets)

```json
{
  "data": [...],
  "pagination": {
    "cursor": "abc123",
    "nextCursor": "def456",
    "hasMore": true
  }
}
```

---

## Filtering & Sorting

### Filtering

```
GET /api/users?status=active
GET /api/users?status=active&role=admin
GET /api/users?createdAt[gte]=2026-01-01
GET /api/users?name[contains]=john
```

### Sorting

```
GET /api/users?sort=createdAt
GET /api/users?sort=-createdAt         # Descending
GET /api/users?sort=lastName,firstName # Multiple
```

### Field Selection

```
GET /api/users?fields=id,name,email
GET /api/users?include=orders,profile
```

---

## Versioning

### URL Versioning (Recommended)

```
/api/v1/users
/api/v2/users
```

### Header Versioning

```http
Accept: application/vnd.api+json; version=1
```

---

## Authentication

### Bearer Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### API Key

```http
X-API-Key: sk_live_abc123
```

---

## Rate Limiting

### Response Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
Retry-After: 60
```

### Rate Limit Error

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

---

## Input Validation

### Request Validation

```typescript
// Use Zod or Joi for validation
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().positive().optional()
});

// Validate early, fail fast
app.post('/users', validate(createUserSchema), handler);
```

### Validation Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "name", "message": "Name must be at least 2 characters" }
    ]
  }
}
```

---

## API Documentation

### OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: API Name
  version: 1.0.0

paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
```

### Required Documentation

- [ ] All endpoints documented
- [ ] Request/response examples
- [ ] Error codes documented
- [ ] Authentication explained
- [ ] Rate limits specified

---

## Best Practices Checklist

### Design
- [ ] Resources are nouns (not verbs)
- [ ] Consistent naming conventions
- [ ] Proper HTTP methods used
- [ ] Appropriate status codes

### Security
- [ ] Authentication required
- [ ] Authorization checked
- [ ] Input validated
- [ ] Rate limiting enabled

### Quality
- [ ] Pagination implemented
- [ ] Filtering available
- [ ] Versioning in place
- [ ] Documentation complete
