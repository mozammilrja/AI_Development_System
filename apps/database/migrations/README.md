# Database Migrations

This directory holds individual migration scripts.

Each migration file represents a versioned schema change that can be applied
(upgrade) or rolled back (downgrade).

## Usage

```bash
# Apply all pending migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description"

# Rollback last migration
alembic downgrade -1
```
