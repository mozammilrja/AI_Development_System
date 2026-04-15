# PRD Engine

The PRD Engine is the core orchestration system that processes Product Requirement Documents and coordinates autonomous development.

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRD ENGINE                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   prd/*.prd.md ──► [Parser] ──► [Task Generator] ──► tasks.json     │
│                                                                      │
│   tasks.json ──► [Queue Manager] ──► ready.json                      │
│                        │                                              │
│                        ├──► working.json                              │
│                        │                                              │
│                        └──► done.json                                 │
│                                                                      │
│   [Agent Coordinator] ◄──► [Worker Agents]                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. PRD Parser

Parses markdown PRD files and extracts:
- Product name and description
- Features list
- Technical requirements
- Acceptance criteria
- Non-functional requirements

### 2. Task Generator

Converts features into development tasks:
1. Architecture tasks (Architect)
2. Database tasks (Database Engineer)
3. Backend tasks (Backend Engineer)
4. Frontend tasks (Frontend Engineer)
5. UI tasks (UI Designer)
6. DevOps tasks (DevOps Engineer)
7. Testing tasks (QA Engineer)
8. Security tasks (Security Engineer)
9. Performance tasks (Performance Engineer)
10. Review tasks (Reviewer)

### 3. Queue Manager

Manages task queues:
- `ready.json` - Tasks available for claiming
- `working.json` - Tasks in progress
- `done.json` - Completed tasks

### 4. Agent Coordinator

Monitors agent activity and:
- Tracks agent status
- Handles task reassignment
- Detects blockers
- Generates reports

## Workflow

```
1. USER places PRD in prd/
2. TEAM LEAD reads prd/*.prd.md
3. TEAM LEAD parses features
4. TEAM LEAD generates tasks
5. TEAM LEAD writes tasks to core/state/tasks.json
6. TEAM LEAD moves ready tasks to core/queues/ready.json
7. WORKER AGENTS claim tasks from ready queue
8. WORKER AGENTS move tasks to working queue
9. WORKER AGENTS implement features
10. WORKER AGENTS move tasks to done queue
11. REVIEWER validates all work
12. TEAM LEAD generates build report
```

## Task Dependencies

```
Architecture ─┬─► Database ───► Backend ───► Frontend
              │                    │            │
              └─► UI Design ───────┴────────────┤
                                                │
DevOps ◄────────────────────────────────────────┤
                                                │
QA ◄────────────────────────────────────────────┤
                                                │
Security ◄──────────────────────────────────────┤
                                                │
Performance ◄───────────────────────────────────┤
                                                │
Review ◄────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `parser.md` | PRD parsing documentation |
| `task-generator.md` | Task generation rules |
| `queue-manager.md` | Queue management protocol |
| `coordinator.md` | Agent coordination logic |
