# Build Feature Command

Build the feature: **$ARGUMENTS**

---

## Execution Model

This command activates the **parallel multi-agent system** where the Team Lead coordinates multiple worker agents executing simultaneously.

---

## Team Lead Workflow

### Step 1: Receive Request

Parse feature request: "$ARGUMENTS"

Identify:
- Core functionality
- UI/UX requirements  
- API requirements
- Testing requirements
- Security considerations

### Step 2: Decompose Into Tasks

Break feature into atomic tasks. Create entries for:

| Agent | Task Type |
|-------|-----------|
| backend | API endpoints, services, database |
| frontend | React components, pages, state |
| ui | Design specs, mockups, tokens |
| qa | Unit tests, integration tests, E2E |
| security | Security audit, vulnerability scan |
| performance | Benchmarks, load tests |
| reviewer | Final code review |

### Step 3: Create Tasks

Write tasks to `core/state/tasks.json`:

```json
{
  "tasks": [
    {
      "task_id": "TASK-001",
      "title": "Design API contract for $ARGUMENTS",
      "description": "Define REST API endpoints and data models",
      "assigned_agent": null,
      "status": "backlog",
      "dependencies": [],
      "priority": "high",
      "files": [],
      "feature_id": "FEAT-XXX"
    }
  ]
}
```

Also write to `core/tasks/backlog.md`.

### Step 4: Spawn Worker Agents

Signal to all worker agents that tasks are available:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARALLEL AGENT SPAWN                          │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   BACKEND    │   FRONTEND   │      UI      │         QA         │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│   SECURITY   │  PERFORMANCE │   REVIEWER   │                    │
└──────────────┴──────────────┴──────────────┴────────────────────┘
                      ALL START SIMULTANEOUSLY
```

### Step 5: Monitor Progress

Poll `core/state/tasks.json` for status updates:
- Count tasks by status
- Identify blocked tasks
- Track completion percentage

### Step 6: Generate Report

When all tasks complete:
- Compile results
- List files created
- Report issues found

---

## Worker Agent Loop

Each worker agent executes:

```
┌─────────────────────────────────────────┐
│           WORKER AGENT LOOP             │
├─────────────────────────────────────────┤
│                                         │
│  1. READ core/state/tasks.json          │
│                                         │
│  2. FIND task where:                    │
│     - status = "backlog"                │
│     - assigned_agent = null             │
│     - matches agent type                │
│     - dependencies completed            │
│                                         │
│  3. CLAIM task                          │
│     - assigned_agent = self             │
│     - status = "claimed"                │
│                                         │
│  4. WORK on task                        │
│     - status = "working"                │
│     - implement solution                │
│                                         │
│  5. COMPLETE task                       │
│     - status = "completed"              │
│     - update files list                 │
│                                         │
│  6. REPEAT                              │
│                                         │
└─────────────────────────────────────────┘
```

---

## Parallel Execution Rules

1. **No Sequential Phases** — All agents start immediately
2. **No Waiting** — Agents don't wait (except dependencies)
3. **Claim First** — Always claim before working
4. **Update Status** — Keep task state current
5. **Respect Dependencies** — Don't work on blocked tasks

---

## Example Task Decomposition

**Feature:** "User Authentication with JWT"

| Task ID | Title | Agent | Priority | Dependencies |
|---------|-------|-------|----------|--------------|
| TASK-001 | Design auth API contract | backend | high | - |
| TASK-002 | Implement login endpoint | backend | high | TASK-001 |
| TASK-003 | Implement logout endpoint | backend | medium | TASK-001 |
| TASK-004 | Implement token refresh | backend | high | TASK-001 |
| TASK-005 | Create login form | frontend | high | TASK-001 |
| TASK-006 | Design login UI mockup | ui | high | - |
| TASK-007 | Write auth unit tests | qa | medium | TASK-002 |
| TASK-008 | Security audit auth | security | high | TASK-002, TASK-004 |
| TASK-009 | Performance test auth | performance | medium | TASK-002 |
| TASK-010 | Final code review | reviewer | low | TASK-007, TASK-008 |

---

## Completion Criteria

Feature is complete when:
- All tasks have status `completed`
- QA agent reports tests passing
- Security agent reports no critical issues
- Reviewer agent approves implementation

---

## Output

Generate final report showing:
- Tasks completed: X/Y
- Files created: [list]
- Test results: pass/fail
- Security findings: X critical, Y medium
- Review status: approved/changes requested
