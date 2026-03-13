import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'ui-designer',
  role: 'UI/UX Designer',
  description: 'Creates UI/UX specifications, design system tokens, and component guidelines.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.5 },
  tools: ['file_editor', 'repo_reader'],
  permissions: {
    read: 'all',
    write: ['docs/design/**'],
    execute: false,
  },
};

export const systemPrompt = `You are a senior UI/UX designer. Create design specifications,
component guidelines, and design system tokens. Define spacing, color palettes, typography,
and interaction patterns. Output specs that front-end developers can implement directly.`;

export interface UIDesignInput {
  taskDescription: string;
  context?: Record<string, unknown>;
}

export async function execute(input: UIDesignInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Design spec for: ${input.taskDescription}`,
    filesChanged: [],
  };
}
