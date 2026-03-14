# Testing Guidelines

Comprehensive testing standards for the AI Development System.

---

## Testing Pyramid

```
        /\
       /  \       E2E Tests (10%)
      /────\      - Full user flows
     /      \     - Browser testing
    /────────\    
   /          \   Integration Tests (20%)
  /────────────\  - API testing
 /              \ - Service interactions
/────────────────\
        |         Unit Tests (70%)
        |         - Functions, components
        |         - Fast, isolated
```

---

## Unit Testing

### Guidelines

- Test one thing per test
- Test behavior, not implementation
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests fast (<100ms each)
- Mock external dependencies

### Structure

```typescript
// tests/unit/backend/services/userService.test.ts

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      create: jest.fn(),
    };
    userService = new UserService(mockUserRepo);
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test' };
      mockUserRepo.create.mockResolvedValue({ id: '1', ...userData });

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result.id).toBe('1');
      expect(mockUserRepo.create).toHaveBeenCalledWith(userData);
    });

    it('should throw on duplicate email', async () => {
      // Arrange
      mockUserRepo.create.mockRejectedValue(new DuplicateError());

      // Act & Assert
      await expect(
        userService.createUser({ email: 'dupe@example.com' })
      ).rejects.toThrow(DuplicateError);
    });
  });
});
```

### Naming Convention

```typescript
// Pattern: should [expected behavior] when [condition]

it('should return null when user not found', ...);
it('should throw ValidationError when email is invalid', ...);
it('should send welcome email when user is created', ...);
```

---

## Integration Testing

### API Testing

```typescript
// tests/integration/api/users.test.ts

import request from 'supertest';
import { app } from '../../../services/backend/src/app';
import { setupTestDb, teardownTestDb, createTestUser } from '../helpers';

describe('Users API', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearUsers();
  });

  describe('GET /api/users', () => {
    it('should return paginated users', async () => {
      // Setup
      await createTestUser({ email: 'user1@test.com' });
      await createTestUser({ email: 'user2@test.com' });

      // Test
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Verify
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'new@test.com', name: 'New User' })
        .expect(201);

      expect(response.body.data.email).toBe('new@test.com');
    });

    it('should return 422 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'invalid', name: 'Test' })
        .expect(422);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

### Database Testing

```typescript
// tests/integration/repositories/userRepository.test.ts

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeAll(async () => {
    await setupTestDb();
    repository = new MongoUserRepository();
  });

  afterEach(async () => {
    await clearCollection('users');
  });

  it('should create and retrieve user', async () => {
    const created = await repository.create({
      email: 'test@example.com',
      name: 'Test User'
    });

    const found = await repository.findById(created.id);

    expect(found).not.toBeNull();
    expect(found!.email).toBe('test@example.com');
  });
});
```

---

## E2E Testing

### Playwright Setup

```typescript
// tests/e2e/playwright.config.ts

import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './flows',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
};

export default config;
```

### E2E Test Example

```typescript
// tests/e2e/flows/authentication.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="login-button"]');

    // Fill form
    await page.fill('[data-testid="email-input"]', 'user@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Submit
    await page.click('[data-testid="submit-button"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'wrong@test.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="submit-button"]');

    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Invalid credentials');
  });
});
```

### Page Object Model

```typescript
// tests/e2e/pages/LoginPage.ts

import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="submit-button"]');
  }

  async getErrorMessage() {
    return this.page.locator('[data-testid="error-message"]').textContent();
  }
}

// Usage in tests
test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password');
});
```

---

## Component Testing

### React Testing Library

```typescript
// tests/unit/frontend/components/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../../services/frontend/src/components/Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should call onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Testing

```typescript
// tests/unit/frontend/hooks/useUsers.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '../../../services/frontend/src/hooks/useUsers';

jest.mock('../../../services/frontend/src/services/api');

describe('useUsers', () => {
  it('should fetch users on mount', async () => {
    const mockUsers = [{ id: '1', name: 'Test' }];
    (api.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
  });
});
```

---

## Test Coverage

### Targets

| Type | Minimum | Target |
|------|---------|--------|
| Statements | 70% | 85% |
| Branches | 70% | 80% |
| Functions | 70% | 85% |
| Lines | 70% | 85% |

### Coverage Report

```bash
# Generate coverage
npm run test:coverage

# Coverage output
File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
services/      |   85.2  |   78.4   |   89.1  |   84.8
components/    |   91.3  |   82.1   |   93.2  |   90.7
hooks/         |   88.4  |   75.3   |   87.6  |   88.1
```

---

## Mocking

### Jest Mocks

```typescript
// Mock module
jest.mock('../services/emailService');

// Mock implementation
const mockSendEmail = jest.fn().mockResolvedValue(true);
EmailService.prototype.send = mockSendEmail;

// Mock return value
jest.spyOn(userRepo, 'findById').mockResolvedValue(mockUser);

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

### MSW (Mock Service Worker)

```typescript
// tests/mocks/handlers.ts

import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [{ id: '1', name: 'Test User' }]
      })
    );
  }),

  rest.post('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ data: { id: '2', ...req.body } })
    );
  }),
];
```

---

## Test Data

### Factories

```typescript
// tests/factories/userFactory.ts

import { faker } from '@faker-js/faker';

export const createUser = (overrides = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  createdAt: faker.date.past(),
  ...overrides,
});

// Usage
const user = createUser({ email: 'specific@test.com' });
```

### Fixtures

```typescript
// tests/fixtures/users.ts

export const testUsers = {
  admin: {
    id: 'admin-id',
    email: 'admin@test.com',
    role: 'admin'
  },
  regular: {
    id: 'user-id',
    email: 'user@test.com',
    role: 'user'
  }
};
```

---

## Checklist

### Before Commit
- [ ] All tests pass locally
- [ ] New code has tests
- [ ] Coverage not decreased
- [ ] No flaky tests
- [ ] Test names are descriptive

### Test Quality
- [ ] Tests are independent
- [ ] Tests are deterministic
- [ ] Tests are fast
- [ ] Tests document behavior
- [ ] Edge cases covered
