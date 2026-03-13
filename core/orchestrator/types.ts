/** Shared types for the orchestration layer. */

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/** 10-agent autonomous team */
export type AgentName =
  | 'product-manager'
  | 'architect'
  | 'backend-engineer'
  | 'frontend-engineer'
  | 'ui-designer'
  | 'devops-engineer'
  | 'security-engineer'
  | 'qa-engineer'
  | 'performance-engineer'
  | 'code-reviewer';

export type WorkflowType = 'development' | 'debug' | 'review' | 'release' | 'research';
export type TeamPattern = 'sequential' | 'parallel' | 'sequential_parallel' | 'adversarial' | 'autonomous_parallel' | 'phased_sequential';

/** Phase definition for phased_sequential workflows */
export interface WorkflowPhase {
  name: string;
  agents: AgentName[];
  blocking: boolean;
  parallel?: boolean;
  requiresApproval?: boolean;
}

/** A single task within a workflow. */
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: AgentName;
  status: TaskStatus;
  priority: TaskPriority;
  workflowId: string;
  dependsOn: string[];
  output?: string;
  filesChanged?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Result returned after an agent finishes a task. */
export interface AgentRunResult {
  taskId: string;
  agentName: string;
  status: 'completed' | 'failed';
  output: string | null;
  filesChanged: string[];
  startedAt: Date;
  completedAt: Date;
  tokenUsage?: { input: number; output: number };
  error?: string;
}

/** Agent definition loaded from core/agents/definitions/*.yaml */
export interface AgentDefinition {
  name: AgentName;
  role: string;
  description: string;
  model: { primary: string; fallback: string; temperature: number };
  tools: string[];
  permissions: {
    read: string | string[];
    write: string[];
    execute: string[] | boolean;
  };
}

/** Team template metadata from core/agents/teams/*.md */
export interface TeamTemplate {
  name: string;
  goal: string;
  members: AgentName[];
  pattern: TeamPattern;
  phases?: WorkflowPhase[];
  taskFlow: string[];
}

/** Workflow state persisted to MongoDB. */
export interface WorkflowState {
  id: string;
  type: WorkflowType;
  status: TaskStatus;
  teamName: string;
  tasks: string[]; // task IDs
  context: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
}

/** Message exchanged between agents during a team workflow. */
export interface TeamMessage {
  id: string;
  workflowId: string;
  fromAgent: AgentName;
  toAgent: AgentName | 'broadcast';
  content: string;
  timestamp: Date;
}

/** Controls how many agents may run simultaneously. */
export interface ConcurrencyConfig {
  /** Max agents that can execute at the same time (default: 4). */
  maxParallel: number;
  /** If true, abort the entire batch on the first failure (default: false). */
  failFast: boolean;
}

/** Result of a batch/parallel run. */
export interface BatchRunResult {
  results: AgentRunResult[];
  totalDurationMs: number;
  succeeded: number;
  failed: number;
}

/** A file-write claim used for conflict detection. */
export interface WriteClaim {
  agentName: AgentName;
  patterns: string[];
}
