# AI Development System

## Overview

A **PRD-driven autonomous AI engineering factory** where a user places Product Requirement Documents in the `prd/` directory and the system automatically builds the product using multiple AI agents working in parallel.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER                                         │
│                          │                                           │
│                          ▼                                           │
│                  prd/*.prd.md                                        │
│                          │                                           │
│                          ▼                                           │
│            ┌─────────────────────────┐                              │
│            │       TEAM LEAD         │                              │
│            │  - Parse PRDs           │                              │
│            │  - Extract features     │                              │
│            │  - Generate tasks       │                              │
│            └───────────┬─────────────┘                              │
│                        │                                             │
│                        ▼                                             │
│            ┌─────────────────────────┐                              │
│            │    SHARED TASK STATE    │                              │
│            │   core/state/tasks.json │                              │
│            │                         │                              │
│            │  ready → working → done │                              │
│            └───────────┬─────────────┘                              │
│                        │                                             │
│    ┌──────────────────┬┴┬──────────────────┐                        │
│    ▼                  ▼ ▼                  ▼                        │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │Archi │ │ DB   │ │Back  │ │Front │ │ UI   │ │DevOps│              │
│ │tect  │ │ Eng  │ │End   │ │End   │ │Design│ │      │              │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
│ ┌──────┐ ┌──────┐ ┌──────┐                                          │
│ │  QA  │ │Secur │ │Perf  │                                          │
│ │      │ │ity   │ │      │                                          │
│ └──────┘ └──────┘ └──────┘                                          │
│            │                                                         │
│            ▼                                                         │
│      ┌──────────┐                                                   │
│      │ REVIEWER │                                                   │
│      └──────────┘                                                   │
│            │                                                         │
│            ▼                                                         │
│    ┌───────────────┐                                                │
│    │ BUILD REPORT  │                                                │
│    └───────────────┘                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# 1. Place a PRD file in prd/ (e.g., my-app.prd.md)
# 2. Run the build command
/build-prd

# 3. Agents autonomously build the product
# 4. Review the build report in docs/build-report.md
```

## Tech Stack

- **Framework**: Next.js 14, React 18
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB (Mongoose 8.x)
- **Testing**: Jest, Playwright, Vitest
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io
- **State**: Zustand
- **Infrastructure**: Docker, Kubernetes, Terraform

## The Agent Team

| Agent | File | Role |
|-------|------|------|
| **Team Lead** | `.agents/team-lead.agent.md` | PRD parser, task orchestrator |
| **Architect** | `.agents/architect.agent.md` | System design |
| **Backend Engineer** | `.agents/backend.agent.md` | APIs, services |
| **Frontend Engineer** | `.agents/frontend.agent.md` | React components |
| **UI Designer** | `.agents/ui-designer.agent.md` | Design system |
| **Database Engineer** | `.agents/database.agent.md` | Schema, migrations |
| **DevOps Engineer** | `.agents/devops.agent.md` | Infrastructure |
| **QA Engineer** | `.agents/qa.agent.md` | Testing |
| **Security Engineer** | `.agents/security.agent.md` | Security audits |
| **Performance Engineer** | `.agents/performance.agent.md` | Benchmarks |
| **Reviewer** | `.agents/reviewer.agent.md` | Code review |

## Workflow Phases

```
Phase 1: Architecture & Design
    ├── Architect → docs/architecture.md
    ├── Product Manager → knowledge/product.md
    └── UI Designer → ui/
              │
              ▼
Phase 2: Implementation (Parallel)
    ├── Backend Engineer → services/backend/
    └── Frontend Engineer → services/frontend/
              │
              ▼
Phase 3: Testing & QA
    └── QA Engineer → tests/
              │
              ▼
Phase 4: Security Audit
    └── Security Engineer → security/
              │
              ▼
Phase 5: Review
    └── Reviewer → reviews/
```

## Directory Structure

```
AI_DEVELOPMENT_SYSTEM/
├── .agents/              # Agent definitions (11 agents)
├── .claude/
│   ├── commands/         # Slash commands (10 commands)
│   ├── skills/           # Reusable AI skills (6 skills)
│   └── settings.json     # Claude + MCP configuration
├── .mcp.json             # MCP server configuration
├── mcp/                  # MCP documentation
├── configs/              # System configuration
│   ├── agents.yaml       # Agent model settings
│   └── environment.yaml  # Environment config
├── core/
│   ├── engine/           # PRD engine documentation
│   ├── orchestration/    # Workflow coordination
│   ├── state/            # Shared state (tasks, agents, progress)
│   ├── queues/           # Task queues (ready, working, done)
│   └── tasks/            # Task tracking
├── tools/                # Python automation tools
│   ├── orchestrator.py   # Main workflow engine
│   ├── generate_tasks.py # Task generation from PRD
│   ├── parse_prd.py      # PRD parser
│   ├── task_manager.py   # Task CRUD operations
│   ├── state_sync.py     # State synchronization
│   └── validate.py       # Schema validation
├── scripts/              # Shell scripts
│   ├── orchestrate.sh    # Full build script
│   ├── reset.sh          # Reset system state
│   └── status.sh         # Show system status
├── knowledge/            # Domain knowledge base
│   ├── coding_standards.md
│   ├── api-design-guidelines.md
│   ├── security-best-practices.md
│   ├── testing-guidelines.md
│   ├── architecture-patterns.md
│   └── performance-optimization.md
├── prd/                  # Product Requirements
├── services/
│   ├── backend/          # Backend code
│   └── frontend/         # Frontend code
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── e2e/              # End-to-end tests
│   ├── security/         # Security tests
│   └── benchmarks/       # Performance benchmarks
├── docs/                 # Documentation
├── platform/
│   ├── docker/           # Docker configs
│   ├── deployment/       # Deploy scripts
│   └── infrastructure/   # Kubernetes + Terraform
├── ui/                   # Design system
├── security/             # Security reports
├── performance/          # Performance reports
├── reviews/              # Code reviews
├── docker-compose.yml    # Local development
├── package.json          # Node dependencies
└── start.sh              # Startup script
```

## Task Schema

```json
{
  "task_id": "TASK-001",
  "title": "Task title",
  "description": "Detailed description",
  "type": "architecture|database|backend|frontend|ui|devops|testing|security|performance|review",
  "assigned_agent": "team-lead|backend|frontend|ui|qa|security|performance|reviewer",
  "status": "ready|working|done|blocked",
  "dependencies": ["TASK-000"],
  "priority": "critical|high|medium|low",
  "prd_source": "product.prd.md",
  "feature": "Feature Name",
  "files": [],
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```

## Task Flow

```
ready.json ──► Agent Claims ──► working.json ──► Agent Completes ──► done.json
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/build-prd` | Build product from PRD files autonomously |
| `/build-feature` | Build a specific feature |
| `/generate-prd` | Generate PRD from requirements |
| `/code-review` | Run code review on changes |
| `/write-tests` | Generate tests for code |
| `/fix-bug` | Analyze and fix a bug |
| `/security-audit` | Run security audit |
| `/optimize-performance` | Performance optimization |
| `/deploy-app` | Deploy the application |
| `/research-tech` | Research technology options |

## Available Skills

| Skill | Purpose |
|-------|---------|
| `agent-browser` | Browser automation |
| `architecture-design` | System design patterns |
| `code-review` | Automated code review |
| `debug-analysis` | Debugging workflows |
| `deployment-validation` | Deployment checks |
| `e2e-test` | End-to-end testing |

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

## PRD Format

PRD files should follow this structure:

```markdown
# Product Name

## Overview
Brief description

## Features

### Feature 1: Name
**Priority**: High
**Description**: ...
**Acceptance Criteria**: ...

## Technical Specifications
### Architecture
### API Endpoints
### Database Schema

## Non-Functional Requirements
### Performance
### Security
```

## Knowledge Base

The `knowledge/` directory contains domain-specific guidelines:

| File | Purpose |
|------|---------|
| `coding_standards.md` | Code style and conventions |
| `api-design-guidelines.md` | REST API best practices |
| `security-best-practices.md` | Security patterns |
| `testing-guidelines.md` | Test writing standards |
| `architecture-patterns.md` | Design patterns |
| `performance-optimization.md` | Performance tuning |

## NPM Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run test         # Run Jest tests
npm run test:unit    # Unit tests only
npm run test:e2e     # Playwright E2E tests
npm run test:coverage # Coverage report
npm run lint         # ESLint
```

## Parallel Execution Rules

1. **Agents work concurrently** based on task dependencies
2. **Claim before work** — Agents must claim tasks atomically
3. **Respect dependencies** — Don't work on blocked tasks
4. **Update state** — Keep task status current

## Agent Model Configuration

Default model: `claude-sonnet-4-20250514`
Fallback chain: `claude-sonnet-4-20250514` → `gpt-4o` → `gpt-4o-mini`

## Coding Conventions

- **TypeScript**: Strict mode, functional style
- **React**: Functional components, hooks
- **Testing**: Jest for unit/integration, Playwright for E2E
- **CSS**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Containers**: Docker with multi-stage builds

## MCP (Model Context Protocol)

MCP enables AI agents to connect with external tools and services.

### Configured Servers

| Server | Purpose |
|--------|---------|
| `filesystem` | Read/write project files |
| `git` | Git operations |
| `memory` | Persistent agent memory |
| `github` | GitHub API (issues, PRs) |
| `fetch` | HTTP requests |

### Configuration Files

- `.mcp.json` — Root MCP configuration
- `.claude/settings.json` — Claude + MCP settings
- `mcp/README.md` — MCP documentation

### Setup

```bash
# Install MCP servers
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-memory
```

## Python Tools

| Tool | Purpose |
|------|---------|
| `orchestrator.py` | Main workflow engine |
| `generate_tasks.py` | PRD → Tasks |
| `parse_prd.py` | Extract features from PRD |
| `task_manager.py` | Task CRUD operations |
| `state_sync.py` | Atomic state updates |
| `validate.py` | Schema validation |

### Quick Commands

```bash
# Full simulated build
python3 tools/orchestrator.py prd/example.prd.md --simulate

# Check status
python3 tools/orchestrator.py --status

# Reset state
./scripts/reset.sh
```
