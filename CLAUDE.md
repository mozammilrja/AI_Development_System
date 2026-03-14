# AI Development System

## Overview

A **parallel multi-agent software engineering platform** where one **Team Lead** coordinates multiple **worker agents** executing simultaneously through a **shared task list**.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      TEAM LEAD AGENT                             │
│  - Receives feature requests                                     │
│  - Decomposes into tasks                                         │
│  - Populates shared task list                                    │
│  - Monitors progress                                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED TASK LIST                              │
│                  core/state/tasks.json                           │
│                                                                  │
│  Task States: backlog → claimed → working → completed            │
│  Agents claim tasks from this file                               │
│                                                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   BACKEND   │   │  FRONTEND   │   │     UI      │
│    AGENT    │   │    AGENT    │   │    AGENT    │
├─────────────┤   ├─────────────┤   ├─────────────┤
│     QA      │   │  SECURITY   │   │ PERFORMANCE │
│    AGENT    │   │    AGENT    │   │    AGENT    │
├─────────────┴───┴─────────────┴───┴─────────────┤
│                  REVIEWER AGENT                  │
└─────────────────────────────────────────────────┘
              ALL AGENTS RUN IN PARALLEL
```

## The Agent Team

| Agent | File | Role |
|-------|------|------|
| **Team Lead** | `.agents/team-lead.agent.md` | Coordinator, task creation, monitoring |
| **Backend** | `.agents/backend.agent.md` | APIs, services, database |
| **Frontend** | `.agents/frontend.agent.md` | React components, pages |
| **UI** | `.agents/ui.agent.md` | Design specs, tokens |
| **QA** | `.agents/qa.agent.md` | Tests, quality assurance |
| **Security** | `.agents/security.agent.md` | Security audits |
| **Performance** | `.agents/performance.agent.md` | Benchmarks, optimization |
| **Reviewer** | `.agents/reviewer.agent.md` | Final code review |

## Execution Model

### Parallel Execution

All worker agents run **simultaneously**:

1. **Team Lead** receives feature request
2. **Team Lead** decomposes into tasks
3. **Team Lead** writes tasks to `core/state/tasks.json`
4. **Worker Agents** claim tasks from shared list
5. **All Agents** work in parallel
6. **Team Lead** monitors and generates report

### Worker Agent Loop

Every worker agent executes:

```
1. READ core/state/tasks.json
2. FIND unclaimed task matching agent type
3. CLAIM task (set assigned_agent, status="claimed")
4. WORK on task (set status="working")
5. COMPLETE task (set status="completed")
6. REPEAT
```

### Task Schema

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

## Directory Structure

```
AI_DEVELOPMENT_SYSTEM/
├── .agents/              # Agent definitions
│   ├── team-lead.agent.md
│   ├── backend.agent.md
│   ├── frontend.agent.md
│   ├── ui.agent.md
│   ├── qa.agent.md
│   ├── security.agent.md
│   ├── performance.agent.md
│   └── reviewer.agent.md
├── .claude/              # Commands and config
│   └── commands/         # Slash commands
├── core/                 # Orchestration engine
│   ├── orchestration/    # Workflow docs
│   ├── state/            # Shared state
│   │   ├── tasks.json    # SHARED TASK LIST
│   │   ├── agents.json   # Agent status
│   │   └── progress.json # Feature progress
│   └── tasks/            # Task board (markdown)
│       ├── backlog.md
│       ├── in-progress.md
│       └── completed.md
├── services/             # Application code
│   ├── backend/          # Backend (Backend Agent)
│   └── frontend/         # Frontend (Frontend Agent)
├── ui/                   # Design system (UI Agent)
├── security/             # Security (Security Agent)
├── tests/                # Tests (QA Agent)
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── security/
│   └── benchmarks/       # Performance Agent
├── reviews/              # Reviews (Reviewer Agent)
├── platform/             # Infrastructure
├── knowledge/            # Knowledge base
└── docs/                 # Documentation
```

## Commands

| Command | Description |
|---------|-------------|
| `/build-feature <name>` | Build feature with parallel agents |
| `/code-review` | Multi-perspective code review |
| `/deploy-app --env <env>` | Deploy to staging/production |

## Parallel Execution Rules

1. **Agents run concurrently** — Backend, Frontend, UI, QA work at same time
2. **Claim before work** — Agents must claim tasks first
3. **Respect dependencies** — Don't work on blocked tasks
4. **Update status** — Keep task state current
5. **Coordinate via files** — No direct agent communication

## Agent Ownership

| Agent | Owns |
|-------|------|
| Backend | `services/backend/`, `tests/unit/backend/` |
| Frontend | `services/frontend/`, `tests/unit/frontend/` |
| UI | `ui/` |
| QA | `tests/` |
| Security | `security/` |
| Performance | `tests/benchmarks/` |
| Reviewer | `reviews/` |

## Context Priority

When working on tasks, prioritize:
1. Current task from `core/state/tasks.json`
2. Agent ownership rules
3. Feature dependencies
4. Knowledge base guidelines
5. Existing code patterns

## Coding Conventions

- **TypeScript**: Strict mode, functional style
- **React**: Functional components, hooks
- **Testing**: Jest for unit/integration, Playwright for E2E
- **CSS**: Tailwind CSS
