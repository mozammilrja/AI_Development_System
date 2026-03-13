# Architecture Documentation

## System Overview

The AI Development System is a **fully autonomous multi-agent software engineering platform** built on **Node.js, TypeScript, and MongoDB**. It automates software development workflows using a team of 10 specialized AI agents that work **in parallel** without sequential phases.

All agents operate **autonomously and simultaneously**, coordinating through repository files rather than direct messaging. This enables truly parallel development where no agent waits for another.

---

## Autonomous Multi-Agent Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        AUTONOMOUS AGENT TEAM                                │
│                     (10 Agents Running in Parallel)                        │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│   Product    │   Architect  │    UI        │   Backend    │   Frontend     │
│   Manager    │              │   Designer   │   Engineer   │   Engineer     │
│              │              │              │              │                │
│ docs/product │ docs/arch    │ ui/          │ services/    │ services/      │
│              │ docs/adr     │ docs/design  │ backend      │ frontend       │
├──────────────┼──────────────┼──────────────┼──────────────┼────────────────┤
│   DevOps     │   Security   │     QA       │ Performance  │    Code        │
│   Engineer   │   Engineer   │   Engineer   │   Engineer   │   Reviewer     │
│              │              │              │              │                │
│ platform/    │ security/    │ tests/       │ tests/benchmarks/ │ reviews/       │
│ .github/     │ docs/security│ docs/testing │ docs/perf    │ (read-only)    │
└──────────────┴──────────────┴──────────────┴──────────────┴────────────────┘
                                    │
                        ┌───────────┴────────────┐
                        │   Repository Files     │
                        │   (Coordination Hub)   │
                        └────────────────────────┘
