# Developer Guide

## Getting Started

### Prerequisites
- [Claude Code](https://claude.ai/code) — VS Code extension or CLI
- Node.js 20+ (for development)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url> ai-dev-system
   cd ai-dev-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Open in Claude Code**
   - Open the project in VS Code with Claude Code extension
   - Or use Claude Code CLI

4. **Verify setup**
   - Check agent definitions in `.agents/`
   - Verify command files in `.claude/commands/`

---

## Project Structure

```
ai-development-system/
├── .agents/           # 10 agent role definitions (YAML)
├── .claude/           # Claude Code configuration
│   └── commands/      # Slash commands
├── .agent-status/     # Agent status tracking (JSON)
├── core/              # Orchestration logic (TypeScript)
│   ├── orchestrator/  # Agent execution engine
│   ├── services/      # Team launcher, task router
│   └── workflows/     # Workflow definitions
├── services/          # Application code
│   ├── backend/       # Backend (Backend Engineer)
│   └── frontend/      # Frontend (Frontend Engineer)
├── ui/                # UI designs (UI Designer)
├── security/          # Security configs (Security Engineer)
├── tests/benchmarks/       # Performance tools (Performance Engineer)
├── reviews/           # Code reviews (Code Reviewer)
├── tests/             # Tests (QA Engineer)
├── platform/          # Infrastructure (DevOps Engineer)
├── docs/              # Documentation
└── docs/knowledge/         # Knowledge base
```

---

## The 10-Agent Team

| Agent | Owns | Does |
|-------|------|------|
| **Product Manager** | `docs/product.md`, `docs/user-stories/` | Requirements, user stories |
| **Architect** | `docs/architecture.md`, `docs/api-contracts/` | System design, APIs |
| **Backend Engineer** | `app/backend/` | APIs, services, database |
| **Frontend Engineer** | `app/frontend/` | React components, pages |
| **UI Designer** | `ui/` | Component specs, design tokens |
| **DevOps Engineer** | `platform/`, `.github/` | CI/CD, infrastructure |
| **Security Engineer** | `security/` | Security audits |
| **QA Engineer** | `tests/` | Unit, integration, E2E tests |
| **Performance Engineer** | `tests/benchmarks/` | Benchmarks, load tests |
| **Code Reviewer** | `reviews/` | Code review (read-only audit) |

---

## Running Commands

### Build a Feature

```bash
/build-feature <feature-description>
```

This spawns all 10 agents simultaneously to build the feature.

**Example:**
```bash
/build-feature user-authentication with JWT tokens
```

### Code Review

```bash
/code-review
```

Runs parallel multi-perspective review.

### Deploy

```bash
/deploy-app --env staging
/deploy-app --env production
```

### Run Tests

```bash
/run-tests --type all
/run-tests --type unit
/run-tests --type e2e
```

---

## Adding a New Agent

### 1. Create Agent Definition

Create `.agents/<agent-name>.yaml`:

```yaml
name: my-agent
role: Agent Role Name
description: |
  Description of what the agent does.

model:
  primary: claude-sonnet-4-20250514
  fallback: gpt-4o
  temperature: 0.3

execution_mode: autonomous_parallel
startup_behavior: immediate

capabilities:
  - capability_1
  - capability_2

responsibilities:
  - Responsibility 1
  - Responsibility 2

collaboration:
  pattern: async_file_based
  monitors:
    - path/to/monitor/**
  publishes_to:
    - path/to/write/**
  coordinates_with:
    - other-agent

permissions:
  read: all
  write:
    - my/owned/directory/**
  execute: false

prompts:
  system: |
    You are an autonomous [Role] in a parallel multi-agent team.
    
    AUTONOMOUS OPERATION:
    - Start immediately when the feature build begins
    - Do NOT wait for other agents—work independently
    ...

tasks:
  - task_1
  - task_2

file_ownership:
  exclusive:
    - my/owned/directory/**
  shared_read:
    - all

status_reporting:
  output_file: .agent-status/my-agent.json
  update_frequency: on_change
```

### 2. Update Orchestrator

Add the agent to `core/orchestrator/types.ts`:

```typescript
export type AgentName =
  | 'product-manager'
  | ...
  | 'my-agent'  // Add here
```

Add write scopes to `core/services/teamLauncher.ts`:

```typescript
const AGENT_WRITE_SCOPES: Record<string, string[]> = {
  ...
  'my-agent': ['my/owned/directory/**'],
};
```

---

## Adding a New Command

### 1. Create Command File

Create `.claude/commands/<command-name>.md`:

```markdown
# Command Name

Description: **$ARGUMENTS**

---

## Agent Team

Spawn these agents **simultaneously**:

| # | Agent | Owns | Does |
|---|-------|------|------|
| 1 | **Agent 1** | `path/` | Does X |
| 2 | **Agent 2** | `path/` | Does Y |

---

## Execution Model

All agents work **in parallel** with no dependencies.

---

## Agent Instructions

### Agent 1
\`\`\`
START IMMEDIATELY. Do NOT wait for other agents.

1. Do task 1
2. Do task 2
\`\`\`

### Agent 2
\`\`\`
START IMMEDIATELY. Do NOT wait for other agents.

1. Do task A
2. Do task B
\`\`\`

---

## Output

Generate final report when complete.
```

---

## File Ownership Rules

### Critical Rules

1. **Exclusive Write Access** — Each agent writes ONLY to their directories
2. **Universal Read Access** — All agents can read any file
3. **No Overlap** — Directory ownership does not overlap
4. **Read-Only Reviewers** — Code Reviewer only writes to `reviews/`

### Ownership Table

| Agent | Writes To |
|-------|-----------|
| Product Manager | `docs/product.md`, `docs/user-stories/`, `docs/acceptance/` |
| Architect | `docs/architecture.md`, `docs/adr/`, `docs/api-contracts/` |
| Backend Engineer | `app/backend/`, `tests/unit/backend/`, `tests/integration/` |
| Frontend Engineer | `app/frontend/`, `tests/unit/frontend/`, `tests/e2e/` |
| UI Designer | `ui/`, `docs/design/` |
| DevOps Engineer | `platform/`, `.github/`, `docker-compose.yml` |
| Security Engineer | `security/`, `docs/security/`, `tests/security/` |
| QA Engineer | `tests/`, `docs/testing/` |
| Performance Engineer | `tests/benchmarks/`, `docs/tests/benchmarks/` |
| Code Reviewer | `reviews/` |

---

## Autonomous Parallel Execution

### How It Works

1. **Command Invoked** — User runs `/build-feature`
2. **All Agents Spawn** — 10 agents start simultaneously
3. **Independent Work** — Each agent works autonomously
4. **File Coordination** — Agents read others' outputs for coordination
5. **Status Updates** — Agents update `.agent-status/*.json`
6. **Completion** — Final report generated when all complete

### No Dependencies

❌ **Wrong (Sequential):**
```
if architect is done:
    start backend
```

✅ **Correct (Parallel):**
```
start all agents at t=0
each agent checks for relevant files periodically
```

### File-Based Coordination

Agents coordinate by reading repository files:

```
Product Manager writes docs/product.md
    ↓
All agents can read requirements
    ↓
Architect writes docs/architecture.md
    ↓
Backend/Frontend can read architecture
```

---

## Testing

### Run Tests

```bash
# All tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage

Target: 80%+ coverage

---

## Debugging

### Agent Status

Check `.agent-status/<agent>.json` for agent state:

```json
{
  "agent": "backend-engineer",
  "status": "active",
  "currentTask": "Implementing user service",
  "progress": 0.75
}
```

### Logs

Agent logs are emitted during execution:

```
[backend-engineer] Implementing auth service...
[frontend-engineer] Creating login component...
```

---

## Best Practices

### For Agents

1. **Start Immediately** — Never wait for other agents
2. **Monitor Files** — Watch for relevant updates
3. **Stay In Lane** — Only write to owned directories
4. **Update Status** — Keep `.agent-status/` current
5. **Document Work** — Write clear comments and docs

### For Commands

1. **Spawn All Agents** — Start everyone simultaneously
2. **No Dependencies** — Don't create sequential phases
3. **Clear Ownership** — Define who writes where
4. **Generate Report** — Summarize at completion

### For Code

1. **TypeScript** — Use strict mode
2. **Tests** — Write tests for all code
3. **Documentation** — Document public APIs
4. **Security** — Follow security best practices

---

## References

- [Architecture](architecture.md)
- [Workflow](workflow.md)
- [Agent Definitions](../.agents/)
  - dependent_agent
```

### 2. Add Agent Configuration

Update `configs/agents.yaml`:

```yaml
agents:
  my-agent:
    model: claude-sonnet-4-20250514
    temperature: 0.3
```

### 3. Create Agent Prompt (Optional)

Create `core/agents/implementations/<agent-name>/prompts.md`:

```markdown
# Agent Name Prompts

## System Prompt
You are a specialized agent...

## Task Templates
### Task 1
Instructions for task 1...
```

---

## Adding a New Command

### 1. Create Command File

Create `.claude/commands/<command-name>.md`:

```markdown
# /<command-name>

Description of what the command does.

## Arguments
- `<arg1>`: Description
- `[--option]`: Optional flag

## Execution

1. Step 1
2. Step 2
3. Step 3

## Example

\`\`\`
/<command-name> argument --option
\`\`\`
```

### 2. Document the Command

Add to `docs/workflow.md` if it creates a new workflow.

---

## Adding a New Team

### 1. Create Team Template

Create `core/agents/teams/<team-name>_team.md`:

```markdown
# Team Name

## Purpose
What this team accomplishes.

## Team Members
- **agent_1**: Role and responsibility
- **agent_2**: Role and responsibility

## Execution Flow
\`\`\`
agent_1 → agent_2 → output
\`\`\`

## File Ownership
- agent_1: `directory_a/`
- agent_2: `directory_b/`

## Spawn Prompt
Instructions for spawning this team...
```

### 2. Create Associated Command

Add command in `.claude/commands/` to invoke the team.

---

## Working with the Knowledge Base

### Knowledge Structure

```
docs/knowledge/
├── architecture.md      # Architecture decisions
├── coding_standards.md  # Project standards
├── lessons_learned.md   # Lessons from past work
└── project_context.md   # Project overview
```

### Updating Knowledge

Agents with write access to `docs/knowledge/` can update these files:
- **Architect** — architecture decisions
- **Documentation** — general knowledge

### Using Knowledge

All agents can read from `docs/knowledge/` to inform their work.

---

## Configuration Files

### `configs/agents.yaml`
Agent model settings and team configurations.

### `configs/model_config.yaml`
LLM provider settings and fallback chains.

### `configs/environment.yaml`
Environment-specific settings.

### `.claude/settings.json`
Claude Code settings including Agent Teams configuration.

---

## Best Practices

### Agent Design
- **Single Responsibility** — each agent has one clear purpose
- **Clear Ownership** — no overlapping file permissions
- **Explicit Collaboration** — define how agents interact

### Workflow Design
- **Parallel Where Possible** — independent tasks run together
- **Sequential Handoffs** — clear input/output contracts
- **Adversarial Review** — use competition for quality

### Documentation
- **Keep Docs Updated** — documentation agent maintains docs
- **Document Decisions** — use ADRs for architecture choices
- **Capture Learnings** — update lessons_learned.md

---

## Troubleshooting

### Agent Teams Not Working
1. Check `.claude/settings.json` has `agentTeams: true`
2. Verify `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set
3. Ensure Claude Code is up to date

### Agent Not Finding Files
1. Verify file paths in agent permissions
2. Check workspace is correctly opened
3. Ensure files exist at expected locations

### Command Not Recognized
1. Check command file exists in `.claude/commands/`
2. Verify markdown format is correct
3. Restart Claude Code if needed

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** changes following the patterns above
4. **Test** with Claude Code
5. **Submit** a pull request

### Contribution Areas
- New agent definitions
- New workflow patterns
- Documentation improvements
- Bug fixes
