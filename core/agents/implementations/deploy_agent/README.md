# Deploy Agent

## Purpose

Contains the implementation for the **DevOps** agent, responsible for Docker, Terraform, CI/CD, and deployment operations.

## Owned Paths

- `platform/`
- `platform/environments/`

## Files

| File | Description |
|------|-------------|
| `agent.ts` | Agent definition, system prompt, and execute entry point |
| `tools.ts` | Tool descriptors (file_editor, terminal_executor) |
