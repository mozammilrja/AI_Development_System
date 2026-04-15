# Scripts

Shell scripts for common operations.

## Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `build.sh` | Prepare for PRD build | `./scripts/build.sh` |
| `reset.sh` | Reset all system state | `./scripts/reset.sh` |
| `status.sh` | Show system status | `./scripts/status.sh` |

## build.sh

Prepares the system for a PRD build:

```bash
# Build all PRDs
./scripts/build.sh

# Build specific PRD
./scripts/build.sh prd/example.prd.md
```

## reset.sh

Resets all tasks, agents, and progress:

```bash
./scripts/reset.sh
# Prompts for confirmation
```

## status.sh

Shows current system status:

```bash
./scripts/status.sh
```

Output:
- Task counts (ready, working, done)
- Agent statuses
- PRD files found
- Validation results

## Making Scripts Executable

```bash
chmod +x scripts/*.sh
```
