# services/backend/

## Purpose

Backend API services for applications built by the AI system.

## Ownership

**Backend Engineer Agent** has exclusive write access to this directory.

## Structure

```
backend/
├── src/
│   ├── api/          # API routes
│   ├── services/     # Business logic
│   ├── models/       # Data models
│   ├── middleware/   # Express middleware
│   └── utils/        # Utilities
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
└── tsconfig.json
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (configurable)
- **Testing**: Jest

## API Guidelines

- RESTful design
- Consistent error handling
- Request validation
- Authentication middleware
- Rate limiting
