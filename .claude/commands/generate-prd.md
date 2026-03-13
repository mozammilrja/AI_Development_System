# Generate PRD Command

## Usage
```
/generate-prd <feature_name> [--template feature|bugfix|epic] [--stakeholders <list>]
```

## Description
Generates a Product Requirements Document using AI analysis:
1. Gather feature context from conversation
2. Analyze existing codebase for impact
3. Generate structured PRD from template
4. Include technical requirements and constraints
5. Define acceptance criteria
6. Estimate complexity

## Parameters
- `feature_name`: Name of the feature or initiative
- `--template`: PRD template to use (default: feature)
- `--stakeholders`: List of stakeholders
- `--priority`: Feature priority
- `--sprint`: Target sprint

## Workflow
1. Collect feature description and goals
2. Analyze codebase impact
3. Identify dependencies and risks
4. Select appropriate template
5. Generate PRD with all sections
6. Save to .claude/PRD/ directory
