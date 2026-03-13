# Architecture Documentation

## System Overview

The AI Development System is a **multi-agent orchestration platform** built on **Node.js, TypeScript, and MongoDB**. It automates software development workflows using specialized AI agents that collaborate via Claude Code Agent Teams to build, test, review, and deploy applications.

All orchestration logic — task routing, team launching, workflow execution, and agent communication — is implemented in TypeScript. MongoDB stores workflow state, task progress, agent run history, and inter-agent messages.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (ES2022) |
| Language | TypeScript (strict mode) |
| Database | MongoDB (Mongoose ODM) |
| AI Agents | Claude Agent Teams (Claude Opus primary, GPT-4o fallback) |
| SaaS Frontend | React 18, Vite, Tailwind CSS, Zustand, React Query |
| SaaS Backend | Express.js, JWT (HS256), Zod validation |
| Apps Frontend | Next.js (App Router) |
| Infrastructure | Docker Compose, Terraform (AWS) |

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  1. Interface Layer — Claude Code CLI / VS Code               │
│     Slash commands: /build-feature, /debug-bug, /code-review  │
├──────────────────────────────────────────────────────────────┤
│  2. Orchestration Layer (Node.js / TypeScript)                │
│     core/orchestrator/agentRunner.ts — Agent execution        │
│     core/services/taskRouter.ts      — Intent → workflow      │
│     core/services/teamLauncher.ts    — Team pattern execution │
├──────────────────────────────────────────────────────────────┤
│  3. Workflow Layer (TypeScript DAGs)                           │
│     core/workflows/developmentFlow.ts — Feature pipeline      │
│     core/workflows/debugFlow.ts       — Adversarial debug     │
│     core/workflows/releaseFlow.ts     — Deploy + validate     │
│     core/workflows/researchFlow.ts    — Proponent vs Critic   │
│     core/workflows/uiTestingFlow.ts   — E2E + accessibility   │
├──────────────────────────────────────────────────────────────┤
│  4. Agent Layer (TypeScript implementations)                  │
│     core/agents/implementations/*/agent.ts — per-agent logic  │
│     core/agents/implementations/*/tools.ts — tool descriptors │
│     core/agents/definitions/*.yaml — model + permissions      │
│     core/agents/teams/*.md — team workflow templates           │
├──────────────────────────────────────────────────────────────┤
│  5. Data Layer (MongoDB via Mongoose)                         │
│     core/models/Task.ts          — tasks collection           │
│     core/models/AgentRun.ts      — agent_runs collection      │
│     core/models/TeamMessage.ts   — team_messages collection   │
│     core/models/WorkflowState.ts — workflow_state collection  │
├──────────────────────────────────────────────────────────────┤
│  6. Application Layer                                         │
│     apps/       — Next.js frontend + database migrations      │
│     saas-app/   — React/Vite frontend + Express/MongoDB API   │
├──────────────────────────────────────────────────────────────┤
│  7. Knowledge Layer                                           │
│     knowledge/ — Architecture decisions, coding standards     │
│     docs/      — Documentation                                │
│     .claude/   — Claude Code config and project context       │
└──────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
ai-dev-system/
├── CLAUDE.md                          # Master context for all Claude instances
├── README.md                          # Project overview
├── package.json                       # Node.js dependencies
│
├── .agents/                           # Agent role definitions (YAML)
├── .claude/                           # Claude Code configuration
│   ├── settings.json                  # Agent Teams settings
│   ├── project_context.md             # Persistent project context
│   ├── commands/                      # Slash commands
│   ├── PRD/                           # PRD templates
│   └── skills/                        # Reusable skills
├── .github/
│   └── copilot-instructions.md        # Copilot architecture context
│
├── core/                              # Orchestration core (TypeScript)
│   ├── orchestrator/
│   │   ├── agentRunner.ts             # Single-agent execution engine
│   │   ├── types.ts                   # Shared type definitions
│   │   └── index.ts                   # Barrel exports
│   ├── services/
│   │   ├── taskRouter.ts              # Intent detection → workflow routing
│   │   ├── teamLauncher.ts            # Team pattern execution (seq/par/adversarial)
│   │   └── index.ts
│   ├── workflows/
│   │   ├── baseWorkflow.ts            # Abstract DAG-based workflow
│   │   ├── developmentFlow.ts         # Feature: architect → FE+BE → test → review
│   │   ├── debugFlow.ts               # Debug: 3 adversarial investigators → fix
│   │   ├── releaseFlow.ts             # Release: deploy → validate → rollback
│   │   ├── researchFlow.ts            # Research: proponent vs critic → evaluate
│   │   ├── uiTestingFlow.ts           # UI: E2E + visual + accessibility
│   │   └── index.ts
│   ├── models/                        # MongoDB models (Mongoose)
│   │   ├── Task.ts                    # tasks collection
│   │   ├── AgentRun.ts                # agent_runs collection
│   │   ├── TeamMessage.ts             # team_messages collection
│   │   ├── WorkflowState.ts           # workflow_state collection
│   │   └── index.ts
│   └── agents/
│       ├── definitions/               # Agent YAML specs (model, tools, permissions)
│       ├── implementations/           # Per-agent TypeScript + prompts
│       │   ├── architect/             # agent.ts, tools.ts, prompts.md, README.md
│       │   ├── backend_agent/
│       │   ├── frontend_agent/
│       │   ├── testing_agent/
│       │   ├── debug_agent/
│       │   ├── review_agent/
│       │   ├── deploy_agent/
│       │   ├── docs_agent/
│       │   └── project_manager/
│       └── teams/                     # Team workflow templates (Markdown)
│           ├── feature_team.md
│           ├── debug_team.md
│           ├── review_team.md
│           ├── release_team.md
│           └── research_team.md
│
├── configs/                           # Configuration files
│   ├── agents.yaml                    # Agent model settings
│   ├── model_config.yaml              # LLM provider + fallback chains
│   └── environment.yaml               # Environment settings
│
├── docs/                              # Documentation
│   ├── architecture.md                # This file
│   ├── agent_system.md                # Agent system design guide
│   ├── copilot_usage.md               # How to use Copilot with this repo
│   ├── workflow.md                    # Workflow documentation
│   ├── developer_guide.md             # Developer guide
│   └── user_manual.md                 # User manual
│
├── knowledge/                         # Living knowledge base
│   ├── architecture.md                # Architecture decisions
│   ├── coding_standards.md            # Coding standards
│   ├── lessons_learned.md             # Lessons learned
│   └── project_context.md             # Project context
│
├── apps/                              # Application workspace
│   ├── frontend/                      # Next.js (App Router)
│   ├── backend/                       # Backend services
│   └── database/                      # Database migrations
│
├── saas-app/                          # SaaS application workspace
│   ├── frontend/                      # React 18 + Vite + Tailwind
│   └── backend/                       # Express.js + MongoDB
│
└── platform/                          # Infrastructure
    ├── infrastructure/
    │   ├── docker/                    # Docker Compose + Dockerfile
    │   └── terraform/                 # AWS VPC + RDS
    ├── environments/                  # Mock servers, sandboxes
    └── simulations/                   # Browser tests, load testing
```

---

## Orchestration Architecture (Node.js)

### Request Flow

```
User Request
  │
  ▼
TaskRouter.route(request)          ← Detects intent, selects workflow type
  │
  ▼
WorkflowFactory.create(type)       ← Instantiates the correct *Flow class
  │
  ▼
BaseWorkflow.execute(request)      ← Creates tasks, builds WorkflowState
  │
  ▼
TeamLauncher.launch(template,      ← Executes tasks per team pattern:
  workflow, tasks)                    sequential / parallel / adversarial
  │
  ▼
AgentRunner.run(task)              ← Spawns agent via Claude Agent Teams
  │                                   using .claude/ config + definitions/*.yaml
  ▼
MongoDB persistence                ← Task, AgentRun, TeamMessage, WorkflowState
```

### MongoDB Collections

| Collection | Model | Purpose |
|------------|-------|---------|
| `tasks` | `core/models/Task.ts` | Individual task records with status, assignment, dependencies |
| `agent_runs` | `core/models/AgentRun.ts` | Agent execution history with token usage and output |
| `team_messages` | `core/models/TeamMessage.ts` | Inter-agent messages during workflows |
| `workflow_state` | `core/models/WorkflowState.ts` | Workflow status, tasks, and context |

### Team Execution Patterns

| Pattern | Implementation | Used By |
|---------|---------------|---------|
| `sequential` | Tasks run one at a time in order | Release, UI Testing |
| `parallel` | All tasks run simultaneously | Review |
| `sequential_parallel` | Batch tasks by dependency level; each batch runs in parallel | Feature |
| `adversarial` | Competing hypotheses in parallel, then synthesis | Debug, Research |

---

## Agent Architecture

### Agent Roles

| Agent | Role | File Ownership | Implementation |
|-------|------|----------------|----------------|
| **Architect** | System design, ADRs | `docs/architecture.md`, `knowledge/` | `architect/agent.ts` |
| **Planner** | Task breakdown | `docs/tasks/`, `core/agents/teams/` | `project_manager/agent.ts` |
| **Frontend** | React/Next.js | `apps/frontend/`, `saas-app/frontend/` | `frontend_agent/agent.ts` |
| **Backend** | Express/MongoDB APIs | `apps/backend/`, `saas-app/backend/` | `backend_agent/agent.ts` |
| **Tester** | Jest/Playwright tests | `tests/`, `platform/simulations/` | `testing_agent/agent.ts` |
| **Debugger** | Root-cause analysis | Cross-codebase write | `debug_agent/agent.ts` |
| **Reviewer** | Code quality review | Read-only | `review_agent/agent.ts` |
| **DevOps** | Docker, Terraform, CI/CD | `platform/infrastructure/` | `deploy_agent/agent.ts` |
| **Documentation** | Technical writing | `docs/`, `README.md` | `docs_agent/agent.ts` |

### Agent Implementation Structure

Each agent in `core/agents/implementations/<name>/` contains:

| File | Purpose |
|------|---------|
| `agent.ts` | Definition (name, model, permissions), system prompt, execute function |
| `tools.ts` | Tool descriptors with allowed paths and commands |
| `prompts.md` | Prompt templates for different task types |
| `README.md` | Documentation of the agent's purpose and capabilities |

### Claude Agent Teams Integration

The orchestration layer integrates with Claude Agent Teams via:

1. **`.claude/settings.json`** — Global Agent Teams configuration
2. **`core/agents/definitions/*.yaml`** — Per-agent model, tools, and permissions read by Claude Code
3. **`core/agents/teams/*.md`** — Team templates with spawn prompts and communication protocols
4. **`.claude/commands/*.md`** — Slash commands that trigger team workflows
5. **`AgentRunner`** — Calls the Claude Code SDK to spawn agents with their definitions

---

## Team Patterns

### Feature Team (sequential_parallel)
```
Architect designs → Frontend + Backend in parallel → Tester validates → Reviewer audits
```

### Debug Team (adversarial)
```
Investigator A (logic) ─┐
Investigator B (state)  ├─ adversarial debate → Lead synthesizes fix
Investigator C (deps)   ─┘
```

### Review Team (parallel)
```
Security Review   ─┐
Performance Review ├─ Lead deduplicates → combined report
Coverage Review   ─┘
```

### Release Team (sequential)
```
DevOps deploys → QA validates → rollback if failed
```

---

## Workflow Invocation

| Command | Workflow Class | Team Pattern |
|---------|---------------|--------------|
| `/build-feature <name>` | `DevelopmentFlow` | sequential_parallel |
| `/debug-bug <desc>` | `DebugFlow` | adversarial |
| `/code-review` | (Review team) | parallel |
| `/deploy-app --env staging` | `ReleaseFlow` | sequential |
| `/research-tech <topic>` | `ResearchFlow` | adversarial |
| `/run-tests --type e2e` | `UiTestingFlow` | sequential |

---

## Knowledge Management

### Knowledge Base (`knowledge/`)
- `architecture.md` — Architecture decisions and patterns
- `coding_standards.md` — Project coding standards
- `lessons_learned.md` — Documented learnings from debug workflows
- `project_context.md` — Project context and goals

### Context Files
- `CLAUDE.md` — Master context loaded by all Claude instances
- `.claude/project_context.md` — Persistent project context for Agent Teams
- `.github/copilot-instructions.md` — Architecture context for GitHub Copilot

---

## File Ownership Rules

1. **Each agent owns specific directories** — prevents write conflicts
2. **No overlapping writes** — agents cannot edit the same files
3. **Read access is global** — all agents can read all files
4. **Reviewer is read-only** — analysis only, no writes
5. **Debugger is the exception** — cross-codebase write for bug fixes

---

## Configuration

### Agent Configuration (`configs/agents.yaml`)
Model settings, team member lists, and execution defaults.

### Model Configuration (`configs/model_config.yaml`)
LLM provider settings, fallback chains (Opus → GPT-4o → GPT-4o-mini), and cost limits ($50/day, $5/task).

### Environment Configuration (`configs/environment.yaml`)
Environment-specific settings for dev/staging/production.
