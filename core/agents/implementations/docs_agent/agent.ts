import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'documentation',
  role: 'Documentation Writer',
  description: 'Writes and maintains technical documentation, API docs, and developer guides.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.4 },
  tools: ['file_editor', 'repo_reader'],
  permissions: {
    read: 'all',
    write: ['docs/**', 'README.md'],
    execute: false,
  },
};

export const systemPrompt = `You are a senior technical writer. Write clear, accurate documentation
that explains how the system works, how to use it, and how to extend it. Keep docs synchronized
with the actual codebase. Follow Markdown best practices.`;

export interface DocsInput {
  taskDescription: string;
  context?: Record<string, unknown>;
}

export async function execute(input: DocsInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Documentation for: ${input.taskDescription}`,
    filesChanged: [],
  };
}
