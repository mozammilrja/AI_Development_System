# Debug Investigation Team Template

## Team Structure
- **Team size**: 3 teammates
- **Pattern**: Parallel competing hypotheses with adversarial debate
- **Estimated tasks per teammate**: 2-3

## Dependency Graph
```
Investigator A ──┐
Investigator B ──┼── (all parallel, messaging each other)
Investigator C ──┘
        └── Lead synthesizes winner
```

## Teammate Definitions

### 1. Investigator A — Logic Error Hypothesis
**Spawn prompt:**
> Investigate this bug: {{BUG_DESCRIPTION}}. Your hypothesis: the root cause is a LOGIC ERROR —
> incorrect conditionals, wrong variable usage, off-by-one errors, or flawed algorithm.
> Trace the code path from the entry point. Search for the specific symptoms described.
> Share evidence with other investigators via messages. Actively try to DISPROVE
> Investigator B and C's theories when they share findings. Report your confidence level
> (low/medium/high) as you progress.

**Focus area:** Code logic, control flow, algorithm correctness

### 2. Investigator B — State/Data Hypothesis
**Spawn prompt:**
> Investigate this bug: {{BUG_DESCRIPTION}}. Your hypothesis: the root cause is a DATA OR STATE
> ISSUE — race condition, stale cache, incorrect initialization, missing validation, or
> corrupted state. Check data flow, state mutations, and async timing. Look for places where
> state could become inconsistent. Share evidence with other investigators via messages.
> Actively try to DISPROVE Investigator A and C's theories. Report your confidence level.

**Focus area:** State management, data flow, race conditions, caching

### 3. Investigator C — Integration/Dependency Hypothesis
**Spawn prompt:**
> Investigate this bug: {{BUG_DESCRIPTION}}. Your hypothesis: the root cause is an INTEGRATION
> OR DEPENDENCY ISSUE — API contract mismatch, version incompatibility, configuration error,
> or external service failure. Check configs, dependency versions, API contracts, and
> environment variables. Share evidence with other investigators via messages. Play devil's
> advocate against BOTH other investigators. Report your confidence level.

**Focus area:** External dependencies, API contracts, configuration, environment

## Resolution Protocol
After all investigators finish:
1. Lead reviews all evidence and messages exchanged
2. Determine which hypothesis survived the adversarial debate
3. Write the fix based on the winning theory
4. Run tests to validate the fix
5. Document the root cause in `knowledge/lessons_learned.md`

## Placeholders
- `{{BUG_DESCRIPTION}}` — Full description of the bug including error messages, stack traces, and reproduction steps

## Best Practices
- The debate structure prevents anchoring bias — investigators must actively challenge each other
- All three work in parallel with no blocking dependencies
- Investigators should share evidence frequently, not just at the end
- The winning theory should have survived explicit disproval attempts
