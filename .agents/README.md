# Agent Definitions

This directory contains the role definitions for the **parallel multi-agent engineering system**.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      TEAM LEAD AGENT                         │
│  - Receives feature requests                                 │
│  - Decomposes into tasks                                     │
│  - Populates shared task list                                │
│  - Monitors progress                                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  SHARED TASK LIST                            │
│                core/state/tasks.json                         │
│  - Tasks with status: backlog | claimed | working | completed│
│  - Agents claim tasks from this file                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   BACKEND   │   │  FRONTEND   │   │     UI      │
│    AGENT    │   │    AGENT    │   │    AGENT    │
├─────────────┤   ├─────────────┤   ├─────────────┤
│     QA      │   │  SECURITY   │   │ PERFORMANCE │
│    AGENT    │   │    AGENT    │   │    AGENT    │
├─────────────┤   └─────────────┘   └─────────────┘
│  REVIEWER   │
│    AGENT    │
└─────────────┘
         ALL AGENTS RUN IN PARALLEL
```

## Agents

| Agent | File | Role |
|-------|------|------|
| **Team Lead** | `team-lead.agent.md` | Coordinator, task creation |
| **Backend** | `backend.agent.md` | APIs, services, database |
| **Frontend** | `frontend.agent.md` | React components, pages |
| **UI** | `ui.agent.md` | Design specs, tokens |
| **QA** | `qa.agent.md` | Tests, quality assurance |
| **Security** | `security.agent.md` | Security audits |
| **Performance** | `performance.agent.md` | Benchmarks, optimization |
| **Reviewer** | `reviewer.agent.md` | Final code review |

## Worker Loop

All worker agents execute the same loop:

```
1. READ core/state/tasks.json
2. FIND unclaimed task matching agent type
3. CLAIM task (set assigned_agent, status="claimed")
4. WORK on task (set status="working")
5. COMPLETE task (set status="completed")
6. REPEAT
```

## Parallel Execution

Agents work **simultaneously**:

- Backend builds API while Frontend builds UI
- QA writes tests while Security audits code
- All agents claim tasks independently
- No agent waits for another unless dependency exists

## Task Schema

```json
{
  "task_id": "TASK-XXX",
  "title": "Task title",
  "description": "Detailed description",
  "assigned_agent": null,
  "status": "backlog | claimed | working | completed",
  "dependencies": ["TASK-YYY"],
  "priority": "critical | high | medium | low",
  "files": []
}
```
