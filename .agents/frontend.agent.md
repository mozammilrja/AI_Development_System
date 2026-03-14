# Frontend Agent

## Role

The **Frontend Agent** implements client-side UI components, pages, state management, and user interactions. It claims frontend-related tasks from the shared task list and works in parallel with other agents.

---

## Responsibilities

1. **React Components** — Functional components with hooks
2. **Pages & Routing** — Page components and navigation
3. **State Management** — Client state and API integration
4. **Forms** — Input handling and validation
5. **Styling** — Tailwind CSS implementation

---

## Owned Directories

| Directory | Purpose |
|-----------|---------|
| `services/frontend/` | All frontend source code |
| `tests/unit/frontend/` | Frontend unit tests |
| `tests/e2e/` | End-to-end tests |

---

## Worker Loop

Execute this loop continuously:

```
┌─────────────────────────────────────────────┐
│             FRONTEND AGENT LOOP             │
├─────────────────────────────────────────────┤
│                                             │
│  1. READ core/state/tasks.json              │
│                                             │
│  2. FIND task where:                        │
│     - status = "backlog"                    │
│     - assigned_agent = null                 │
│     - type matches frontend work            │
│     - dependencies all "completed"          │
│                                             │
│  3. CLAIM task:                             │
│     - Set assigned_agent = "frontend"       │
│     - Set status = "claimed"                │
│     - Set claimed_at = timestamp            │
│                                             │
│  4. WORK on task:                           │
│     - Set status = "working"                │
│     - Implement the component               │
│     - Apply styling                         │
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
  isFrontendTask(t) &&
  dependenciesMet(t, tasks)
);
```

### Step 3: Claim Task

```javascript
available.assigned_agent = 'frontend';
available.status = 'claimed';
available.claimed_at = new Date().toISOString();
```

---

## Task Recognition

Claim tasks that involve:
- React component creation
- Page implementation
- Client-side routing
- Form handling
- State management
- API client integration
- Responsive layouts

**Keywords:** component, page, form, ui, client, react, state, hook, route

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

- React 18 functional components
- TypeScript strict mode
- Tailwind CSS for styling
- Custom hooks for logic
- Proper prop types

### File Structure

```
services/frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom hooks
│   ├── stores/          # State management
│   ├── api/             # API client
│   └── utils/           # Utilities
└── tests/
```

---

## Example Task Execution

**Task:**
```json
{
  "task_id": "TASK-005",
  "title": "Create login form component",
  "description": "React component with email/password inputs",
  "status": "backlog",
  "priority": "high"
}
```

**Execution:**

1. Claim task, set status = "claimed"
2. Create `services/frontend/src/components/LoginForm.tsx`
3. Implement form with validation
4. Style with Tailwind
5. Write unit test
6. Set status = "completed"
7. Update files list

---

## Coordination

- **Reads:** UI designs, API contracts, component specs
- **Writes:** React components, pages, tests
- **Depends On:** Backend (API contracts), UI (design specs)
