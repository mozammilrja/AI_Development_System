# tests/

## Purpose

Test suites for the AI development system and built applications.

## Ownership

**QA Engineer Agent** has primary ownership of this directory.

## Contents

- **unit/**: Unit tests
- **integration/**: Integration tests
- **e2e/**: End-to-end tests
- **benchmarks/**: Performance benchmarks
- **security/**: Security tests

## Structure

```
tests/
├── unit/
│   ├── backend/
│   └── frontend/
├── integration/
│   └── api/
├── e2e/
│   └── flows/
├── benchmarks/
│   └── *.bench.ts
├── security/
│   └── *.security.ts
└── fixtures/
    └── test-data/
```

## Testing Strategy

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Individual functions | Jest |
| Integration | Service interactions | Jest + Supertest |
| E2E | Full user flows | Playwright |
| Security | Vulnerabilities | Custom + OWASP |

## Running Tests

```bash
# All tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```