```

---

## Execution Model

### Autonomous Parallel Execution

All 10 agents start **simultaneously** when a feature build begins:

1. **No Sequential Phases** — Agents do not wait for each other
2. **File-Based Coordination** — Agents monitor repository files
3. **Exclusive Ownership** — Each agent writes only to their directories
4. **Continuous Operation** — Agents work until completion

### Agent Ownership Map

| Agent | Exclusive Write Access |
|-------|------------------------|
| Product Manager | `docs/product.md`, `docs/user-stories/`, `docs/acceptance/` |
| Architect | `docs/architecture.md`, `docs/adr/`, `docs/api-contracts/` |
| Backend Engineer | `app/backend/`, `tests/unit/backend/`, `tests/integration/` |
| Frontend Engineer | `app/frontend/`, `tests/unit/frontend/`, `tests/e2e/` |
| UI Designer | `ui/`, `docs/design/` |
| DevOps Engineer | `platform/`, `.github/`, `docker-compose.yml` |
| Security Engineer | `security/`, `docs/security/`, `tests/security/` |
| QA Engineer | `tests/`, `docs/testing/` |
| Performance Engineer | `tests/benchmarks/`, `docs/tests/benchmarks/` |
| Code Reviewer | `reviews/` (read-only audit of all code) |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (ES2022) |
| Language | TypeScript (strict mode) |
| Database | MongoDB (Mongoose ODM) |
| AI Agents | Claude Agent Teams (Claude Sonnet primary, GPT-4o fallback) |
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Express.js, Zod validation |
| Infrastructure | Docker Compose, Terraform (AWS) |

---

## Directory Structure

```
ai-development-system/
├── CLAUDE.md                          # Master context for all agents
├── README.md                          # Project overview
├── docker-compose.yml                 # Container orchestration
│
├── .agents/                           # Agent role definitions (YAML)
│   ├── product-manager.yaml
│   ├── architect.yaml
│   ├── backend-engineer.yaml
│   ├── frontend-engineer.yaml
│   ├── ui-designer.yaml
│   ├── devops-engineer.yaml
│   ├── security-engineer.yaml
│   ├── qa-engineer.yaml
│   ├── performance-engineer.yaml
│   └── code-reviewer.yaml
│
├── .claude/                           # Claude Code configuration
│   ├── commands/                      # Slash commands
│   │   ├── build-feature.md           # 10-agent parallel feature build
│   │   ├── code-review.md             # Multi-lens parallel review
│   │   ├── deploy-app.md              # Deployment workflow
│   │   └── ...
│   └── settings.json
│
├── .agent-status/                     # Agent status files (JSON)
│
├── core/                              # Orchestration core (TypeScript)
│   ├── orchestrator/
│   │   ├── agentRunner.ts             # Agent execution engine
│   │   └── types.ts                   # Shared type definitions
│   ├── services/
│   │   ├── teamLauncher.ts            # Autonomous parallel launcher
│   │   └── taskRouter.ts              # Intent → workflow routing
│   └── workflows/
│       ├── autonomousWorkflow.ts      # 10-agent parallel workflow
│       ├── developmentFlow.ts         # Feature development
│       └── ...
│
├── services/                          # Application code
│   ├── backend/                       # Backend (owned by Backend Engineer)
│   └── frontend/                      # Frontend (owned by Frontend Engineer)
│
├── ui/                                # UI designs (owned by UI Designer)
│   ├── components/                    # Component specifications
│   ├── tokens/                        # Design tokens
│   └── flows/                         # User flow diagrams
│
├── security/                          # Security (owned by Security Engineer)
│   ├── configs/                       # Security configurations
│   └── policies/                      # Security policies
│
├── tests/benchmarks/                       # Performance (owned by Performance Engineer)
│   ├── benchmarks/                    # Performance benchmarks
│   └── load-tests/                    # Load testing configs
│
├── reviews/                           # Code reviews (owned by Code Reviewer)
│
├── tests/                             # Tests (owned by QA Engineer)
│   ├── unit/
│   │   ├── backend/
│   │   └── frontend/
│   ├── integration/
│   ├── e2e/
│   └── security/
│
├── platform/                          # Infrastructure (owned by DevOps)
│   ├── infrastructure/
│   │   ├── docker/
│   │   └── terraform/
│   └── environments/
│
├── docs/                              # Documentation
│   ├── product.md                     # Product requirements (Product Manager)
│   ├── architecture.md                # This file (Architect)
│   ├── user-stories/                  # User stories (Product Manager)
│   ├── acceptance/                    # Acceptance criteria (Product Manager)
│   ├── api/                           # API documentation (Backend Engineer)
│   ├── api-contracts/                 # API contracts (Architect)
│   ├── design/                        # Design docs (UI Designer)
│   ├── security/                      # Security docs (Security Engineer)
│   ├── tests/benchmarks/                   # Performance docs (Performance Engineer)
│   ├── testing/                       # Testing docs (QA Engineer)
│   └── infrastructure/                # Infrastructure docs (DevOps)
│
└── docs/knowledge/                         # Knowledge base
    ├── architecture.md
    ├── coding_standards.md
    └── lessons_learned.md
```

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Interface Layer — Claude Code CLI / VS Code                   │
│     Slash commands: /build-feature, /code-review, /deploy-app     │
├──────────────────────────────────────────────────────────────────┤
│  2. Orchestration Layer (Node.js / TypeScript)                    │
│     core/orchestrator/agentRunner.ts — Parallel agent execution   │
│     core/services/teamLauncher.ts    — Autonomous team launcher   │
│     core/workflows/autonomousWorkflow.ts — 10-agent parallel      │
├──────────────────────────────────────────────────────────────────┤
│  3. Agent Layer (10 Autonomous Agents)                            │
│     .agents/*.yaml — Agent definitions                            │
│     All agents run in parallel                                    │
│     File-based coordination via repository                        │
├──────────────────────────────────────────────────────────────────┤
│  4. Application Layer                                             │
│     app/backend/   — Backend APIs and services               │
│     app/frontend/  — React/Vite frontend                     │
├──────────────────────────────────────────────────────────────────┤
│  5. Data Layer (MongoDB via Mongoose)                             │
│     core/models/Task.ts          — tasks collection               │
│     core/models/AgentRun.ts      — agent_runs collection          │
│     core/models/WorkflowState.ts — workflow_state collection      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Agent Communication

### File-Based Coordination

Agents coordinate through repository files instead of direct messaging:

```
Product Manager writes → docs/product.md
                         ↓
        [All agents read requirements]
                         ↓
