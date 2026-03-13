# Code Review Team Template

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
