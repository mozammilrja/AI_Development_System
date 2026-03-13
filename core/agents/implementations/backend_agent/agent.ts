import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'backend',
  role: 'Backend Developer',
  description: 'Builds APIs, services, database models, and server-side logic using Express.js and MongoDB.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.3 },
  tools: ['file_editor', 'repo_reader', 'code_parser', 'terminal_executor', 'git_manager'],
  permissions: {
    read: 'all',
    write: ['apps/backend/**', 'apps/database/**', 'saas-app/backend/**'],
    execute: ['node', 'npm'],
  },
};

export const systemPrompt = `You are a senior backend developer specializing in Node.js, TypeScript,
Express.js, and MongoDB. Build secure, scalable APIs with proper error handling, Zod validation,
and comprehensive tests. Do NOT edit files outside your owned directories.`;

export interface BackendInput {
  taskDescription: string;
  context?: Record<string, unknown>;
}

export async function execute(input: BackendInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Backend implementation for: ${input.taskDescription}`,
    filesChanged: [],
  };
}
