# System Architecture

## Overview
The AI Dev System follows a layered architecture with clear separation of concerns.

## Layers

### 1. Orchestration Layer
- **Graph Engine**: DAG-based workflow execution with dependency resolution
- **Agent Planner**: Maps tasks to appropriate agents
- **Task Scheduler**: Priority-based task queue management
- **Dependency Manager**: Tracks and resolves inter-task dependencies

### 2. Agent Layer
Each agent is specialized for a domain and has:
- A model client for LLM interaction
- Access to specific tools via the tool registry
- Defined permissions and constraints

### 3. Workflow Layer
Pre-defined workflows that compose agents:
- Development Flow: Requirements → Design → Build → Test → Review → Docs
- Debug Flow: Error → Analysis → Root Cause → Fix → Validate
- Release Flow: Test → Audit → Stage → Smoke → Deploy
- Research Flow: Search → Evaluate → Document → Store

### 4. Model Layer
- Model Router: Selects optimal model per task
- Fallback Strategy: Automatic failover between models
- Cost Optimizer: Budget-aware model selection

### 5. RAG Layer
- Vector Store: Document embeddings and similarity search
- Embedding Pipeline: Document chunking and indexing
- Query Engine: Context-aware question answering

### 6. Tool Layer
Shared tools available to agents:
- File Editor, Repo Reader, Git Manager
- Code Parser, Web Search, Terminal Executor
- Browser automation tools

## Data Flow
```
User Request → Task Router → Workflow → Graph Engine → Agents → Tools → Results
```
