# Coding Standards

## Python
- Python 3.11+
- Type hints on all function signatures
- Use `dataclass` for data structures
- Async/await for I/O operations
- Black for formatting, Ruff for linting
- Pytest for testing

## TypeScript/React
- TypeScript strict mode
- Functional components with hooks
- CSS Modules or Tailwind CSS
- ESLint + Prettier
- React Testing Library for tests

## General
- Keep functions under 30 lines
- Single responsibility principle
- Meaningful variable and function names
- Document complex logic with comments
- All public APIs must have docstrings
- No hardcoded secrets or credentials
- Use environment variables for configuration

## Git
- Conventional commits (feat:, fix:, docs:, refactor:, test:)
- Branch naming: feature/, fix/, docs/, refactor/
- Squash merge to main
- All changes require code review

## Security
- Validate all inputs at system boundaries
- Use parameterized queries for database access
- Sanitize user-facing output
- Follow OWASP Top 10 guidelines
- No secrets in code or logs
