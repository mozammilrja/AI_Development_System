# Backend Service — Conventions

## Stack
- Python 3.11+ with FastAPI
- SQLAlchemy 2.0 (async) for ORM
- Pydantic v2 for request/response schemas
- Alembic for database migrations

## API Patterns
- RESTful endpoints under `/api/v1/`
- Use Pydantic models for all request bodies and responses — no raw dicts
- Return consistent error format: `{"detail": "message", "code": "ERROR_CODE"}`
- All endpoints must have OpenAPI docstrings
- Use dependency injection for services (`Depends()`)

## File Structure
```
services/backend/
  routers/       — FastAPI route definitions (one file per resource)
  services/      — Business logic (one file per domain)
  models/        — SQLAlchemy models
  schemas/       — Pydantic request/response schemas
  dependencies/  — FastAPI dependency functions
```

## Database
- All queries must use parameterized statements (never f-strings in SQL)
- Use async sessions for all database operations
- Migrations in `services/database/migrations/`
- Index frequently queried columns

## Security
- Validate all input with Pydantic — never trust raw request data
- Use `HTTPBearer` for authentication endpoints
- Rate-limit public endpoints
- Never log sensitive data (passwords, tokens, PII)

## Error Handling
- Use custom exception classes that map to HTTP status codes
- Catch specific exceptions — never bare `except:`
- Log errors with context (request ID, user ID, operation)

## Testing
- Every endpoint needs at least one happy-path and one error-path test
- Use `httpx.AsyncClient` with `TestClient` for API tests
- Mock external services — never call real APIs in tests
