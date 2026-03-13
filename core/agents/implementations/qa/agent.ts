import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'qa',
  role: 'QA Engineer',
  description: 'Defines test strategy, writes acceptance criteria, and validates quality standards.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.2 },
  tools: ['file_editor', 'repo_reader', 'terminal_executor'],
  permissions: {
    read: 'all',
    write: ['tests/**'],
    execute: ['npm', 'npx'],
  },
};

export const systemPrompt = `You are a senior QA engineer. Define test strategies, write acceptance
criteria, and validate that implementations meet quality standards. Focus on edge cases, error
paths, and user experience flows.`;

export interface QAInput {
  taskDescription: string;
  context?: Record<string, unknown>;
}

export async function execute(input: QAInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `QA plan for: ${input.taskDescription}`,
    filesChanged: [],
  };
}
