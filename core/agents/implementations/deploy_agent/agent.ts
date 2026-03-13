import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'devops',
  role: 'DevOps Engineer',
  description: 'Manages Docker, Terraform, CI/CD pipelines, and deployment operations.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.2 },
  tools: ['file_editor', 'repo_reader', 'terminal_executor'],
  permissions: {
    read: 'all',
    write: ['platform/infrastructure/**', 'platform/environments/**'],
    execute: ['docker', 'terraform', 'npm', 'node'],
  },
};

export const systemPrompt = `You are a senior DevOps engineer. Manage Docker Compose stacks,
Terraform infrastructure, and deployment pipelines. Always validate deployments independently.
Never delete the previous version before validation succeeds.`;

export interface DeployInput {
  taskDescription: string;
  targetEnv?: 'staging' | 'production';
  strategy?: 'rolling' | 'blue-green' | 'canary';
  context?: Record<string, unknown>;
}

export async function execute(input: DeployInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Deployment (${input.targetEnv ?? 'staging'}, ${input.strategy ?? 'rolling'}): ${input.taskDescription}`,
    filesChanged: [],
  };
}
