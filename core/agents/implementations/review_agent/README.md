# Review Agent

## Purpose

Contains the implementation for the **Reviewer** agent, responsible for read-only code quality, security, and performance reviews.

## Owned Paths

- None (read-only everywhere)

## Files

| File | Description |
|------|-------------|
| `agent.ts` | Agent definition, system prompt, and execute entry point |
| `tools.ts` | Tool descriptors (repo_reader, code_parser — read-only) |
