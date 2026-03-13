# Code Review Command

Review the current changes using a multi-perspective team: $ARGUMENTS

Create an agent team with 3 reviewers, each focused on a different quality dimension. They work in PARALLEL — no dependencies between them.

Spawn these teammates:

1. **Security Reviewer** — Focus exclusively on security implications:
   - Check for injection vulnerabilities (SQL, XSS, command injection)
   - Review authentication and authorization logic
   - Verify input validation and sanitization
   - Check for secrets/credentials in code
   - Review dependency versions for known CVEs
   - Rate each finding: Critical / High / Medium / Low
   - Read-only: do NOT edit source files

2. **Performance Reviewer** — Focus exclusively on performance impact:
   - Check for N+1 queries, unbounded loops, memory leaks
   - Review async/await usage and concurrency patterns
   - Identify unnecessary allocations or expensive operations
   - Check caching opportunities
   - Review database query efficiency
   - Rate each finding: Critical / High / Medium / Low
   - Read-only: do NOT edit source files

3. **Test Coverage Reviewer** — Focus exclusively on test adequacy:
   - Run `pytest --cov` and analyze coverage reports
   - Identify untested code paths and edge cases
   - Check that error handling paths have tests
   - Verify integration boundaries are tested
   - Suggest specific test cases that should be added
   - Rate each gap: Critical / High / Medium / Low
   - Read-only: do NOT edit source files

All reviewers work in PARALLEL — they examine the same codebase independently with different lenses.

After all reviewers complete, synthesize findings:
- Combined report organized by severity (Critical → Low)
- Deduplicate overlapping findings
- Prioritized action items for the developer

Refer to `core/agents/teams/review_team.md` for the full team template.
