# Agent Protocol

Rules and procedures for agent operation within the AI development system. All agents must follow this protocol to ensure coordination and consistency.

## Core Principles

1. **Autonomous Operation** — Agents work independently without direct communication
2. **Repository Coordination** — All coordination happens through file updates
3. **Exclusive Ownership** — Agents only write to directories they own
4. **State Synchronization** — Always update state files when status changes
5. **Dependency Respect** — Never start work until dependencies are complete

---

## Agent Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENT OPERATION LOOP                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐         │
│    │  CHECK   │────▶│  CLAIM   │────▶│  WORK    │────▶│ COMPLETE │         │
│    │  TASKS   │     │  TASK    │     │  ON TASK │     │  TASK    │         │
│    └──────────┘     └──────────┘     └──────────┘     └──────────┘         │
│         │                                                   │               │
│         │                                                   │               │
│         └───────────────────◀───────────────────────────────┘               │
│                           (loop until no tasks)                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Protocol Steps

### Step 1: Check for Tasks

**Trigger:** Agent enters `idle` state or completes a task

**Actions:**

1. Read `core/tasks/backlog.md`
2. Filter tasks by:
   - Agent ownership (matches your role)
   - Status = `backlog`
   - All dependencies `completed`
3. Select highest priority task
4. If no tasks available, remain `idle`

**State Update:**
```json
// core/state/agents.json
{
  "agent-name": {
    "status": "idle",
    "lastActivity": "2026-03-14T10:00:00Z",
    "lastAction": "Checking for available tasks"
  }
}
```

### Step 2: Claim Task

**Trigger:** Found available task in backlog

**Actions:**

1. Verify task still available (not claimed by another agent)
2. Move task from `backlog.md` to `in-progress.md`
3. Update task status to `in-progress`
4. Update task `startedAt` timestamp
5. Update agent status to `working`

**State Updates:**

```json
// core/state/tasks.json - Update task
{
  "id": "TASK-001",
  "status": "in-progress",
  "assignedAgent": "backend-engineer",
  "startedAt": "2026-03-14T10:05:00Z"
}
```

```json
// core/state/agents.json - Update agent
{
  "backend-engineer": {
    "status": "working",
    "currentTask": "TASK-001",
    "currentFeature": "FEAT-001",
    "lastActivity": "2026-03-14T10:05:00Z",
    "lastAction": "Claimed TASK-001: Implement auth endpoints"
  }
}
```

### Step 3: Work on Task

**Trigger:** Task claimed successfully

**Actions:**

1. Read task description and acceptance criteria
2. Read relevant context files:
   - `docs/architecture.md` for contracts
   - `knowledge/` for guidelines
   - Related completed tasks for context
3. Perform work in owned directories only
4. Update progress periodically
5. If blocked, follow blocking protocol

**Progress Update (in `in-progress.md`):**
```markdown
### [TASK-001] Implement Auth Endpoints

- **Feature:** FEAT-001
- **Owner:** backend-engineer
- **Status:** in-progress
- **Started:** 2026-03-14 10:05

**Progress:**
- [x] Set up auth routes
- [x] Implement login endpoint
- [ ] Implement logout endpoint
- [ ] Add JWT middleware

**Current:** Implementing logout endpoint
```

### Step 4: Complete Task

**Trigger:** All acceptance criteria met

**Actions:**

1. Verify all deliverables created
2. Verify tests passing (if applicable)
3. Move task from `in-progress.md` to `completed.md`
4. Update task status to `completed`
5. Update `progress.json` with deliverables
6. Update agent status to `idle`
7. Return to Step 1

**State Updates:**

```json
// core/state/tasks.json
{
  "id": "TASK-001",
  "status": "completed",
  "completedAt": "2026-03-14T14:30:00Z"
}
```

```json
// core/state/progress.json - Update feature phase
{
  "features": [{
    "id": "FEAT-001",
    "phases": {
      "backend": {
        "status": "completed",
        "agent": "backend-engineer",
        "completedAt": "2026-03-14T14:30:00Z"
      }
    }
  }]
}
```

