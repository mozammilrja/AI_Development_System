# Debug Agent

## Purpose

Contains the implementation for the **Debugger** agent, responsible for root-cause analysis via adversarial hypothesis testing.

## Owned Paths

- Cross-codebase write access (the only agent with global write permissions)
- `docs/knowledge/lessons_learned.md` (post-fix documentation)

## Files

| File | Description |
|------|-------------|
| `agent.ts` | Agent definition, system prompt, and execute entry point |
| `tools.ts` | Tool descriptors (file_editor, code_parser, terminal, git) |