Architect writes      → docs/architecture.md, docs/api-contracts/
                         ↓
        [Backend/Frontend engineers read specs]
                         ↓
Backend writes        → app/backend/
Frontend writes       → app/frontend/
                         ↓
        [QA/Security/Performance monitor code]
                         ↓
QA writes             → tests/
Security writes       → security/, docs/security/
Performance writes    → tests/benchmarks/
                         ↓
        [Code Reviewer audits all code]
                         ↓
Reviewer writes       → reviews/
```

### Status Tracking

Each agent maintains a status file in `.agent-status/`:

```json
{
  "agent": "backend-engineer",
  "status": "active",
  "currentTask": "Implementing user authentication API",
  "progress": 0.6,
  "lastUpdate": "2025-03-14T12:00:00Z",
  "filesChanged": ["app/backend/src/auth.ts"]
}
```

---

## Workflow Patterns

### Autonomous Parallel (Default)

All agents work simultaneously with no dependencies:

```
t=0  ──┬── Product Manager
       ├── Architect
       ├── Backend Engineer
       ├── Frontend Engineer
       ├── UI Designer         ────► All working in parallel
       ├── DevOps Engineer
       ├── Security Engineer
       ├── QA Engineer
       ├── Performance Engineer
       └── Code Reviewer
            │
            ▼
t=end    Final Report
```

### No Sequential Phases

❌ Old Model (Sequential):
```
Architect → Backend+Frontend → Tester → Reviewer
```

✅ New Model (Parallel):
```
All 10 agents start at t=0 and work independently
```

---

## Commands

```bash
# Build a feature with 10 parallel agents
/build-feature <feature-description>

# Multi-lens parallel code review
/code-review

# Deploy to staging/production
/deploy-app --env staging

# Run all tests
/run-tests --type all
```

---

## Configuration

### Agent Configuration

Each agent is defined in `.agents/<agent-name>.yaml`:

```yaml
name: backend-engineer
role: Backend Engineer
execution_mode: autonomous_parallel
startup_behavior: immediate

permissions:
  read: all
  write:
    - app/backend/**
    - tests/unit/backend/**
  execute:
    - npm
    - node
```

### Team Configuration

Team settings in `configs/agents.yaml`:

```yaml
team:
  pattern: autonomous_parallel
  max_parallel: 10
  fail_fast: false
```

---

## References

- [Workflow Documentation](workflow.md)
- [Developer Guide](developer_guide.md)
- [Agent Definitions](.agents/)
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
├── docs/knowledge/                         # Living knowledge base
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
| **Architect** | System design, ADRs | `docs/architecture.md`, `docs/knowledge/` | `architect/agent.ts` |
| **Planner** | Task breakdown | `docs/tasks/`, `core/agents/teams/` | `project_manager/agent.ts` |
| **Frontend** | React/Next.js | `apps/frontend/`, `saas-app/frontend/` | `frontend_agent/agent.ts` |
| **Backend** | Express/MongoDB APIs | `apps/backend/`, `saas-app/backend/` | `backend_agent/agent.ts` |
| **Tester** | Jest/Playwright tests | `tests/`, `platform/simulations/` | `testing_agent/agent.ts` |
| **Debugger** | Root-cause analysis | Cross-codebase write | `debug_agent/agent.ts` |
| **Reviewer** | Code quality review | Read-only | `review_agent/agent.ts` |
| **DevOps** | Docker, Terraform, CI/CD | `platform/` | `deploy_agent/agent.ts` |
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

### Knowledge Base (`docs/knowledge/`)
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
