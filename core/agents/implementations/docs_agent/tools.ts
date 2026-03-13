export const tools = {
  fileEditor: {
    name: 'file_editor',
    description: 'Create and edit documentation files',
    allowedPaths: ['docs/**', 'README.md'],
  },

  repoReader: {
    name: 'repo_reader',
    description: 'Read source files to document',
    allowedPaths: ['**/*'],
  },
} as const;

export type DocsTool = keyof typeof tools;
