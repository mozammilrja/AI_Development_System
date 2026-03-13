export const tools = {
  fileEditor: {
    name: 'file_editor',
    description: 'Create and edit test files',
    allowedPaths: ['tests/**', 'platform/simulations/**'],
  },

  repoReader: {
    name: 'repo_reader',
    description: 'Read source files to understand code under test',
    allowedPaths: ['**/*'],
  },

  terminalExecutor: {
    name: 'terminal_executor',
    description: 'Run test suites and coverage tools',
    allowedCommands: ['npm', 'npx', 'jest', 'playwright'],
  },

  browserOpen: {
    name: 'browser_open',
    description: 'Open pages for E2E testing',
  },

  browserScreenshot: {
    name: 'browser_screenshot',
    description: 'Capture screenshots during E2E tests',
  },
} as const;

export type TesterTool = keyof typeof tools;
