export const tools = {
  fileEditor: {
    name: 'file_editor',
    description: 'Create and edit frontend source files',
    allowedPaths: ['apps/frontend/**', 'saas-app/frontend/**'],
  },

  repoReader: {
    name: 'repo_reader',
    description: 'Read any file in the repository',
    allowedPaths: ['**/*'],
  },

  codeParser: {
    name: 'code_parser',
    description: 'Parse TypeScript/JSX AST',
    supportedLanguages: ['typescript', 'javascript', 'tsx', 'jsx'],
  },

  browserOpen: {
    name: 'browser_open',
    description: 'Open a page in the browser for visual testing',
  },

  browserScreenshot: {
    name: 'browser_screenshot',
    description: 'Capture a screenshot of the current browser page',
  },
} as const;

export type FrontendTool = keyof typeof tools;
