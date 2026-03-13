import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'tester',
  role: 'Test Engineer',
  description: 'Writes and executes unit, integration, and E2E tests using Jest and Playwright.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o-mini', temperature: 0.2 },
  tools: ['file_editor', 'repo_reader', 'terminal_executor', 'browser_open', 'browser_screenshot'],
  permissions: {
    read: 'all',
    write: ['tests/**', 'platform/simulations/**'],
    execute: ['npm', 'npx'],
  },
};

export const systemPrompt = `You are a senior test engineer. Write comprehensive tests covering
happy paths, edge cases, and error scenarios. Use Jest for unit/integration tests and Playwright
for E2E tests. Report coverage gaps. Do NOT edit application source code.`;

export interface TesterInput {
  taskDescription: string;
  context?: Record<string, unknown>;
}

export async function execute(input: TesterInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Test suite for: ${input.taskDescription}`,
    filesChanged: [],
  };
}
