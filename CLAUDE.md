# AI Development System

## Overview

A **fully autonomous multi-agent software engineering platform** where all agents work **independently and in parallel** to design, build, test, review, and deploy software. No sequential phases—agents collaborate asynchronously through repository updates.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS PARALLEL EXECUTION                            │
│                    (All Agents Start Immediately)                           │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────────────┤
│ Architect│ Backend  │ Frontend │ Tester   │ Reviewer │     ...more          │
│          │ Engineer │ Engineer │ (QA)     │          │                      │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │  Async Collaboration via Repo │
                    └───────────────────────────────┘
```

## The Agent Team

| Agent | Owns | Does |
|-------|------|------|
| **Architect** | `docs/architecture.md`, `docs/features/` | System design, API contracts |
| **Backend Engineer** | `app/backend/` | APIs, services, database models |
| **Frontend Engineer** | `app/frontend/` | React components, pages, client logic |
| **QA Engineer** | `tests/` | Unit, integration, E2E tests |
| **Performance Engineer** | `tests/benchmarks/` | Benchmarks, optimization |

## Execution Model

### Autonomous Parallel Execution

All agents start **immediately** and work **independently**:

1. **No Sequential Phases** — All agents begin at t=0
2. **Independent Work** — Each agent works autonomously on their tasks
3. **Async Collaboration** — Agents coordinate through repository file updates
4. **Continuous Progress** — Agents monitor repo changes and adapt their work
5. **Final Report** — Generated when all agents complete

## Directory Structure

```
AI_DEVELOPMENT_SYSTEM/
├── .agents/              # Agent definitions (YAML)
├── .claude/              # Commands, skills, config
├── app/                  # Application code
│   ├── backend/          # Express.js backend
│   └── frontend/         # React frontend
├── configs/              # Configuration files
├── core/                 # Orchestration engine
│   ├── agents/           # Agent implementations & teams
│   ├── orchestrator/     # Agent runner
│   ├── services/         # Team launcher
│   └── workflows/        # Workflow definitions
├── docs/                 # Documentation
│   ├── features/         # Feature docs (organized by feature)
│   ├── chat-app/         # Chat app specifications
│   └── knowledge/        # Knowledge base & guides
├── platform/             # Infrastructure
│   ├── docker/           # Dockerfile, docker-compose
│   └── terraform/        # Terraform configs
└── tests/                # All tests
    ├── benchmarks/       # Performance benchmarks
    ├── e2e/              # End-to-end tests
    ├── integration/      # Integration tests
    ├── security/         # Security tests
    └── unit/             # Unit tests
```

## Commands

| Command | Description |
|---------|-------------|
| `/build-feature <name>` | Build feature with 10 parallel agents |
| `/code-review` | Multi-lens parallel code review |
| `/deploy-app --env <env>` | Deploy to staging/production |
| `/run-tests` | Run test suites |

## File Ownership Rules

1. Each agent has **exclusive write access** to their directories
2. All agents can **read any file**
3. Agents **coordinate through files**, not messages

## Agent Ownership Map

| Agent | Write Access |
|-------|--------------|
| Product Manager | `docs/knowledge/product.md`, `docs/features/*/user-stories.md` |
| Architect | `docs/architecture.md`, `docs/features/*/adr.md` |
| Backend Engineer | `app/backend/`, `tests/unit/backend/`, `tests/integration/` |
| Frontend Engineer | `app/frontend/`, `tests/unit/frontend/`, `tests/e2e/` |
| DevOps Engineer | `platform/`, `docker-compose.yml` |
| QA Engineer | `tests/`, `docs/features/*/acceptance.md` |
| Performance Engineer | `tests/benchmarks/`, `docs/features/*/performance.md` |

## Context Priority

When working on tasks, prioritize:
1. Feature request/current task
2. Agent ownership rules
3. Existing code in owned directories
4. Architecture documentation
5. Knowledge base

## Coding Conventions

- **TypeScript**: Strict mode, functional style
- **React**: Functional components, hooks
- **Testing**: Jest for unit/integration, Playwright for E2E
- **CSS**: Tailwind CSS

## Configuration Files

| File | Purpose |
|------|---------|
| `.agents/*.yaml` | Agent role definitions |
| `configs/agents.yaml` | Agent model settings |
| `.claude/settings.json` | Claude Code settings |
