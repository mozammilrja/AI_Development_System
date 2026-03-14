# Parallel Multi-Agent Orchestration

This directory contains documentation for the parallel multi-agent engineering system.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                              │
│                   "Build user authentication"                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TEAM LEAD AGENT                             │
│                                                                  │
│  1. Receive feature request                                      │
│  2. Decompose into atomic tasks                                  │
│  3. Write tasks to core/state/tasks.json                         │
│  4. Write human-readable tasks to core/tasks/backlog.md          │
│  5. Monitor progress                                             │
│  6. Handle failures                                              │
│  7. Generate completion report                                   │
│                                                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED TASK LIST                              │
│                  core/state/tasks.json                           │
│                                                                  │
│  {                                                               │
│    "task_id": "TASK-001",                                        │
│    "title": "Implement login API",                               │
│    "assigned_agent": null,                                       │
│    "status": "backlog",                                          │
│    "dependencies": [],                                           │
│    "priority": "high"                                            │
│  }                                                               │
│                                                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  BACKEND AGENT  │ │ FRONTEND AGENT  │ │    UI AGENT     │
│                 │ │                 │ │                 │
│  Worker Loop:   │ │  Worker Loop:   │ │  Worker Loop:   │
│  1. Read tasks  │ │  1. Read tasks  │ │  1. Read tasks  │
│  2. Find task   │ │  2. Find task   │ │  2. Find task   │
│  3. Claim       │ │  3. Claim       │ │  3. Claim       │
│  4. Work        │ │  4. Work        │ │  4. Work        │
│  5. Complete    │ │  5. Complete    │ │  5. Complete    │
│  6. Repeat      │ │  6. Repeat      │ │  6. Repeat      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    QA AGENT     │ │ SECURITY AGENT  │ │PERFORMANCE AGENT│
└─────────────────┘ └─────────────────┘ └─────────────────┘
        │
        ▼
┌─────────────────┐
│ REVIEWER AGENT  │
│  Final Review   │
└─────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETION REPORT                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Execution Flow

### Phase 1: Task Creation (Team Lead)

1. Team Lead receives feature request
2. Decomposes into atomic tasks
3. Assigns priorities and dependencies
4. Writes tasks to `core/state/tasks.json`
5. Creates readable entries in `core/tasks/backlog.md`

### Phase 2: Parallel Execution (Worker Agents)

All worker agents run **simultaneously**:

```
Backend Agent  ─────┬───► API implementation
Frontend Agent ─────┼───► UI implementation
UI Agent       ─────┼───► Design specs
QA Agent       ─────┼───► Test writing
Security Agent ─────┼───► Security audit
Performance    ─────┴───► Performance testing
```

Each agent executes the Worker Loop:
1. Read `core/state/tasks.json`
2. Find unclaimed task matching role
3. Claim task (set assigned_agent, status)
4. Perform work
5. Mark completed
6. Repeat

### Phase 3: Review and Completion

1. QA Agent validates tests passing
2. Security Agent confirms no critical issues
3. Reviewer Agent approves implementation
4. Team Lead generates final report

---

## Task States

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌───────────┐
│ backlog │ ──► │ claimed │ ──► │ working │ ──► │ completed │
└─────────┘     └─────────┘     └─────────┘     └───────────┘
     │               │               │               │
     │               │               │               │
   Task           Agent           Agent           Agent
   created        claims          works           finishes
```

### State Transitions

| From | To | Trigger |
|------|-----|---------|
| (new) | backlog | Team Lead creates task |
| backlog | claimed | Agent claims task |
| claimed | working | Agent starts work |
| working | completed | Agent finishes work |
| working | backlog | Agent fails, task reset |

---

## Task Schema

```json
{
  "task_id": "TASK-XXX",
  "title": "Short descriptive title",
  "description": "Detailed description of work",
  "assigned_agent": null | "backend" | "frontend" | etc,
  "status": "backlog" | "claimed" | "working" | "completed",
  "dependencies": ["TASK-YYY"],
  "priority": "critical" | "high" | "medium" | "low",
  "files": ["path/to/file.ts"],
  "created_at": "ISO-8601",
  "claimed_at": "ISO-8601",
  "completed_at": "ISO-8601",
  "feature_id": "FEAT-XXX"
}
```

---

## Dependency Management

Tasks can depend on other tasks:

```json
{
  "task_id": "TASK-005",
  "title": "Write auth tests",
  "dependencies": ["TASK-002", "TASK-003"]
}
```

Rules:
- Agent cannot claim task until all dependencies are `completed`
- Agents check dependency status before claiming
- Circular dependencies are forbidden

---

## Parallel Execution Rules

1. **No Waiting** — Agents never wait for others (except dependencies)
2. **Claim Before Work** — Always claim before starting
3. **Update Status** — Keep task status current
4. **Atomic Completion** — Finish fully before marking done
5. **Respect Dependencies** — Don't work on blocked tasks

---

## Files

| File | Purpose |
|------|---------|
| `core/state/tasks.json` | Authoritative task state |
| `core/tasks/backlog.md` | Human-readable backlog |
| `core/tasks/in-progress.md` | Active tasks |
| `core/tasks/completed.md` | Finished tasks |
| `core/state/progress.json` | Feature progress |
| `core/state/agents.json` | Agent status |