---

## Blocking Protocol

When work cannot continue:

### Declaring a Block

1. Update task status to `blocked`
2. Document blocker in `in-progress.md`
3. Update agent status to `blocked`
4. Set `waitingFor` field to blocking agent/resource

```json
// core/state/agents.json
{
  "frontend-engineer": {
    "status": "blocked",
    "currentTask": "TASK-005",
    "blockedReason": "Waiting for API contract",
    "waitingFor": "architect"
  }
}
```

### Unblocking

1. Blocking agent completes blocker task
2. Blocked agent detects completion via state files
3. Blocked agent clears block status
4. Resume work on task

---

## Parallel Execution Rules

When multiple agents work simultaneously:

### Independence
- Each agent works in their owned directories
- No direct file conflicts possible
- Coordination through contracts only

### Synchronization Points
- API contracts in `docs/architecture.md`
- Data schemas in `docs/architecture.md`
- UI components in `ui/`

### Conflict Resolution
If both agents need the same resource:
1. First agent to update state wins
2. Second agent reads updated state
3. Second agent adapts to changes

---

## Communication via Files

Agents communicate exclusively through repository files:

| Communication | File Location |
|---------------|---------------|
| Requirements | `knowledge/product.md` |
| Architecture | `docs/architecture.md` |
| Task status | `core/tasks/*.md`, `core/state/tasks.json` |
| Agent status | `core/state/agents.json` |
| Progress | `core/state/progress.json` |
| Blockers | `core/tasks/in-progress.md` |
| Reviews | `docs/reviews/` |
| Security | `security/audits/` |

---

## State File Responsibilities

| File | Who Reads | Who Writes |
|------|-----------|------------|
| `tasks.json` | All agents | All agents (own tasks) |
| `agents.json` | All agents | Each agent (own status) |
| `progress.json` | All agents | Agents completing phases |
| `backlog.md` | All agents | Product Manager, QA |
| `in-progress.md` | All agents | Working agents |
| `completed.md` | All agents | Completing agents |

---

## Timing and Polling

Since agents operate asynchronously:

### Poll Intervals
- **Task check:** Every operation cycle
- **Dependency check:** Before starting task
- **Block check:** Continuous while blocked

### Timestamps
All state updates must include timestamps:
- `lastActivity`: When agent last acted
- `startedAt`: When task began
- `completedAt`: When task finished

---

## Error Handling

| Situation | Agent Action |
|-----------|-------------|
| Task not found | Log error, return to idle |
| File conflict | Retry with fresh state read |
| Invalid state | Report error, await fix |
| Dependency missing | Mark blocked, wait |
| Test failure | Mark task blocked, report |

---

## Agent Checklist

Before each action, verify:

- [ ] Reading latest state (not cached)
- [ ] Working in owned directories only
- [ ] Dependencies are complete
- [ ] State files updated after changes
- [ ] Timestamps are current
- [ ] Task format follows schema

---

## Example Agent Run

```
[10:00:00] backend-engineer: Checking backlog...
[10:00:01] backend-engineer: Found TASK-001 (dependencies satisfied)
[10:00:02] backend-engineer: Claiming TASK-001
[10:00:03] backend-engineer: Updated tasks.json, agents.json
[10:00:04] backend-engineer: Reading architecture.md for API contract
[10:00:05] backend-engineer: Starting implementation...
[10:30:00] backend-engineer: Progress update - 2/4 endpoints done
[11:00:00] backend-engineer: All endpoints implemented
[11:00:01] backend-engineer: Running unit tests...
[11:05:00] backend-engineer: Tests passing
[11:05:01] backend-engineer: Marking TASK-001 complete
[11:05:02] backend-engineer: Updated tasks.json, progress.json
[11:05:03] backend-engineer: Status: idle, checking for next task...
```
