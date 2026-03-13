# Agent Workflows

This directory contains workflow definitions for multi-agent collaboration patterns.

## Available Workflows

### Feature Development
See `../agents/teams/feature_team.md`
- **Pipeline**: Architect → Planner → Frontend + Backend (parallel) → QA → Reviewer
- **Use case**: Building new features

### Debug Investigation  
See `../agents/teams/debug_team.md`
- **Pipeline**: Multiple investigators (parallel) → Lead synthesis
- **Use case**: Bug analysis and fix generation

### Code Review
See `../agents/teams/review_team.md`
- **Pipeline**: Security + Reviewer + QA (parallel) → Summary
- **Use case**: Multi-lens code review

### Release Deployment
See `../agents/teams/release_team.md`
- **Pipeline**: DevOps → QA Validation → Deploy
- **Use case**: Staging and production deployment

### Research & Evaluation
See `../agents/teams/research_team.md`
- **Pipeline**: Proponent + Critic + Neutral (adversarial)
- **Use case**: Technology evaluation

## Workflow Invocation

Workflows are invoked via Claude Code slash commands:

```
/build-feature <feature-name>    # Feature development team
/debug-bug <description>         # Debug investigation team
/code-review                     # Code review team
/deploy-app --env staging        # Release team
/research-tech <topic>           # Research team
```

## Custom Workflows

To create a custom workflow:

1. Define the team template in `../agents/teams/`
2. Create a command in `../../.claude/commands/`
3. Document the workflow in `../../docs/workflow.md`
