# Architecture Patterns

Common architectural patterns and when to apply them in the AI Development System.

---

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │  UI, API endpoints
├─────────────────────────────────────────┤
│            Business Layer               │  Services, use cases
├─────────────────────────────────────────┤
│           Data Access Layer             │  Repositories, DAOs
├─────────────────────────────────────────┤
│              Data Layer                 │  Database, cache
└─────────────────────────────────────────┘
```

**When to use:** Standard web applications, clear separation needed

### Clean Architecture

```
┌─────────────────────────────────────────┐
│              Frameworks                 │  Express, React
├─────────────────────────────────────────┤
│          Interface Adapters             │  Controllers, Presenters
├─────────────────────────────────────────┤
│            Use Cases                    │  Application business rules
├─────────────────────────────────────────┤
│              Entities                   │  Enterprise business rules
└─────────────────────────────────────────┘
```

**Dependency Rule:** Inner layers know nothing about outer layers

---

## Service Patterns

### Service Layer Pattern

```typescript
// services/backend/src/services/userService.ts

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    // Business logic
    const user = await this.userRepository.create(data);
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}
```

### Repository Pattern

```typescript
// services/backend/src/repositories/userRepository.ts

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}

export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return User.findById(id);
  }
  // ...
}
```

---

## API Patterns

### Controller Pattern

```typescript
// services/backend/src/api/controllers/userController.ts

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: Request, res: Response): Promise<void> {
    const user = await this.userService.createUser(req.body);
    res.status(201).json({ data: user });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const user = await this.userService.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json({ data: user });
  }
}
```

### Middleware Pattern

```typescript
// services/backend/src/middleware/auth.ts

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    throw new UnauthorizedError('Missing token');
  }
  
  req.user = await verifyToken(token);
  next();
};
```

---

## Data Patterns

### DTO (Data Transfer Object)

```typescript
// services/backend/src/dto/user.dto.ts

export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  avatar?: string;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  // No password!
}
```

### Entity Pattern

```typescript
// services/backend/src/models/user.ts

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const userSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });
```

---

## Frontend Patterns

### Component Structure

```
components/
├── Button/
│   ├── Button.tsx        # Component
│   ├── Button.test.tsx   # Tests
│   ├── Button.styles.ts  # Styles
│   └── index.ts          # Export
```

### Container/Presenter Pattern

```typescript
// Container (smart component)
export const UserListContainer: React.FC = () => {
  const users = useUsers();
  const handleDelete = useCallback((id) => { ... }, []);
  
  return <UserList users={users} onDelete={handleDelete} />;
};

// Presenter (dumb component)
export const UserList: React.FC<Props> = ({ users, onDelete }) => (
  <ul>
    {users.map(user => (
      <UserItem key={user.id} user={user} onDelete={onDelete} />
    ))}
  </ul>
);
```

### Custom Hook Pattern

```typescript
// services/frontend/src/hooks/useUsers.ts

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}
```

---

## State Management Patterns

### Zustand Store Pattern

```typescript
// services/frontend/src/stores/userStore.ts

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (credentials) => {
    const user = await authService.login(credentials);
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  }
}));
```

---

## Error Handling Patterns

### Custom Error Classes

```typescript
// services/backend/src/errors/index.ts

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public details: ValidationDetail[]
  ) {
    super(message, 422, 'VALIDATION_ERROR');
  }
}
```

### Global Error Handler

```typescript
// services/backend/src/middleware/errorHandler.ts

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  // Unknown error
  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
```

---

## Dependency Injection Pattern

```typescript
// services/backend/src/container.ts

import { Container } from 'inversify';

const container = new Container();

// Repositories
container.bind(UserRepository).to(MongoUserRepository);

// Services
container.bind(UserService).toSelf();
container.bind(EmailService).to(SendGridEmailService);

export { container };
```

---

## Design Principles

### SOLID

| Principle | Description |
|-----------|-------------|
| **S**ingle Responsibility | One reason to change |
| **O**pen/Closed | Open for extension, closed for modification |
| **L**iskov Substitution | Subtypes replaceable for parent types |
| **I**nterface Segregation | Many specific interfaces over one general |
| **D**ependency Inversion | Depend on abstractions, not concretions |

### DRY, KISS, YAGNI

- **DRY** — Don't Repeat Yourself
- **KISS** — Keep It Simple, Stupid
- **YAGNI** — You Aren't Gonna Need It

---

## When to Apply Patterns

| Pattern | Use When |
|---------|----------|
| Repository | Database abstraction needed |
| Service | Business logic reuse |
| DTO | Data transformation between layers |
| Factory | Complex object creation |
| Strategy | Multiple algorithms, runtime selection |
| Observer | Event-driven communication |
| Middleware | Cross-cutting concerns (auth, logging) |
