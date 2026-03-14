# Task Backlog

Tasks waiting to be claimed by parallel worker agents.

---

## Task Claiming Protocol

1. Agent reads `core/state/tasks.json`
2. Agent finds task where:
   - `status = "backlog"`
   - `assigned_agent = null`
   - Task type matches agent role
   - All `dependencies` are `completed`
3. Agent claims task by setting:
   - `assigned_agent = "<agent-name>"`
   - `status = "claimed"`
   - `claimed_at = <timestamp>`
4. Agent moves task to `in-progress.md`

---

## Backlog Format

```markdown
### [TASK-XXX] Task Title

- **Agent Type:** backend | frontend | ui | qa | security | performance | reviewer
- **Priority:** critical | high | medium | low
- **Dependencies:** TASK-YYY, TASK-ZZZ
- **Files:** path/to/expected/output

**Description:**
What needs to be done.

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
```

---

## Unclaimed Tasks

> No tasks in backlog. Team Lead creates tasks when a feature is requested.

---

## Example Tasks

When Team Lead decomposes a feature request, it creates tasks like:

### [TASK-001] Design auth API contract
- **Agent Type:** backend
- **Priority:** high
- **Dependencies:** none
- **Files:** docs/api/auth-contract.md

### [TASK-002] Implement login endpoint
- **Agent Type:** backend
- **Priority:** high
- **Dependencies:** TASK-001
- **Files:** services/backend/src/routes/auth.ts

### [TASK-003] Create login form component
- **Agent Type:** frontend
- **Priority:** high
- **Dependencies:** TASK-001
- **Files:** services/frontend/src/components/LoginForm.tsx

### [TASK-004] Design login UI mockup
- **Agent Type:** ui
- **Priority:** high
- **Dependencies:** none
- **Files:** ui/components/login-form.md
