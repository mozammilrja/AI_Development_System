# Tests

This directory contains all test suites for the AI Development System.

## Structure

```
tests/
├── unit/           — Unit tests for individual modules
├── integration/    — Integration tests for service boundaries
└── e2e/            — End-to-end tests using Playwright
```

## Running Tests

```bash
# All tests
npm test

# Unit tests only
npx jest --testPathPattern=unit --verbose

# Integration tests only
npx jest --testPathPattern=integration --verbose

# E2E tests
npx playwright test

# Coverage report
npx jest --coverage
```

## Conventions

- Test files: `<module>.test.ts` or `<module>.spec.ts`
- Co-locate unit tests near the code they test, or place in `tests/unit/`
- Integration tests go in `tests/integration/`
- E2E tests go in `tests/e2e/`

## Ownership

- **QA agent**: defines test strategy and acceptance criteria
- **Tester agent**: writes and executes test code
