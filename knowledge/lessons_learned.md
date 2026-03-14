# Lessons Learned

## Agent Design
- Agents work better with narrow, well-defined responsibilities
- Tool access should be restricted to what each agent needs
- Fallback strategies are essential for production reliability

## Model Selection
- Use cheaper models for simple tasks (formatting, basic generation)
- Reserve powerful models for complex reasoning (architecture, debugging)
- Always implement fallback chains for model failures

## Workflow Design
- Break complex workflows into small, testable steps
- Support parallel execution where possible
- Always include validation steps between major phases
- Build rollback capability into deployment workflows

## Knowledge Management
- Keep knowledge base updated with every significant decision
- Chunk documents appropriately for embedding quality
- Re-index after major codebase changes

## Testing
- E2E tests are most valuable for catching integration issues
- Browser tests need proper wait strategies for dynamic content
- Test isolation prevents flaky tests
