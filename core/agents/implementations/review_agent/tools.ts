export const tools = {
  repoReader: {
    name: 'repo_reader',
    description: 'Read any file for review',
    allowedPaths: ['**/*'],
  },

  codeParser: {
    name: 'code_parser',
    description: 'Parse AST for structural quality analysis',
    supportedLanguages: ['typescript', 'javascript', 'tsx', 'jsx'],
  },
} as const;

export type ReviewTool = keyof typeof tools;
