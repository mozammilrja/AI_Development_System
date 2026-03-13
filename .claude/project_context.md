# Project Context

## AI Development System

### Overview
A multi-agent AI development system that orchestrates specialized AI agents to automate software development workflows including coding, testing, debugging, deployment, and research.

### Architecture
- **Orchestration Layer**: Graph-based workflow engine that coordinates agent execution
- **Agent Layer**: Specialized agents for different development tasks
- **Tool Layer**: Shared tools for file editing, git operations, browser automation
- **RAG Layer**: Vector-based retrieval for project knowledge
- **Learning Layer**: Feedback loops for continuous agent improvement

### Key Components
1. **Agent Orchestrator**: Routes tasks to appropriate agents based on complexity and type
2. **Workflow Engine**: Executes multi-step development workflows
3. **Model Router**: Selects optimal LLM model based on task requirements and cost
4. **Knowledge Base**: RAG-powered project context and documentation retrieval
5. **Tool Registry**: Manages available tools and their permissions

### Development Principles
- Agents should be composable and reusable
- All agent actions must be auditable
- Security and governance policies apply to all tool usage
- Continuous learning from feedback and outcomes
- Cost optimization across model usage
