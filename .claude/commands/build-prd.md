---
description: Build product from PRD files autonomously
---

# Build PRD Command

Reads all PRD files from `prd/` directory and launches autonomous development.

## Execution Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      /build-prd EXECUTION                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. SCAN prd/ directory for *.prd.md files                          │
│  2. PARSE each PRD file                                              │
│  3. EXTRACT features and requirements                                │
│  4. GENERATE development tasks                                       │
│  5. WRITE tasks to core/state/tasks.json                            │
│  6. POPULATE core/queues/ready.json                                  │
│  7. LAUNCH worker agents in parallel                                 │
│  8. MONITOR progress                                                 │
│  9. GENERATE build report                                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Instructions

### Phase 1: PRD Discovery

1. List all files in `prd/` directory
2. Filter for `*.prd.md` files
3. Read each PRD file content
4. Extract product metadata

### Phase 2: Feature Extraction

For each PRD, extract:
- Product name and description
- Features list with priorities
- User stories
- Acceptance criteria
- Technical requirements
- API endpoints
- Database schema requirements

### Phase 3: Task Generation

For each feature, generate tasks:

| Order | Task Type | Agent | Dependencies |
|-------|-----------|-------|--------------|
| 1 | Architecture | Architect | None |
| 2 | Database Schema | Database Engineer | Architecture |
| 3 | Backend API | Backend Engineer | Database |
| 4 | UI Design | UI Designer | Architecture |
| 5 | Frontend | Frontend Engineer | Backend, UI |
| 6 | DevOps | DevOps Engineer | Backend, Frontend |
| 7 | Unit Tests | QA Engineer | Backend, Frontend |
| 8 | Integration Tests | QA Engineer | Unit Tests |
| 9 | E2E Tests | QA Engineer | Integration |
| 10 | Security Audit | Security Engineer | All implementation |
| 11 | Performance Tests | Performance Engineer | All implementation |
| 12 | Code Review | Reviewer | All tasks |

### Phase 4: Task Schema

Write tasks with this schema:

```json
{
  "task_id": "TASK-001",
  "title": "Design system architecture for [Product]",
  "description": "Create high-level architecture based on PRD requirements",
  "type": "architecture",
  "assigned_agent": null,
  "status": "ready",
  "dependencies": [],
  "priority": "critical",
  "prd_source": "product.prd.md",
  "feature": "Feature Name",
  "files": [],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Phase 5: Queue Population

1. Tasks with no dependencies → `core/queues/ready.json`
2. Initialize `core/state/agents.json` statuses
3. Initialize `core/state/progress.json`

### Phase 6: Parallel Agent Launch

Launch worker agents with instructions:

```
@architect - Process architecture tasks
@database - Process database tasks
@backend - Process backend tasks
@frontend - Process frontend tasks
@ui-designer - Process UI tasks
@devops - Process DevOps tasks
@qa - Process testing tasks
@security - Process security tasks
@performance - Process performance tasks
@reviewer - Process review tasks
```

### Phase 7: Monitoring

Track progress:
- Update `core/state/progress.json`
- Log agent activity
- Detect blockers
- Handle failures

### Phase 8: Completion

When all tasks complete:
1. Verify all queues processed
2. Generate `docs/build-report.md`
3. Update final status

## Agent Coordination Protocol

### Task Claiming

Each worker agent must:

```
1. READ core/state/tasks.json
2. FIND unclaimed task matching agent type
3. VERIFY dependencies completed
4. CLAIM task:
   - SET assigned_agent = "<agent-name>"
   - SET status = "working"
5. MOVE task to core/queues/working.json
6. IMPLEMENT task
7. UPDATE task:
   - SET status = "done"
   - ADD created files
8. MOVE task to core/queues/done.json
9. REPEAT until no matching tasks
```

### Dependency Resolution

Before claiming, verify:
- All tasks in `dependencies` array have `status = "done"`
- No circular dependencies exist

## Output Files

| File | Description |
|------|-------------|
| `core/state/tasks.json` | All generated tasks |
| `core/state/progress.json` | Build progress |
| `core/queues/ready.json` | Ready tasks |
| `core/queues/working.json` | In-progress tasks |
| `core/queues/done.json` | Completed tasks |
| `docs/build-report.md` | Final build report |

## Build Report Format

```markdown
# Build Report

## Summary
- **PRD Files Processed**: X
- **Features Identified**: X
- **Tasks Generated**: X
- **Tasks Completed**: X
- **Build Duration**: X hours

## PRDs Processed
| PRD | Status | Features | Tasks |
|-----|--------|----------|-------|
| product.prd.md | ✅ | 5 | 25 |

## Agent Performance
| Agent | Tasks | Duration | Status |
|-------|-------|----------|--------|
| Architect | 2 | 30m | ✅ |
| Backend | 5 | 2h | ✅ |

## Files Created
- services/backend/src/...
- services/frontend/src/...

## Quality Metrics
- Test Coverage: 85%
- Security Issues: 0
- Performance: All targets met

## Next Steps
1. Deploy to staging
2. User acceptance testing
```

## Error Handling

- **No PRD files**: Log warning, exit gracefully
- **Invalid PRD format**: Skip file, log error
- **Task generation failure**: Retry with rollback
- **Agent timeout**: Reassign task
- **Dependency deadlock**: Break cycle, alert

## Usage

Run this command to start autonomous development:

```
/build-prd
```

The system will automatically:
1. Find all PRDs
2. Generate tasks
3. Launch agents
4. Build the product
5. Generate report
