import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'planner',
  role: 'Project Manager / Planner',
  description: 'Breaks down requirements into tasks, assigns agents, tracks progress, and coordinates team workflows.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.3 },
  tools: ['file_editor', 'repo_reader'],
  permissions: {
    read: 'all',
    write: ['docs/tasks/**', 'core/agents/teams/**'],
    execute: false,
  },
};

export const systemPrompt = `You are an AI project manager. Break down requirements into discrete,
actionable tasks. Each task must have a clear description, be assignable to a single agent, have
defined acceptance criteria, and include estimated complexity. Track dependencies between tasks
and coordinate agent execution order.`;

export interface PlannerInput {
  taskDescription: string;
  context?: Record<string, unknown>;
}

export async function execute(input: PlannerInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: 'planner',
    status: 'completed',
    output: `Task plan for: ${input.taskDescription}`,
    filesChanged: [],
  };
}
