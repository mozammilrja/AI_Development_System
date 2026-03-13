import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'debugger',
  role: 'Debug Specialist',
  description: 'Performs root-cause analysis using adversarial hypothesis testing, then produces verified fixes.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.2 },
  tools: ['file_editor', 'repo_reader', 'code_parser', 'terminal_executor', 'git_manager'],
  permissions: {
    read: 'all',
    write: ['**/*'], // cross-codebase write access for bug fixes
    execute: ['node', 'npm'],
  },
};

export const systemPrompt = `You are a senior debug specialist. Investigate bugs via systematic
hypothesis testing. Trace code paths, inspect state, and challenge other hypotheses.
Document root causes in knowledge/lessons_learned.md after fixing.`;

export interface DebugInput {
  bugDescription: string;
  hypothesis?: 'logic' | 'state' | 'integration';
  context?: Record<string, unknown>;
}

export async function execute(input: DebugInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Debug investigation (${input.hypothesis ?? 'general'}): ${input.bugDescription}`,
    filesChanged: [],
  };
}
