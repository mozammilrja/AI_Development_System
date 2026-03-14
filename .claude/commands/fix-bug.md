# Fix Bug Command

Fix the bug: **$ARGUMENTS**

---

## Workflow Activation

This command activates a targeted bug-fix workflow with minimal agent involvement.

---

## Phase 1: Initialize Bug Fix

```
1. Generate Bug ID: BUG-XXX
2. Create bug entry in core/state/tasks.json
3. Add task to core/tasks/backlog.md
4. Determine affected agent(s) based on bug location
5. Notify assigned agent via core/state/agents.json
```

### Bug Analysis

```
ANALYZE bug report: "$ARGUMENTS"
IDENTIFY:
  - Affected component (backend/frontend/both)
  - Severity (critical/high/medium/low)
  - Assigned agent(s)
  - Related files
```

### Create Bug Tasks

| Task ID | Agent | Description |
|---------|-------|-------------|
| TASK-BUG-001 | (determined by analysis) | Diagnose and fix bug |
| TASK-BUG-002 | qa-engineer | Verify fix and add regression test |
| TASK-BUG-003 | reviewer | Review bug fix |

---

## Phase 2: Diagnosis

**Agent:** Backend Engineer OR Frontend Engineer (based on bug location)

```
ASSIGNED AGENT:
1. Claim TASK-BUG-001 from backlog
2. Update agents.json: status = "working"
3. Analyze bug report: "$ARGUMENTS"
4. Identify root cause:
   - Read error logs
   - Reproduce issue
   - Trace code path
   - Identify faulty code
5. Document findings in task progress
```

**Diagnosis Checklist:**
- [ ] Bug reproduced
- [ ] Root cause identified
- [ ] Affected files located
- [ ] Fix approach determined

---

## Phase 3: Fix Implementation

**Agent:** Same as diagnosis

```
ASSIGNED AGENT:
1. Implement fix in owned directory:
   - Backend: services/backend/
   - Frontend: services/frontend/
2. Write/update unit tests to cover bug scenario
3. Verify fix locally
4. Update task progress
5. Mark diagnosis/fix task complete
```

**Fix Checklist:**
- [ ] Code fix implemented
- [ ] Unit test added for bug case
- [ ] Existing tests still pass
- [ ] No new warnings/errors

---

## Phase 4: Verification

**Agent:** QA Engineer

```
QA ENGINEER:
1. Claim TASK-BUG-002 from backlog
2. Verify bug is fixed:
   - Run reproduction steps
   - Confirm expected behavior
3. Add regression test:
   - Create test case in tests/
   - Ensure test fails without fix
   - Ensure test passes with fix
4. Run full test suite
5. Mark verification task complete
```

**Verification Checklist:**
- [ ] Bug no longer reproduces
- [ ] Regression test added
- [ ] All tests passing
- [ ] No side effects observed

---

## Phase 5: Review

**Agent:** Reviewer

```
REVIEWER:
1. Claim TASK-BUG-003 from backlog
2. Review fix:
   - Code quality
   - Test adequacy
   - No regressions introduced
3. Write review to docs/reviews/BUG-XXX-review.md
4. Approve or request changes
5. Mark review task complete
```

---

## Phase 6: Completion

```
1. Verify all bug tasks completed
2. Update core/state/tasks.json
3. Generate fix report
4. Agents return to idle
```

---

## State File Updates

| Action | File | Update |
|--------|------|--------|
| Create bug | tasks.json | Add bug task entry |
| Claim task | agents.json | status = "working" |
| Progress | in-progress.md | Update progress notes |
| Complete | tasks.json | status = "completed" |
| Complete | completed.md | Move task to archive |

---

## Bug Fix Report Template

```markdown
# Bug Fix Report: BUG-XXX

## Bug Description
$ARGUMENTS

## Root Cause
[Description of what caused the bug]

## Fix Applied
- File: path/to/file
- Change: Description of code change

## Verification
- Regression test: tests/path/to/test.ts
- Test result: PASS

## Agents Involved
| Agent | Task | Duration |
|-------|------|----------|
| backend-engineer | Fix | Xh |
| qa-engineer | Verify | Xh |
| reviewer | Review | Xh |
```

---

## Execution Loop

```
WHILE bug.status != "completed":
    diagnosis_agent = determine_owner(bug)
    
    # Phase 2-3: Diagnose and Fix
    diagnosis_agent.claim(TASK-BUG-001)
    diagnosis_agent.diagnose()
    diagnosis_agent.fix()
    diagnosis_agent.complete()
    
    # Phase 4: Verify
    qa_engineer.claim(TASK-BUG-002)
    qa_engineer.verify()
    qa_engineer.add_regression_test()
    qa_engineer.complete()
    
    # Phase 5: Review
    reviewer.claim(TASK-BUG-003)
    reviewer.review()
    IF changes_requested:
        GOTO diagnosis_agent fix
    reviewer.approve()
    reviewer.complete()

GENERATE bug_fix_report()
```
