export const tools = {
  fileEditor: {
    name: 'file_editor',
    description: 'Create and edit task plans and team templates',
    allowedPaths: ['docs/tasks/**', 'core/agents/teams/**'],
  },

  repoReader: {
    name: 'repo_reader',
    description: 'Read any file to understand project scope',
    allowedPaths: ['**/*'],
  },
} as const;

export type PlannerTool = keyof typeof tools;
