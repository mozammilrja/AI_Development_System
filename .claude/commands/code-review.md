# Code Review Command

Review the current codebase: **$ARGUMENTS**

---

## Multi-Perspective Parallel Review

This command spawns 4 specialized reviewers that work **in parallel** to provide comprehensive code review.

---

## Review Team

Spawn all reviewers **simultaneously**:

| # | Reviewer | Focus Area | Writes To |
|---|----------|------------|----------|
| 1 | **Security Reviewer** | Security vulnerabilities, auth, data exposure | `reviews/security/` |
| 2 | **Performance Reviewer** | Performance issues, bottlenecks | `reviews/tests/benchmarks/` |
| 3 | **Quality Reviewer** | Code quality, patterns, maintainability | `reviews/quality/` |
| 4 | **Test Reviewer** | Test coverage, test quality | `reviews/tests/` |

---

## Review Focus Areas

### Security Reviewer
```
- OWASP Top 10 vulnerabilities
- SQL/NoSQL injection
- XSS and CSRF
- Authentication/authorization flaws
- Secrets in code
- Dependency vulnerabilities
```

### Performance Reviewer
```
- N+1 queries
- Memory leaks
- Unbounded loops
- Inefficient algorithms
- Caching opportunities
- Bundle size issues
```

### Quality Reviewer
```
- Code style and conventions
- Design patterns
- SOLID principles
- Error handling 
- Documentation
- Maintainability
```

### Test Reviewer
```
- Test coverage percentage
- Untested edge cases
- Test quality
- Missing integration tests
- E2E coverage
```

---

## Severity Ratings

| Severity | Description |
|----------|-------------|
| Critical | Must fix before deployment |
| High | Should fix before deployment |
| Medium | Should fix soon |
| Low | Nice to fix |

---

## Output

Each reviewer writes findings to their directory in `reviews/`.

After all reviewers complete, generate `reviews/summary.md`:

```markdown
# Code Review Summary

## Overview
- Files reviewed: N
- Total issues: N (N critical, N high, N medium, N low)

## Findings by Category
### Security (N issues)
### Performance (N issues)
### Quality (N issues)
### Test Coverage (N issues)

## Recommendation
[APPROVED / APPROVED WITH RESERVATIONS / CHANGES REQUESTED]
```

---

## Execution

All reviewers work **in parallel** with NO dependencies:
1. Each reviewer examines the codebase independently
2. Findings are written to respective directories
3. Summary is generated after all complete
