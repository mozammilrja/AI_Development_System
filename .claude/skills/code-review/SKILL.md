# Code Review Skill

## Description
Automated code review skill that analyzes code changes for quality, security, and best practices.

## Capabilities
- Analyze diffs for code quality issues
- Check for security vulnerabilities (OWASP Top 10)
- Verify coding standards compliance
- Detect code smells and anti-patterns
- Suggest performance improvements
- Validate error handling patterns
- Check test coverage for changes
- Generate review comments with severity levels

## Review Categories
1. **Security**: Injection, XSS, CSRF, auth issues
2. **Performance**: N+1 queries, memory leaks, unnecessary computation
3. **Quality**: Code duplication, complexity, naming conventions
4. **Correctness**: Logic errors, edge cases, race conditions
5. **Maintainability**: Documentation, modularity, coupling

## Output Format
```json
{
  "summary": "Overall review summary",
  "score": 85,
  "issues": [
    {
      "severity": "high",
      "category": "security",
      "file": "src/auth.py",
      "line": 42,
      "message": "SQL injection vulnerability",
      "suggestion": "Use parameterized queries"
    }
  ]
}
```
