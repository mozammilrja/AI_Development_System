# knowledge/

## Purpose

Shared engineering knowledge base for AI agents. Agents must consult these files before implementing code.

## Files

### Engineering Guidelines

| File | Purpose | Consult Before |
|------|---------|----------------|
| [api-design-guidelines.md](api-design-guidelines.md) | RESTful API design standards | Building APIs |
| [coding-standards.md](coding_standards.md) | TypeScript/React conventions | Writing any code |
| [architecture-patterns.md](architecture-patterns.md) | Design patterns and principles | Designing components |
| [testing-guidelines.md](testing-guidelines.md) | Testing strategy and practices | Writing tests |
| [security-best-practices.md](security-best-practices.md) | Security standards (OWASP) | Security-related code |
| [performance-optimization.md](performance-optimization.md) | Performance patterns | Optimizing code |

### Project Context

| File | Purpose |
|------|---------|
| [product.md](product.md) | Product requirements and roadmap |
| [architecture.md](architecture.md) | System architecture overview |
| [project_context.md](project_context.md) | Current project state |
| [lessons_learned.md](lessons_learned.md) | Past issues and solutions |
| [agent_system.md](agent_system.md) | Agent collaboration documentation |
| [copilot_usage.md](copilot_usage.md) | AI assistant guidelines |

## Usage by Agents

### Before Implementation

```
1. Read coding_standards.md for conventions
2. Read architecture-patterns.md for design guidance
3. Check api-design-guidelines.md for API work
4. Review security-best-practices.md for security concerns
```

### During Testing

```
1. Follow testing-guidelines.md structure
2. Meet coverage requirements
3. Use recommended patterns
```

### During Optimization

```
1. Reference performance-optimization.md
2. Follow caching strategies
3. Apply recommended techniques
```

## Agent Reference Matrix

| Agent | Must Read |
|-------|-----------|
| Architect | architecture-patterns.md, api-design-guidelines.md |
| Backend Engineer | coding_standards.md, api-design-guidelines.md, security-best-practices.md |
| Frontend Engineer | coding_standards.md, performance-optimization.md |
| QA Engineer | testing-guidelines.md, coding_standards.md |
| Security Engineer | security-best-practices.md |
| Performance Engineer | performance-optimization.md |
| Reviewer | All guidelines for review context |

## Updating Knowledge

When updating these files:

1. Document the change clearly
2. Update examples to match current stack
3. Notify affected agents via state files
4. Update lessons_learned.md with new insights
