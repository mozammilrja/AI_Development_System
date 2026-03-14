# services/

## Purpose

Application services built by the AI development system.

## Contents

- **backend/**: Backend API services
- **frontend/**: Frontend web applications
- **shared/**: Shared libraries and utilities

## Structure

```
services/
├── backend/          # API services
│   ├── src/
│   ├── tests/
│   └── package.json
├── frontend/         # Web applications
│   ├── src/
│   ├── tests/
│   └── package.json
└── shared/           # Shared code
    └── src/
```

## Ownership

| Agent | Owns |
|-------|------|
| Backend Engineer | services/backend/ |
| Frontend Engineer | services/frontend/ |

## Development

Each service is independently:
- Buildable
- Testable
- Deployable
