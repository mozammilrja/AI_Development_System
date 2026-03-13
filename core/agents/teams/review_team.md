# Code Review Team Template

## Team Goal

Perform a comprehensive, multi-perspective code review by running three independent reviewers in parallel — each focused on a different quality dimension (security, performance, test coverage). The lead deduplicates and prioritizes findings into a single actionable report.

## Team Members

| # | Agent | Role on Team |
|---|-------|--------------|
| 1 | Security Reviewer | Scans for vulnerabilities, auth flaws, injection risks |
| 2 | Performance Reviewer | Finds N+1 queries, memory leaks, blocking I/O, missing caching |
| 3 | Test Coverage Reviewer | Identifies untested paths, missing edge-case tests, coverage gaps |

## Responsibilities

| Agent | Must Do | Must NOT Do |
|-------|---------|-------------|
| Security Reviewer | Check OWASP Top 10, auth/authz, input validation, secrets, CVEs | Edit source files |
| Performance Reviewer | Check query efficiency, async correctness, memory, hot paths | Edit source files |
| Coverage Reviewer | Run coverage tools, identify untested paths, suggest test cases | Edit source files |
| Lead | Deduplicate, sort by severity, produce combined report | Edit source files |

## File Ownership

| Agent | Writable Paths |
|-------|----------------|
| Security Reviewer | None (read-only) |
| Performance Reviewer | None (read-only) |
| Coverage Reviewer | None (read-only) |
| Lead | None (read-only; report delivered as output) |

The entire review team is **read-only**. No files are modified during review.

## Communication Rules

1. **No cross-talk**: Reviewers work independently — they do not message each other.
2. **Structured output**: Each reviewer rates findings as Critical / High / Medium / Low.
3. **Reviewers → Lead**: Findings delivered as structured reports when each reviewer finishes.
4. **Lead → Requester**: Combined report with deduplicated, severity-sorted action items.
5. **Scope boundary**: Each reviewer stays in their lane (security / performance / coverage).

## Task Flow

```
1. Security Reviewer   ──┐
2. Performance Reviewer ──┼── all parallel, no dependencies
3. Coverage Reviewer    ──┘
         │
4. Lead deduplicates and merges findings
5. Lead sorts by severity (Critical → Low)
6. Lead delivers combined review report
```

## Team Structure
- **Team size**: 3 teammates
- **Pattern**: Fully parallel, independent reviewers with different lenses
- **Estimated tasks per teammate**: 3-4

## Dependency Graph
```
Security Reviewer    ──┐
Performance Reviewer ──┼── (all parallel, no dependencies)
Coverage Reviewer    ──┘
        └── Lead synthesizes combined report
```

## Teammate Definitions

### 1. Security Reviewer
**Spawn prompt:**
> Review all recent code changes for SECURITY vulnerabilities only. Focus on:
> - Injection attacks (SQL injection, XSS, command injection)
> - Authentication and authorization flaws
> - Input validation and sanitization gaps
> - Secrets or credentials committed to code
> - Dependency vulnerabilities (check versions against known CVEs)
> - Insecure deserialization or data handling
> Rate each finding: Critical / High / Medium / Low.
> Do NOT edit any source files — report findings only.
> {{REVIEW_CONTEXT}}

**File ownership:** None (read-only)

### 2. Performance Reviewer
**Spawn prompt:**
> Review all recent code changes for PERFORMANCE issues only. Focus on:
> - N+1 queries and database query efficiency
> - Unbounded loops or recursive calls
> - Memory leaks or unnecessary allocations
> - Missing async/await or blocking I/O in async contexts
> - Missing caching opportunities
> - Expensive operations in hot paths
> Rate each finding: Critical / High / Medium / Low.
> Do NOT edit any source files — report findings only.
> {{REVIEW_CONTEXT}}

**File ownership:** None (read-only)

### 3. Test Coverage Reviewer
**Spawn prompt:**
> Review test coverage for all recent code changes. Focus on:
> - Run `pytest --cov` and analyze the coverage report
> - Identify untested code paths and edge cases
> - Check that error handling and exception paths have tests
> - Verify integration boundaries between components are tested
> - Check for missing E2E test scenarios
> Suggest specific test cases that should be added, with code sketches.
> Rate each gap: Critical / High / Medium / Low.
> Do NOT edit source files — only report and suggest.
> {{REVIEW_CONTEXT}}

**File ownership:** None (read-only)

## Resolution Protocol
After all reviewers finish:
1. Lead collects findings from all three reviewers
2. Deduplicate any overlapping findings
3. Sort by severity (Critical → High → Medium → Low)
4. Produce a combined review report with prioritized action items

## Placeholders
- `{{REVIEW_CONTEXT}}` — Optional: PR number, specific files, or branch name to review

## Best Practices
- All reviewers work in parallel — no dependencies between them
- Each reviewer stays in their lane (security / performance / coverage)
- Reviewers are read-only to prevent file conflicts
- The lead should not modify files either — present the report for the developer
