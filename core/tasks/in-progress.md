# Tasks In Progress

Tasks currently being worked on by parallel agents.

---

## Status Update Protocol

When an agent claims a task:

1. Move task entry from `backlog.md` to this file
2. Update `core/state/tasks.json`:
   - Set `status = "working"`
3. Begin implementation

When work is complete:

1. Move task entry to `completed.md`
2. Update `core/state/tasks.json`:
   - Set `status = "completed"`
   - Set `completed_at = <timestamp>`
   - Update `files` with created/modified files

---

## Active Tasks Format

```markdown
### [TASK-XXX] Task Title

- **Agent:** backend | frontend | ui | qa | security | performance | reviewer
- **Status:** working
- **Started:** ISO-8601 timestamp
- **Progress:** Description of current work

**Current Activity:**
What the agent is doing now.
```

---

## Currently Working

> No tasks in progress. Agents will move tasks here when claimed.

---

## Parallel Execution

Multiple agents can have tasks in progress simultaneously:

```
[Backend Agent]    → TASK-002: Implementing login API
[Frontend Agent]   → TASK-003: Building login form
[UI Agent]         → TASK-004: Designing UI mockup
[QA Agent]         → TASK-007: Writing unit tests
```

All agents work independently and concurrently.
