# Architecture Documentation

## System Overview

The AI Development System is a **multi-agent orchestration platform** that automates software development workflows using specialized AI agents. Agents collaborate via Claude Code's native Agent Teams feature to build, test, review, and deploy applications.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Claude Code Interface                      │
│               Slash Commands / Agent Teams                    │
├──────────────────────────────────────────────────────────────┤
│                     Agent Orchestration                        │
│      Team Templates / Workflow Definitions / Coordination     │
├──────────────────────────────────────────────────────────────┤
│                       Agent Layer                              │
│   Architect │ Planner │ Frontend │ Backend │ QA │ Security   │
│   UI-Designer │ Tester │ Debugger │ Reviewer │ DevOps │ Docs │
├──────────────────────────────────────────────────────────────┤
│                    Workspace Layer                             │
│                  apps/ │ saas-app/                            │
├──────────────────────────────────────────────────────────────┤
│                    Knowledge Layer                             │
│            knowledge/ │ docs/ │ .claude/                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
ai-dev-system/
│
├── CLAUDE.md                    # Master context for all Claude instances
├── README.md                    # Project overview and quick start
├── package.json                 # Node.js dependencies (minimal)
│
├── .agents/                     # Agent role definitions
│   ├── architect.yaml           # System architect
│   ├── planner.yaml             # Task planner
│   ├── frontend.yaml            # Frontend developer
│   ├── backend.yaml             # Backend developer
│   ├── ui-designer.yaml         # UI/UX designer
│   ├── qa.yaml                  # QA engineer
│   ├── tester.yaml              # Test engineer
│   ├── security.yaml            # Security engineer
│   ├── reviewer.yaml            # Code reviewer
│   ├── debugger.yaml            # Debug specialist
│   ├── devops.yaml              # DevOps engineer
│   └── documentation.yaml       # Documentation writer
│
├── .claude/                     # Claude Code configuration
│   ├── settings.json            # Agent Teams settings
│   ├── project_context.md       # Project context
│   ├── commands/                # Slash commands
│   │   ├── build-feature.md
│   │   ├── debug-bug.md
│   │   ├── code-review.md
│   │   ├── deploy-app.md
│   │   ├── run-tests.md
│   │   └── research-tech.md
│   ├── PRD/                     # PRD templates
│   └── skills/                  # Reusable skills
│
├── core/                        # Orchestration core
│   ├── agents/
│   │   ├── definitions/         # Agent YAML definitions
│   │   ├── implementations/     # Agent prompts
│   │   └── teams/               # Team templates
│   │       ├── feature_team.md
│   │       ├── debug_team.md
│   │       ├── review_team.md
│   │       ├── release_team.md
│   │       └── research_team.md
│   └── workflows/               # Workflow documentation
│
├── configs/                     # Configuration files
│   ├── agents.yaml              # Agent configuration
│   ├── model_config.yaml        # LLM settings
│   └── environment.yaml         # Environment settings
│
├── docs/                        # Documentation
│   ├── architecture.md          # This file
│   ├── workflow.md              # Workflow documentation
│   ├── developer_guide.md       # Developer guide
│   └── user_manual.md           # User manual
│
├── knowledge/                   # Project knowledge base
│   ├── architecture.md          # Architecture decisions
│   ├── coding_standards.md      # Coding standards
│   ├── lessons_learned.md       # Lessons learned
│   └── project_context.md       # Project context
│
├── apps/                        # Application workspace
│   ├── frontend/                # Next.js frontend
│   ├── backend/                 # Backend services
│   └── database/                # Database configs
│
├── saas-app/                    # SaaS application workspace
│   ├── frontend/
│   └── backend/
│
└── platform/                    # Infrastructure
    ├── infrastructure/          # IaC configs
    └── environments/            # Environment configs
```

---

## Agent Architecture

### Agent Roles

| Agent | Role | File Ownership |
|-------|------|----------------|
| **Architect** | System design, ADRs | `docs/architecture.md`, `knowledge/` |
| **Planner** | Task breakdown, coordination | `docs/tasks/` |
| **Frontend** | React/Next.js development | `apps/frontend/`, `saas-app/frontend/` |
| **Backend** | API/service development | `apps/backend/`, `saas-app/backend/` |
| **UI-Designer** | UI/UX design, design system | `docs/design/` |
| **QA** | Test strategy, quality assurance | `tests/` |
| **Tester** | Test implementation | `tests/` |
| **Security** | Security audits | `docs/security/` |
| **Reviewer** | Code review | Read-only |
| **Debugger** | Bug analysis, fixes | Cross-codebase |
| **DevOps** | CI/CD, deployment | `platform/infrastructure/` |
| **Documentation** | Documentation | `docs/`, `README.md` |

### Agent Definition Structure

Each agent is defined in `.agents/<name>.yaml`:

```yaml
name: agent-name
role: Role Title
description: What the agent does

model:
  primary: claude-sonnet-4-20250514
  fallback: gpt-4o
  temperature: 0.3

capabilities:
  - capability_1
  - capability_2

responsibilities:
  - Responsibility 1
  - Responsibility 2

collaboration:
  works_with:
    - other_agent
  receives_from:
    - upstream_agent
  sends_to:
    - downstream_agent

permissions:
  read: all
  write:
    - owned/directory/**
  execute: false

prompts:
  system: |
    System prompt for the agent

tasks:
  - task_1
  - task_2

dependencies:
  - dependent_agent
```

---

## Team Patterns

### Feature Team
Sequential + parallel execution for building features.

```
Architect → Planner ─┬─ Frontend ─┬─ QA → Reviewer
                     └─ Backend  ─┘
```

### Debug Team
Adversarial investigation with multiple hypotheses.

```
┌─ Investigator A ─┐
├─ Investigator B ─┼─ Challenge ─ Synthesis
└─ Investigator C ─┘
```

### Review Team
Parallel multi-lens code review.

```
┌─ Security Review  ─┐
├─ Quality Review   ─┼─ Summary
└─ Coverage Review  ─┘
```

### Release Team
Sequential deployment with validation.

```
DevOps → QA Validation → Deploy → Health Check
```

---

## Workflow Invocation

Workflows are invoked via slash commands:

| Command | Team | Description |
|---------|------|-------------|
| `/build-feature <name>` | Feature | Build a new feature |
| `/debug-bug <description>` | Debug | Investigate and fix a bug |
| `/code-review` | Review | Multi-lens code review |
| `/deploy-app --env staging` | Release | Deploy to environment |
| `/run-tests --type unit` | Test | Run test suite |
| `/research-tech <topic>` | Research | Technology evaluation |

---

## Knowledge Management

### Knowledge Base (`knowledge/`)
- `architecture.md` — Architecture decisions and patterns
- `coding_standards.md` — Project coding standards
- `lessons_learned.md` — Documented learnings
- `project_context.md` — Project context and goals

### Context Files
- `CLAUDE.md` — Master context loaded by all Claude instances
- `.claude/project_context.md` — Persistent project context

---

## File Ownership Rules

1. **Each agent owns specific directories** — prevents conflicts
2. **No overlapping writes** — agents cannot edit same files
3. **Read access is global** — all agents can read all files
4. **Reviewer is read-only** — analysis only, no writes

---

## Configuration

### Agent Configuration (`configs/agents.yaml`)
Model settings, team configurations, and defaults.

### Model Configuration (`configs/model_config.yaml`)
LLM provider settings, fallback chains, and cost limits.

### Environment Configuration (`configs/environment.yaml`)
Environment-specific settings for dev/staging/production.
