export const tools = {
  fileEditor: {
    name: 'file_editor',
    description: 'Edit infrastructure and deployment configs',
    allowedPaths: ['platform/infrastructure/**', 'platform/environments/**'],
  },

  repoReader: {
    name: 'repo_reader',
    description: 'Read any file in the repository',
    allowedPaths: ['**/*'],
  },

  terminalExecutor: {
    name: 'terminal_executor',
    description: 'Run Docker, Terraform, and deployment commands',
    allowedCommands: ['docker', 'docker-compose', 'terraform', 'npm', 'node'],
  },
} as const;

export type DeployTool = keyof typeof tools;
