# Backend Agent

## Purpose

Contains prompt templates for the **Backend** agent, responsible for API development, service layer logic, and database operations.

## Owned Paths

- `apps/backend/`
- `apps/database/`
- `saas-app/backend/`

## Capabilities

- Build REST API endpoints with validation and auth
- Implement service layer with repository pattern and transaction management
- Write database migrations (Alembic for PostgreSQL, Mongoose for MongoDB)
- Handle error cases, logging, and metrics

## Stack

| Workspace | Runtime | Database | Validation |
|-----------|---------|----------|------------|
| `apps/` | Python 3.11+ / Uvicorn | PostgreSQL (Alembic) | Pydantic |
| `saas-app/` | Express.js / Node.js | MongoDB (Mongoose) | Zod |

## Files

| File | Description |
|------|-------------|
| `prompts.md` | System prompt, API endpoint prompt, service layer prompt |

## Model

Primary: Claude Sonnet · Fallback: GPT-4o → GPT-4o-mini
