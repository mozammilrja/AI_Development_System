# core/tasks/

## Purpose

Task management system for the multi-agent AI development platform. Tasks flow through states as agents claim and complete work.

## Task Board

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   BACKLOG   │────▶│ IN-PROGRESS │────▶│  COMPLETED  │
│ backlog.md  │     │in-progress.md    │completed.md │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
   Unclaimed          Active work         Archive
   tasks              by agents           & history
```

## Files

| File | Purpose |
|------|---------|
| `backlog.md` | Tasks waiting to be claimed |
| `in-progress.md` | Tasks actively being worked on |
| `completed.md` | Finished tasks archive |

## Task Format

```markdown
### [TASK-XXX] Task Title

- **Feature:** FEAT-XXX or standalone
- **Owner:** agent-name (or unclaimed)
- **Status:** backlog | in-progress | blocked | completed
- **Priority:** critical | high | medium | low
- **Dependencies:** TASK-XXX, TASK-YYY (or none)
- **Deliverables:** path/to/expected/output

**Description:**
Detailed description of what needs to be done.

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
```

## Task Fields

| Field | Description |
|-------|-------------|
| **Task ID** | Unique identifier: `TASK-001`, `TASK-002`, etc. |
| **Feature** | Parent feature ID (`FEAT-XXX`) or `standalone` |
| **Owner** | Agent responsible: `backend-engineer`, `architect`, etc. |
| **Status** | Current state: `backlog`, `in-progress`, `blocked`, `completed` |
| **Priority** | Urgency: `critical`, `high`, `medium`, `low` |
| **Dependencies** | Task IDs that must complete first |
| **Deliverables** | Expected output files/artifacts |

## Workflow

### 1. Claiming a Task

```
Agent reads backlog.md
    │
    ▼
Find task matching role ─────────────────┐
    │                                    │
    ▼                                    │
Check dependencies completed? ──No──────▶│ Wait
    │                                    │
   Yes                                   │
    │                                    │
    ▼                                    │
Move task to in-progress.md              │
    │                                    │
    ▼                                    │
Update agents.json (status: working)     │
    │                                    │
    ▼                                    │
Update tasks.json                        │
```

### 2. Working on a Task

1. Update progress in `in-progress.md`
2. Create deliverables in owned directories
3. If blocked, mark blocker and wait

### 3. Completing a Task

1. Verify all acceptance criteria met
2. Move task to `completed.md`
3. Update `agents.json` (status: idle)
4. Update `tasks.json` and `progress.json`
5. Dependent tasks can now be claimed

## Agent Ownership

| Agent | Can Claim Tasks Related To |
|-------|---------------------------|
| Product Manager | Requirements, user stories |
| Architect | System design, API contracts |
| Backend Engineer | APIs, services, database |
| Frontend Engineer | UI components, pages |
| UI Designer | Design system, visuals |
| DevOps Engineer | Infrastructure, deployment |
| Security Engineer | Security audits, policies |
| QA Engineer | Testing, quality assurance |
| Performance Engineer | Benchmarks, optimization |
| Reviewer | Code review tasks |

## Synchronization

Task board files (`backlog.md`, `in-progress.md`, `completed.md`) work alongside JSON state:

- **Markdown files**: Human-readable task details
- **JSON files**: Machine-readable state for coordination

Keep both in sync when updating task status.
