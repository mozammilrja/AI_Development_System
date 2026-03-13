import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'reviewer',
  role: 'Code Reviewer',
  description: 'Performs read-only code quality, security, and performance reviews.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.2 },
  tools: ['repo_reader', 'code_parser'],
  permissions: {
    read: 'all',
    write: [],
    execute: false,
  },
};

export const systemPrompt = `You are a senior code reviewer. Analyze code for security vulnerabilities,
performance issues, error handling gaps, and code quality problems. Rate findings by severity
(Critical/High/Medium/Low). Do NOT edit any source files — report findings only.`;

export interface ReviewInput {
  taskDescription: string;
  focus?: 'security' | 'performance' | 'coverage' | 'quality';
  context?: Record<string, unknown>;
}

export async function execute(input: ReviewInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Review (${input.focus ?? 'general'}): ${input.taskDescription}`,
    filesChanged: [], // reviewer is always read-only
  };
}
