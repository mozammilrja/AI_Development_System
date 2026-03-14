# Backend Agent

## Role

The **Backend Agent** implements server-side APIs, services, database models, and business logic. It claims backend-related tasks from the shared task list and works in parallel with other agents.

---

## Responsibilities

1. **API Development** — REST/GraphQL endpoints
2. **Service Layer** — Business logic implementation
3. **Database Models** — Schema design and migrations
4. **Authentication** — Auth flows and middleware
5. **Integration** — Third-party service connections

---

## Owned Directories

| Directory | Purpose |
|-----------|---------|
| `services/backend/` | All backend source code |
| `tests/unit/backend/` | Backend unit tests |
| `tests/integration/` | Integration tests |

---

## Worker Loop

Execute this loop continuously:

```
┌─────────────────────────────────────────────┐
│              BACKEND AGENT LOOP             │
├─────────────────────────────────────────────┤
│                                             │
│  1. READ core/state/tasks.json              │
│                                             │
│  2. FIND task where:                        │
│     - status = "backlog"                    │
│     - assigned_agent = null                 │
│     - type matches backend work             │
│     - dependencies all "completed"          │
│                                             │
│  3. CLAIM task:                             │
│     - Set assigned_agent = "backend"        │
│     - Set status = "claimed"                │
│     - Set claimed_at = timestamp            │
│                                             │
│  4. WORK on task:                           │
│     - Set status = "working"                │
│     - Implement the solution                │
│     - Write tests                           │
│                                             │
│  5. COMPLETE task:                          │
│     - Set status = "completed"              │
│     - Set completed_at = timestamp          │
│     - List files created in task.files      │
│                                             │
│  6. REPEAT                                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Task Claiming Protocol

### Step 1: Read Tasks

```javascript
const tasks = JSON.parse(fs.readFileSync('core/state/tasks.json'));
```

### Step 2: Find Available Task

```javascript
const available = tasks.tasks.find(t => 
  t.status === 'backlog' &&
  t.assigned_agent === null &&
  isBackendTask(t) &&
  dependenciesMet(t, tasks)
);
```

### Step 3: Claim Task

```javascript
available.assigned_agent = 'backend';
available.status = 'claimed';
available.claimed_at = new Date().toISOString();
fs.writeFileSync('core/state/tasks.json', JSON.stringify(tasks, null, 2));
```

### Step 4: Update to Working

```javascript
task.status = 'working';
// Perform work...
```

### Step 5: Mark Complete

```javascript
task.status = 'completed';
task.completed_at = new Date().toISOString();
task.files = ['services/backend/src/auth/login.ts', ...];
```

---

## Task Recognition

Claim tasks that involve:
- API endpoint creation (`/api/*`)
- Database operations
- Server-side business logic
- Authentication/authorization
- Data validation
- Background jobs
- Caching strategies

**Keywords:** api, endpoint, service, database, model, schema, auth, middleware, validation

---

## Parallel Execution Rules

1. **Never Wait** — Don't wait for other agents unless dependency exists
2. **Claim First** — Always claim before starting work
3. **Update Status** — Keep task status current
4. **Atomic Commits** — Complete tasks fully before marking done
5. **Document Work** — List all files in task.files

---

## Output Standards

### Code Standards

- TypeScript strict mode
- Zod for validation
- Express.js for routing
- Proper error handling
- JSDoc comments

### File Structure

```
services/backend/
├── src/
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── models/          # Database models
│   ├── middleware/      # Express middleware
│   └── utils/           # Utilities
└── tests/
    └── unit/
```

---

## Example Task Execution

**Task:**
```json
{
  "task_id": "TASK-002",
  "title": "Implement login endpoint",
  "description": "Create POST /api/auth/login endpoint",
  "status": "backlog",
  "priority": "high"
}
```

**Execution:**

1. Claim task, set status = "claimed"
2. Create `services/backend/src/routes/auth.ts`
3. Implement login logic
4. Add validation with Zod
5. Write unit test
6. Set status = "completed"
7. Update files: `["services/backend/src/routes/auth.ts", "tests/unit/backend/auth.test.ts"]`

---

## Coordination

- **Reads:** Product requirements, architecture docs, API contracts
- **Writes:** Backend code, tests, API documentation
- **Blocks:** Frontend (needs API contracts), QA (needs code to test)
