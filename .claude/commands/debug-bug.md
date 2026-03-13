# Debug Bug Command

Investigate this bug using competing hypotheses: $ARGUMENTS

Create an agent team with 3 teammates. Each teammate investigates a DIFFERENT hypothesis about the root cause. They should actively message each other to challenge and disprove each other's theories, like a scientific debate.

Spawn these teammates:

1. **Investigator A** — Hypothesis: the bug is caused by a logic error in the core module. Search the codebase for incorrect conditionals, off-by-one errors, or wrong variable usage near the reported symptoms.
   - Read the error description carefully
   - Trace the code path from the entry point
   - Message other investigators with evidence for or against their theories

2. **Investigator B** — Hypothesis: the bug is caused by a data/state issue — race condition, stale cache, incorrect initialization, or missing validation.
   - Check data flow and state mutations
   - Look for async timing issues
   - Challenge Investigator A's theory with counter-evidence if you find it

3. **Investigator C** — Hypothesis: the bug is caused by an integration or dependency issue — API contract mismatch, version incompatibility, or configuration error.
   - Check external integrations and dependency versions
   - Review configuration files and environment variables
   - Play devil's advocate against both other investigators

All investigators should:
- Share evidence with each other as they find it
- Explicitly try to DISPROVE each other's hypotheses
- Update the lead with their confidence level (low/medium/high) as investigation progresses

After all investigators finish, synthesize findings:
- Which hypothesis survived the debate?
- Write the fix based on the winning theory
- Run tests to validate the fix

Refer to `core/agents/teams/debug_team.md` for the full team template.
