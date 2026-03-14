# Completed Tasks

Tasks that have been finished by agents.

---

## Completion Protocol

When an agent finishes a task:

1. Update `core/state/tasks.json`:
   - Set `status = "completed"`
   - Set `completed_at = <timestamp>`
   - List all `files` created/modified
2. Move task entry from `in-progress.md` to this file
3. Return to worker loop to claim next task

---

## Completed Task Format

```markdown
### [TASK-XXX] Task Title ✓

- **Agent:** backend
- **Completed:** ISO-8601 timestamp
- **Duration:** X minutes

**Files Created:**
- path/to/file1.ts
- path/to/file2.ts

**Summary:**
Brief description of what was done.
```

---

## Completed Tasks

> No completed tasks yet.

---

## Completion Tracking

Team Lead monitors this file to track feature progress:

```
Feature: User Authentication (FEAT-001)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Completed: 7/10 tasks

✓ TASK-001: Design auth API contract (backend)
✓ TASK-002: Implement login endpoint (backend)
✓ TASK-003: Implement logout endpoint (backend)
✓ TASK-004: Create login form component (frontend)
✓ TASK-005: Design login UI mockup (ui)
✓ TASK-006: Write auth unit tests (qa)
✓ TASK-007: Security audit auth flow (security)
○ TASK-008: Performance test auth (performance) - in progress
○ TASK-009: Final code review (reviewer) - blocked
○ TASK-010: Integration tests (qa) - backlog
```
