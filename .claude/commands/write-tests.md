# Write Tests Command

Write tests for: **$ARGUMENTS**

---

## Workflow Activation

This command activates the QA Engineer to create comprehensive test suites for specified components.

---

## Phase 1: Initialize Test Task

```
1. Generate Task ID: TASK-TEST-XXX
2. Analyze target: "$ARGUMENTS"
3. Determine test types needed:
   - Unit tests
   - Integration tests
   - E2E tests
4. Create tasks in core/tasks/backlog.md
5. Update core/state/tasks.json
```

### Test Scope Analysis

```
ANALYZE target: "$ARGUMENTS"
IDENTIFY:
  - Components to test
  - Test types required
  - Existing test coverage
  - Priority test cases
```

### Create Test Tasks

| Task ID | Agent | Description |
|---------|-------|-------------|
| TASK-TEST-001 | qa-engineer | Write unit tests |
| TASK-TEST-002 | qa-engineer | Write integration tests |
| TASK-TEST-003 | qa-engineer | Write E2E tests |
| TASK-TEST-004 | reviewer | Review test quality |

---

## Phase 2: Unit Tests

**Agent:** QA Engineer

```
QA ENGINEER:
1. Claim TASK-TEST-001 from backlog
2. Update agents.json: status = "working"
3. Analyze components in: "$ARGUMENTS"
4. Read source code to understand functionality
5. Write unit tests:
   - Backend: tests/unit/backend/
   - Frontend: tests/unit/frontend/
6. Test structure:
   - Describe blocks for each module
   - Test cases for each function
   - Edge cases and error handling
7. Run tests: npm run test:unit
8. Achieve coverage target (>80%)
9. Mark task complete
```

### Unit Test Template

```typescript
// tests/unit/backend/[module].test.ts

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ModuleName } from '../../../services/backend/src/module';

describe('ModuleName', () => {
  beforeEach(() => {
    // Setup
  });

  describe('functionName', () => {
    it('should handle normal case', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle edge case', () => {
      // Test
    });

    it('should throw on invalid input', () => {
      // Test error handling
    });
  });
});
```

---

## Phase 3: Integration Tests

**Agent:** QA Engineer

```
QA ENGINEER:
1. Claim TASK-TEST-002 from backlog
2. Identify integration points:
   - API endpoints
   - Database operations
   - External services
3. Write integration tests in tests/integration/
4. Test scenarios:
   - API request/response flows
   - Database CRUD operations
   - Service interactions
5. Run tests: npm run test:integration
6. Mark task complete
```

### Integration Test Template

```typescript
// tests/integration/api/[endpoint].test.ts

import request from 'supertest';
import { app } from '../../../services/backend/src/app';
import { setupTestDb, teardownTestDb } from '../helpers';

describe('POST /api/resource', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it('should create resource with valid data', async () => {
    const response = await request(app)
      .post('/api/resource')
      .send({ name: 'test' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });

  it('should return 400 for invalid data', async () => {
    await request(app)
      .post('/api/resource')
      .send({})
      .expect(400);
  });
});
```

---

## Phase 4: E2E Tests

**Agent:** QA Engineer

```
QA ENGINEER:
1. Claim TASK-TEST-003 from backlog
2. Identify user flows to test
3. Write E2E tests in tests/e2e/
4. Use Playwright for browser testing
5. Test scenarios:
   - Complete user journeys
   - Cross-browser compatibility
   - Responsive layouts
6. Run tests: npm run test:e2e
7. Mark task complete
```

### E2E Test Template

```typescript
// tests/e2e/flows/[feature].spec.ts

import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete user flow', async ({ page }) => {
    // Step 1: Navigate
    await page.click('[data-testid="start-button"]');
    
    // Step 2: Fill form
    await page.fill('[data-testid="input-field"]', 'value');
    
    // Step 3: Submit
    await page.click('[data-testid="submit-button"]');
    
    // Step 4: Verify
    await expect(page.locator('[data-testid="success-message"]'))
      .toBeVisible();
  });
});
```

---

## Phase 5: Test Review

**Agent:** Reviewer

```
REVIEWER:
1. Claim TASK-TEST-004 from backlog
2. Review test quality:
   - Test coverage adequacy
   - Test case completeness
   - Code quality in tests
   - Meaningful assertions
3. Write review to docs/reviews/TEST-XXX-review.md
4. Approve or request improvements
5. Mark task complete
```

### Test Review Checklist

- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests cover edge cases
- [ ] No flaky tests
- [ ] Tests are maintainable
- [ ] Good test descriptions
- [ ] Proper setup/teardown
- [ ] No hardcoded values

---

## Phase 6: Completion

```
1. Verify all test tasks completed
2. Run full test suite
3. Generate coverage report
4. Update core/state/progress.json
5. Generate test report
```

---

## Test Report Template

```markdown
# Test Report: $ARGUMENTS

## Summary
- Total Tests: X
- Passed: X
- Failed: 0
- Skipped: X

## Coverage
- Statements: X%
- Branches: X%
- Functions: X%
- Lines: X%

## Test Suites
| Suite | Tests | Status |
|-------|-------|--------|
| Unit (Backend) | X | ✓ |
| Unit (Frontend) | X | ✓ |
| Integration | X | ✓ |
| E2E | X | ✓ |

## Files Created
- tests/unit/backend/[module].test.ts
- tests/unit/frontend/[component].test.ts
- tests/integration/api/[endpoint].test.ts
- tests/e2e/flows/[feature].spec.ts
```

---

## Execution Loop

```
WHILE tests.status != "completed":
    qa_engineer.claim_tasks()
    
    # Unit Tests
    qa_engineer.analyze_components()
    qa_engineer.write_unit_tests()
    qa_engineer.run_unit_tests()
    
    # Integration Tests
    qa_engineer.write_integration_tests()
    qa_engineer.run_integration_tests()
    
    # E2E Tests
    qa_engineer.write_e2e_tests()
    qa_engineer.run_e2e_tests()
    
    # Review
    reviewer.review_tests()
    IF changes_requested:
        qa_engineer.improve_tests()
    
    qa_engineer.complete_tasks()

GENERATE test_report()
GENERATE coverage_report()
```
