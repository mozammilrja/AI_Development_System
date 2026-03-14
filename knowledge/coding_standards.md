# Coding Standards

Comprehensive coding standards for the AI Development System. All agents must follow these conventions.

---

## TypeScript Standards

### Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Definitions

```typescript
// ✓ GOOD: Explicit types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✓ GOOD: Interface over type for objects
interface User {
  id: string;
  email: string;
  name: string;
}

// ✓ GOOD: Type for unions/aliases
type Status = 'pending' | 'active' | 'completed';
type UserId = string;

// ✗ BAD: any type
function process(data: any) { ... }

// ✓ GOOD: unknown for truly unknown types
function process(data: unknown) {
  if (isUser(data)) {
    // data is typed as User
  }
}
```

### Null Handling

```typescript
// ✓ GOOD: Optional chaining
const name = user?.profile?.name;

// ✓ GOOD: Nullish coalescing
const displayName = user.name ?? 'Anonymous';

// ✓ GOOD: Type guard
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

---

## React Standards

### Functional Components

```typescript
// ✓ GOOD: Functional component with typed props
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### Hooks Usage

```typescript
// ✓ GOOD: Proper hook usage
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  let cancelled = false;
  
  async function fetchUsers() {
    try {
      const data = await api.getUsers();
      if (!cancelled) {
        setUsers(data);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }
  
  fetchUsers();
  
  return () => {
    cancelled = true;
  };
}, []);
```

### Event Handlers

```typescript
// ✓ GOOD: Typed event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // ...
};
```

---

## Naming Conventions

### Files and Directories

```
services/backend/src/
├── api/
│   └── controllers/
│       └── userController.ts      # camelCase
├── services/
│   └── userService.ts             # camelCase
├── models/
│   └── User.ts                    # PascalCase for classes/models
└── utils/
    └── formatDate.ts              # camelCase

services/frontend/src/
├── components/
│   └── Button/
│       ├── Button.tsx             # PascalCase for components
│       ├── Button.test.tsx
│       └── index.ts
├── hooks/
│   └── useUsers.ts                # camelCase with 'use' prefix
└── stores/
    └── userStore.ts               # camelCase
```

### Variables and Functions

```typescript
// Variables: camelCase
const userName = 'John';
const isActive = true;
const maxRetries = 3;

// Constants: SCREAMING_SNAKE_CASE
const MAX_CONNECTIONS = 100;
const API_BASE_URL = '/api/v1';

// Functions: camelCase, verb prefix
function getUser(id: string) { ... }
function createOrder(data: OrderData) { ... }
function validateEmail(email: string) { ... }
function isValidUser(user: User) { ... }

// Boolean variables: is/has/can prefix
const isLoading = true;
const hasPermission = false;
const canEdit = true;
```

### Classes and Interfaces

```typescript
// Classes: PascalCase
class UserService { ... }
class OrderRepository { ... }

// Interfaces: PascalCase, no 'I' prefix
interface User { ... }
interface CreateUserDTO { ... }

// Enums: PascalCase
enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}
```

---

## Code Organization

### Function Length

```typescript
// ✓ GOOD: Short, focused functions (< 30 lines)
async function processOrder(orderId: string): Promise<Order> {
  const order = await getOrder(orderId);
  validateOrder(order);
  await updateInventory(order);
  await sendConfirmation(order);
  return order;
}

// ✗ BAD: Long function doing too much
async function processOrder(orderId: string) {
  // 100+ lines of mixed concerns
}
```

### Single Responsibility

```typescript
// ✗ BAD: Multiple responsibilities
class UserManager {
  createUser() { ... }
  sendEmail() { ... }
  generateReport() { ... }
  logActivity() { ... }
}

// ✓ GOOD: Single responsibility
class UserService {
  createUser() { ... }
  updateUser() { ... }
  deleteUser() { ... }
}

class EmailService {
  sendWelcome() { ... }
  sendPasswordReset() { ... }
}
```

### Imports Organization

```typescript
// 1. Node.js built-ins
import { readFile } from 'fs/promises';
import path from 'path';

// 2. External packages (alphabetical)
import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

// 3. Internal modules (by path depth)
import { config } from '@/config';
import { UserService } from '@/services/userService';
import { logger } from '@/utils/logger';

// 4. Relative imports
import { validateInput } from './validators';
import type { CreateUserDTO } from './types';
```

---

## Error Handling

### Try-Catch

```typescript
// ✓ GOOD: Specific error handling
try {
  await saveUser(user);
} catch (error) {
  if (error instanceof ValidationError) {
    throw new BadRequestError(error.message);
  }
  if (error instanceof DuplicateKeyError) {
    throw new ConflictError('User already exists');
  }
  throw error; // Re-throw unknown errors
}
```

### Async Error Handling

```typescript
// ✓ GOOD: Express async handler wrapper
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

app.get('/users', asyncHandler(async (req, res) => {
  const users = await userService.findAll();
  res.json(users);
}));
```

---

## Documentation

### JSDoc Comments

```typescript
/**
 * Creates a new user in the system.
 * 
 * @param data - User creation data
 * @returns The created user
 * @throws {ValidationError} If email is invalid
 * @throws {ConflictError} If email already exists
 * 
 * @example
 * const user = await createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 */
async function createUser(data: CreateUserDTO): Promise<User> {
  // ...
}
```

### Inline Comments

```typescript
// ✓ GOOD: Explain WHY, not WHAT
// Use setTimeout to debounce rapid updates and prevent API flooding
setTimeout(() => saveData(), 300);

// ✗ BAD: Explains the obvious
// Set x to 5
const x = 5;
```

---

## Git Conventions

### Commit Messages

```
feat: add user authentication
fix: resolve login timeout issue
docs: update API documentation
refactor: simplify user validation logic
test: add unit tests for UserService
chore: update dependencies
perf: optimize database queries
style: fix linting errors
```

### Branch Naming

```
feature/user-authentication
fix/login-timeout
docs/api-documentation
refactor/user-validation
```

---

## Testing Standards

### Test Structure

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com' };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(result.email).toBe(userData.email);
    });
  });
});
```

### Test Naming

```typescript
// Pattern: should [expected] when [condition]
it('should return null when user not found', ...);
it('should throw ValidationError when email is empty', ...);
it('should send welcome email when user is created', ...);
```

---

## Linting and Formatting

### ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": "warn"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## Checklist

### Before Commit
- [ ] Code compiles without errors
- [ ] Linting passes
- [ ] Tests pass
- [ ] No TODOs or FIXMEs without tickets
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] Types are explicit (no `any`)
- [ ] Functions are documented
- [ ] Commit message follows convention
