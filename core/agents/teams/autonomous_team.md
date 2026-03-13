# Autonomous Feature Team

## Overview

The autonomous feature team consists of 10 specialized AI agents that work **in parallel** without sequential phases.

## Team Members

| Agent | Role | Owns |
|-------|------|------|
| **Product Manager** | Requirements | `docs/product.md`, `docs/user-stories/` |
| **Architect** | System Design | `docs/architecture.md`, `docs/api-contracts/` |
| **Backend Engineer** | Backend Code | `app/backend/` |
| **Frontend Engineer** | Frontend Code | `app/frontend/` |
| **UI Designer** | UI Design | `ui/` |
| **DevOps Engineer** | Infrastructure | `platform/`, `.github/` |
| **Security Engineer** | Security | `security/` |
| **QA Engineer** | Testing | `tests/` |
| **Performance Engineer** | Performance | `tests/benchmarks/` |
| **Code Reviewer** | Review | `reviews/` |

## Execution Pattern

**All agents start simultaneously** when `/build-feature` is invoked.

```
t=0  ──┬── Product Manager
       ├── Architect
       ├── Backend Engineer
       ├── Frontend Engineer
       ├── UI Designer
       ├── DevOps Engineer
       ├── Security Engineer
       ├── QA Engineer
       ├── Performance Engineer
       └── Code Reviewer
            │
            ▼
t=end    Final Report
```

## Coordination

- **File-Based**: Agents coordinate through repository files
- **No Messaging**: Agents don't message each other directly
- **Continuous Work**: Agents monitor for new files to react to

## File Ownership

Each agent has exclusive write access to their directories:
- No overlapping writes possible
- Prevents merge conflicts
- Clear responsibility boundaries

## Command

```bash
/build-feature <feature-description>
```

## Output

Final report includes:
- Product requirements defined
- Architecture designed
- Code implemented
- Tests written
- Security audited
- Performance benchmarked
- Code reviewed
