# Developer Guide

## Getting Started

### Prerequisites
- [Claude Code](https://claude.ai/code) — VS Code extension or CLI
- Node.js 20+ (for frontend development)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url> ai-dev-system
   cd ai-dev-system
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Open in Claude Code**
   - Open the project in VS Code with Claude Code extension
   - Or use Claude Code CLI

4. **Verify setup**
   - Agent Teams should be enabled (check `.claude/settings.json`)
   - Agent definitions should be in `.agents/`

---

## Project Structure

```
ai-dev-system/
├── .agents/           # Agent role definitions
├── .claude/           # Claude Code configuration
│   ├── commands/      # Slash commands
│   ├── skills/        # Reusable skills
│   └── PRD/           # PRD templates
├── core/              # Orchestration logic
│   ├── agents/        # Agent teams and prompts
│   └── workflows/     # Workflow documentation
├── configs/           # Configuration files
├── docs/              # Documentation
├── knowledge/         # Project knowledge base
├── apps/              # Application workspace
└── saas-app/          # SaaS application workspace
```

---

## Adding a New Agent

### 1. Create Agent Definition

Create `.agents/<agent-name>.yaml`:

```yaml
name: my-agent
role: Agent Role
description: What the agent does

model:
  primary: claude-sonnet-4-20250514
  fallback: gpt-4o
  temperature: 0.3

capabilities:
  - capability_1
  - capability_2

responsibilities:
  - What the agent is responsible for

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
    - my/directory/**
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
knowledge/
├── architecture.md      # Architecture decisions
├── coding_standards.md  # Project standards
├── lessons_learned.md   # Lessons from past work
└── project_context.md   # Project overview
```

### Updating Knowledge

Agents with write access to `knowledge/` can update these files:
- **Architect** — architecture decisions
- **Documentation** — general knowledge

### Using Knowledge

All agents can read from `knowledge/` to inform their work.

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
