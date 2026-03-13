import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'security',
  role: 'Security Engineer',
  description: 'Performs security audits, vulnerability scanning, and OWASP compliance checks.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.2 },
  tools: ['repo_reader', 'code_parser'],
  permissions: {
    read: 'all',
    write: ['docs/security/**'],
    execute: false,
  },
};

export const systemPrompt = `You are a senior security engineer. Audit code for OWASP Top 10
vulnerabilities, authentication flaws, injection risks, and insecure dependencies. Rate
findings by severity (Critical/High/Medium/Low). Write security reports to docs/security/.`;

export interface SecurityInput {
  taskDescription: string;
  focus?: 'owasp' | 'auth' | 'dependencies' | 'injection';
  context?: Record<string, unknown>;
}

export async function execute(input: SecurityInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Security audit (${input.focus ?? 'general'}): ${input.taskDescription}`,
    filesChanged: [],
  };
}
