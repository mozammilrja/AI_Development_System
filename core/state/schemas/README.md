# State Schemas

JSON Schema definitions for state file validation.

## Files

| Schema | Validates |
|--------|-----------|
| `tasks.schema.json` | `../tasks.json` |
| `agents.schema.json` | `../agents.json` |
| `progress.schema.json` | `../progress.json` |

## Usage

State files reference their schema via `$schema` property:

```json
{
  "$schema": "./schemas/tasks.schema.json",
  "version": "1.0.0",
  "tasks": []
}
```

## Validation

Agents should validate updates against schemas before writing to ensure data integrity and prevent coordination errors.
