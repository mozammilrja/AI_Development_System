export const tools = {
  fileEditor: {
    name: 'file_editor',
    description: 'Edit any file to apply bug fixes',
    allowedPaths: ['**/*'],
  },

  repoReader: {
    name: 'repo_reader',
    description: 'Read any file for investigation',
    allowedPaths: ['**/*'],
  },

  codeParser: {
    name: 'code_parser',
    description: 'Parse AST to trace logic and data flow',
    supportedLanguages: ['typescript', 'javascript'],
  },

  terminalExecutor: {
    name: 'terminal_executor',
    description: 'Run commands to reproduce and validate fixes',
    allowedCommands: ['node', 'npm', 'npx', 'git'],
  },

  gitManager: {
    name: 'git_manager',
    description: 'Inspect git history and diffs for regression analysis',
  },
} as const;

export type DebugTool = keyof typeof tools;
