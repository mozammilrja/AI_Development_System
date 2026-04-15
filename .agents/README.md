# AI Agent Team

This directory contains the agent definitions for the PRD-driven autonomous development system.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TEAM LEAD                                    │
│  - Reads PRD files from prd/                                        │
│  - Extracts features and requirements                               │
│  - Generates development tasks                                       │
│  - Monitors progress                                                 │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SHARED TASK STATE                                │
│                   core/state/tasks.json                              │
│                                                                      │
│  Task States: ready → working → done                                 │
│  Agents claim tasks from shared state                                │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  ARCHITECT  │   │  DATABASE   │   │  BACKEND    │
│             │   │  ENGINEER   │   │  ENGINEER   │
├─────────────┤   ├─────────────┤   ├─────────────┤
│  FRONTEND   │   │ UI DESIGNER │   │   DEVOPS    │
│  ENGINEER   │   │             │   │  ENGINEER   │
├─────────────┤   ├─────────────┤   ├─────────────┤
│     QA      │   │  SECURITY   │   │ PERFORMANCE │
│  ENGINEER   │   │  ENGINEER   │   │  ENGINEER   │
├─────────────┴───┴─────────────┴───┴─────────────┤
│                    REVIEWER                      │
└─────────────────────────────────────────────────┘
              ALL AGENTS RUN IN PARALLEL
```

## Agent Roster

| Agent | File | Role | Task Type |
|-------|------|------|-----------|
| **Team Lead** | `team-lead.agent.md` | PRD parsing, task generation | coordinator |
| **Architect** | `architect.agent.md` | System design | architecture |
| **Backend** | `backend.agent.md` | APIs, services | backend |
| **Frontend** | `frontend.agent.md` | React components | frontend |
| **UI Designer** | `ui-designer.agent.md` | Design system | ui |
| **Database** | `database.agent.md` | Schema, migrations | database |
| **DevOps** | `devops.agent.md` | Infrastructure | devops |
| **QA** | `qa.agent.md` | Testing | testing |
| **Security** | `security.agent.md` | Security audits | security |
| **Performance** | `performance.agent.md` | Benchmarks | performance |
| **Reviewer** | `reviewer.agent.md` | Code review | review |

## Task Flow

```
ready.json ──► Agent Claims ──► working.json ──► Agent Completes ──► done.json
```

## Worker Agent Protocol

Every worker agent follows this loop:

```
1. READ core/state/tasks.json
2. FIND task where:
   - type matches agent specialty
   - status = "ready"
   - assigned_agent = null
   - all dependencies completed
3. CLAIM task:
   - SET assigned_agent = "<agent-name>"
   - SET status = "working"
4. IMPLEMENT task
5. COMPLETE task:
   - SET status = "done"
   - ADD files created
6. REPEAT until no matching tasks
```

## Task Dependencies

```
Architecture
    │
    ├──► Database ──► Backend ──► Frontend
    │                    │           │
    └──► UI Design ──────┴───────────┤
                                     │
DevOps ◄─────────────────────────────┤
                                     │
QA ◄─────────────────────────────────┤
                                     │
Security ◄───────────────────────────┤
                                     │
Performance ◄────────────────────────┤
                                     │
Review ◄─────────────────────────────┘
```

## Agent Ownership

| Agent | Owns |
|-------|------|
| Architect | `docs/architecture/` |
| Backend | `services/backend/` |
| Frontend | `services/frontend/` |
| UI Designer | `ui/` |
| Database | `services/backend/migrations/`, `services/backend/src/models/` |
| DevOps | `platform/`, `.github/workflows/` |
| QA | `tests/` |
| Security | `security/` |
| Performance | `tests/benchmarks/`, `performance/` |
| Reviewer | `reviews/` |

## Invoking Agents

Agents can be invoked using:
- `@team-lead` - Start PRD processing
- `@architect` - Architecture tasks
- `@backend` - Backend development
- `@frontend` - Frontend development
- `@ui-designer` - UI design
- `@database` - Database tasks
- `@devops` - Infrastructure tasks
- `@qa` - Testing tasks
- `@security` - Security audits
- `@performance` - Performance testing
- `@reviewer` - Code review
