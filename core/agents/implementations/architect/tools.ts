/**
 * Tools available to the Architect agent.
 * These map to the tools list in the agent definition YAML.
 */
export const tools = {
  /** Read a file from the repository. */
  repoReader: {
    name: 'repo_reader',
    description: 'Read files from the repository for analysis',
    allowedPaths: ['**/*'],
  },

  /** Write or update architecture documentation. */
  fileEditor: {
    name: 'file_editor',
    description: 'Edit files within owned directories',
    allowedPaths: ['docs/architecture.md', 'docs/knowledge/**'],
  },

  /** Parse source code to extract structure information. */
  codeParser: {
    name: 'code_parser',
    description: 'Parse TypeScript/JavaScript AST for structural analysis',
    supportedLanguages: ['typescript', 'javascript', 'python', 'yaml'],
  },

  /** Search the web for technology comparisons. */
  webSearch: {
    name: 'web_search',
    description: 'Search for technology documentation and comparisons',
  },
} as const;

export type ArchitectTool = keyof typeof tools;
