export const tools = {
  fileEditor: {
    name: 'file_editor',
    description: 'Create and edit backend source files',
    allowedPaths: ['apps/backend/**', 'apps/database/**', 'saas-app/backend/**'],
  },

  repoReader: {
    name: 'repo_reader',
    description: 'Read any file in the repository',
    allowedPaths: ['**/*'],
  },

  codeParser: {
    name: 'code_parser',
    description: 'Parse TypeScript AST for structural analysis',
    supportedLanguages: ['typescript', 'javascript'],
  },

  terminalExecutor: {
    name: 'terminal_executor',
    description: 'Run Node.js and npm commands',
    allowedCommands: ['node', 'npm', 'npx'],
  },

  gitManager: {
    name: 'git_manager',
    description: 'Stage, commit, and manage git operations',
  },
} as const;

export type BackendTool = keyof typeof tools;
