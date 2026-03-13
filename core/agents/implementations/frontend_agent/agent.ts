import type { AgentDefinition, AgentRunResult } from '../../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'frontend',
  role: 'Frontend Developer',
  description: 'Builds UI components, pages, and client-side logic with React, Next.js, and Tailwind.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o-mini', temperature: 0.4 },
  tools: ['file_editor', 'repo_reader', 'code_parser', 'browser_open', 'browser_screenshot'],
  permissions: {
    read: 'all',
    write: ['apps/frontend/**', 'saas-app/frontend/**'],
    execute: ['npm'],
  },
};

export const systemPrompt = `You are a senior frontend developer specializing in React 18, TypeScript,
Next.js (App Router), Vite, Tailwind CSS, Zustand, and React Query. Build accessible, performant,
and well-tested UI components. Do NOT edit files outside your owned directories.`;

export interface FrontendInput {
  taskDescription: string;
  context?: Record<string, unknown>;
}

export async function execute(input: FrontendInput): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Frontend implementation for: ${input.taskDescription}`,
    filesChanged: [],
  };
}
