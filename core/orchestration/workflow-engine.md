# Workflow Engine

The workflow engine orchestrates multi-agent collaboration for feature development. Agents execute in defined phases, with parallel execution where dependencies allow.

## Execution Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WORKFLOW ENGINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Phase 1          Phase 2              Phase 3      Phase 4      Phase 5   │
│  ┌────────┐    ┌─────────────────┐    ┌────────┐   ┌────────┐   ┌────────┐  │
│  │Architect│───▶│Backend │Frontend│───▶│   QA   │──▶│Security│──▶│Reviewer│  │
│  └────────┘    │Engineer│Engineer│    │Engineer│   │Engineer│   └────────┘  │
│                └─────────────────┘    └────────┘   └────────┘               │
│                    (parallel)                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Phases

### Phase 1: Architecture & Design

**Agents:** Architect, Product Manager, UI Designer

**Objective:** Define system design, API contracts, and UI specifications.

| Agent | Responsibility | Outputs |
|-------|---------------|---------|
| Product Manager | Define requirements | `knowledge/product.md` |
| Architect | Design system architecture | `docs/architecture.md` |
| UI Designer | Create UI specifications | `ui/` |

**Exit Criteria:**
- [ ] Requirements documented
- [ ] API contracts defined
- [ ] Data models specified
- [ ] UI components designed

**Next Phase Trigger:** All Phase 1 tasks marked `completed`

---

### Phase 2: Implementation

**Agents:** Backend Engineer, Frontend Engineer (parallel)

**Objective:** Implement backend services and frontend application.

| Agent | Responsibility | Outputs |
|-------|---------------|---------|
| Backend Engineer | Implement APIs and services | `services/backend/` |
| Frontend Engineer | Implement UI and client logic | `services/frontend/` |

**Parallel Execution Rules:**
- Both agents start simultaneously when Phase 1 completes
- Each agent works independently on owned directories
- No blocking between agents unless explicit dependency exists
- Phase completes when BOTH agents finish

**Exit Criteria:**
- [ ] All API endpoints implemented
- [ ] All UI components implemented
- [ ] Unit tests written and passing
- [ ] Integration points connected

**Next Phase Trigger:** Both Backend and Frontend tasks marked `completed`

---

### Phase 3: Testing & QA

**Agents:** QA Engineer

**Objective:** Validate implementation meets requirements.

| Agent | Responsibility | Outputs |
|-------|---------------|---------|
| QA Engineer | Execute test suites | `tests/` |

**Testing Scope:**
1. Unit test verification
2. Integration testing
3. End-to-end testing
4. Regression testing

**Exit Criteria:**
- [ ] All tests passing
- [ ] Test coverage meets threshold (>80%)
- [ ] No critical bugs open
- [ ] Acceptance criteria validated

**Next Phase Trigger:** QA approval and all tests passing

---

### Phase 4: Security Audit

**Agents:** Security Engineer

**Objective:** Ensure code meets security standards.

| Agent | Responsibility | Outputs |
|-------|---------------|---------|
| Security Engineer | Security audit | `security/audits/` |

**Audit Scope:**
1. Vulnerability scanning
2. Authentication/authorization review
3. Input validation check
4. Dependency audit
5. Secret detection

**Exit Criteria:**
- [ ] No critical vulnerabilities
- [ ] No high vulnerabilities (or documented exceptions)
- [ ] Security best practices followed
- [ ] Audit report completed

**Next Phase Trigger:** Security approval or documented risk acceptance

---

### Phase 5: Code Review

**Agents:** Reviewer

**Objective:** Final quality validation before completion.

| Agent | Responsibility | Outputs |
|-------|---------------|---------|
| Reviewer | Code review | `docs/reviews/` |

**Review Scope:**
1. Code quality assessment
2. Standards compliance
3. Documentation completeness
4. Performance considerations

**Exit Criteria:**
- [ ] All review comments addressed
- [ ] Code meets quality standards
- [ ] Documentation complete
- [ ] Ready for deployment

**Completion Trigger:** Reviewer approval

---

## Phase Transitions

```
┌──────────────────────────────────────────────────────────────────┐
│                    PHASE TRANSITION RULES                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Current Phase     Condition                    Next Phase       │
│  ─────────────     ─────────────────────────    ──────────       │
│  Phase 1           All design tasks done    →   Phase 2          │
│  Phase 2           All impl tasks done      →   Phase 3          │
│  Phase 3           All tests passing        →   Phase 4          │
│  Phase 4           Security approved        →   Phase 5          │
│  Phase 5           Review approved          →   COMPLETE         │
│                                                                  │
│  ANY PHASE         Critical blocker         →   BLOCKED          │
│  BLOCKED           Blocker resolved         →   Resume Phase     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Workflow States

| State | Description |
|-------|-------------|
| `pending` | Workflow created but not started |
| `phase-1` | Architecture & Design in progress |
| `phase-2` | Implementation in progress |
| `phase-3` | Testing in progress |
| `phase-4` | Security audit in progress |
| `phase-5` | Code review in progress |
| `blocked` | Workflow blocked by issue |
| `completed` | All phases completed successfully |
| `cancelled` | Workflow cancelled |

## Engine Operations

### Starting a Workflow

```json
{
  "action": "start_workflow",
  "featureId": "FEAT-001",
  "featureName": "User Authentication",
  "priority": "high"
}
```

**Engine Steps:**
1. Create feature entry in `core/state/progress.json`
2. Create tasks in `core/tasks/backlog.md`
3. Update `core/state/tasks.json`
4. Notify Phase 1 agents via `core/state/agents.json`

### Phase Completion Check

The engine monitors for phase completion:

```
FOR each active workflow:
  current_phase = workflow.phase
  phase_tasks = tasks WHERE featureId = workflow.id AND phase = current_phase
  
  IF all phase_tasks.status == "completed":
    IF current_phase < 5:
      advance_to_next_phase(workflow)
    ELSE:
      mark_workflow_completed(workflow)
```

### Handling Blockers

When a task is blocked:

1. Task owner updates status to `blocked` in `in-progress.md`
2. Engine detects blocked status
3. Engine notifies blocking agent via `waitingFor` field
4. Workflow pauses until blocker resolved
5. Original agent resumes when unblocked

## Supporting Agents

These agents operate across all phases as needed:

| Agent | Role | Activation |
|-------|------|------------|
| DevOps Engineer | Infrastructure & CI/CD | On-demand |
| Performance Engineer | Optimization | Phase 3+ |

## Workflow Configuration

Workflows can be customized per feature:

```json
{
  "featureId": "FEAT-001",
  "phases": {
    "1": { "required": true, "agents": ["architect", "product-manager"] },
    "2": { "required": true, "parallel": true },
    "3": { "required": true },
    "4": { "required": true },
    "5": { "required": true }
  },
  "skipPhases": [],
  "customAgents": {}
}
```

## Monitoring

Track workflow progress via:

- `core/state/progress.json` - Feature-level progress
- `core/state/tasks.json` - Task-level status
- `core/state/agents.json` - Agent activity
- `core/tasks/in-progress.md` - Human-readable active work

## Error Handling

| Error | Action |
|-------|--------|
| Agent unresponsive | Mark agent `offline`, reassign tasks |
| Task failed | Mark `blocked`, notify owner |
| Dependency cycle | Reject workflow, request restructure |
| Timeout | Escalate to human operator |
