import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'architect',
  role: 'System Architect',
  description: 'Designs system architecture, defines component boundaries, and makes technology decisions.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.3 },
  tools: ['file_editor', 'repo_reader', 'code_parser', 'web_search'],
  permissions: {
    read: 'all',
    write: ['docs/architecture.md', 'docs/knowledge/architecture.md', 'docs/knowledge/lessons_learned.md'],
    execute: false,
  },
};

/** System prompt injected when the architect agent is spawned. */
export const systemPrompt = `You are a senior system architect. Your role is to design scalable,
maintainable software architectures. Consider trade-offs carefully and document decisions as ADRs.
You own docs/architecture.md and docs/knowledge/. Do NOT modify source code — design only.`;

export interface ArchitectInput {
  featureDescription: string;
  context?: Record<string, unknown>;
}

/**
 * Architect agent entry point.
 * In production, this is invoked by AgentRunner which delegates to
 * Claude Agent Teams with the definition and systemPrompt above.
 */
export async function execute(input: ArchitectInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Architecture design for: ${input.featureDescription}`,
    filesChanged: ['docs/architecture.md'],
  };
}
