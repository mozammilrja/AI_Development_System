import { BaseWorkflow } from './baseWorkflow.js';
import type { TeamTemplate, AgentName } from '../orchestrator/types.js';

/**
 * Agent file ownership mapping for autonomous parallel execution.
 * Each agent has exclusive write access to prevent conflicts.
 */
export const AGENT_OWNERSHIP: Record<AgentName, string[]> = {
  'product-manager': [
    'docs/product.md',
    'docs/user-stories/**',
    'docs/acceptance/**',
    'docs/features/**',
    'docs/roadmap.md',
  ],
  'architect': [
    'docs/architecture.md',
    'docs/adr/**',
    'docs/knowledge/architecture.md',
    'docs/api-contracts/**',
  ],
  'backend-engineer': [
    'app/backend/**',
    'tests/unit/backend/**',
    'tests/integration/**',
    'docs/api/**',
  ],
  'frontend-engineer': [
    'app/frontend/**',
    'tests/unit/frontend/**',
    'tests/e2e/**',
  ],
  'ui-designer': [
    'ui/**',
    'docs/design/**',
  ],
  'devops-engineer': [
    'platform/**',
    '.github/**',
    'docker-compose.yml',
    '**/Dockerfile',
    'docs/infrastructure/**',
  ],
  'security-engineer': [
    'security/**',
    'docs/security/**',
    'tests/security/**',
  ],
  'qa-engineer': [
    'tests/**',
    'docs/testing/**',
  ],
  'performance-engineer': [
    'tests/benchmarks/**',
    'docs/tests/benchmarks/**',
    'tests/tests/benchmarks/**',
    'tests/load/**',
  ],
  'code-reviewer': [
    'reviews/**',
  ],
};

/**
 * All 10 agents in the autonomous team.
 */
export const ALL_AGENTS: AgentName[] = [
  'product-manager',
  'architect',
  'backend-engineer',
  'frontend-engineer',
  'ui-designer',
  'devops-engineer',
  'security-engineer',
  'qa-engineer',
  'performance-engineer',
  'code-reviewer',
];

/**
 * Autonomous parallel workflow where all 10 agents work simultaneously.
 * 
 * Execution Model:
 * - All agents start immediately upon workflow launch
 * - No sequential phases or dependencies between agents
 * - Agents coordinate through file-based communication
 * - Each agent continuously monitors relevant directories
 * - Final report generated when all agents complete
 */
export class AutonomousWorkflow extends BaseWorkflow {
  get template(): TeamTemplate {
    return {
      name: 'autonomous-feature',
      goal: 'Build features with fully autonomous parallel agent execution',
      members: ALL_AGENTS,
      pattern: 'autonomous_parallel',
      taskFlow: [
        'Spawn all 10 agents simultaneously',
        'Each agent works independently on owned files',
        'Agents monitor repository for coordination',
        'No waiting or dependencies between agents',
        'Generate final report when all complete',
      ],
    };
  }

  /**
   * Get the file ownership for a specific agent.
   */
  static getAgentOwnership(agent: AgentName): string[] {
    return AGENT_OWNERSHIP[agent] || [];
  }

  /**
   * Check if an agent can write to a specific file path.
   */
  static canAgentWrite(agent: AgentName, filePath: string): boolean {
    const patterns = AGENT_OWNERSHIP[agent] || [];
    return patterns.some((pattern) => {
      if (pattern.includes('**')) {
        const prefix = pattern.replace('/**', '');
        return filePath.startsWith(prefix);
      }
      return filePath === pattern || filePath.startsWith(pattern);
    });
  }

  /**
   * Get all agents that monitor a specific directory.
   */
  static getMonitoringAgents(directory: string): AgentName[] {
    // Most agents monitor for changes but only write to their own areas
    const monitors: Record<string, AgentName[]> = {
      'app/backend/': ['qa-engineer', 'security-engineer', 'performance-engineer', 'code-reviewer'],
      'app/frontend/': ['qa-engineer', 'security-engineer', 'performance-engineer', 'code-reviewer'],
      'docs/architecture.md': ['backend-engineer', 'frontend-engineer', 'devops-engineer'],
      'docs/product.md': ['architect', 'backend-engineer', 'frontend-engineer', 'ui-designer'],
      'ui/': ['frontend-engineer'],
    };

    return monitors[directory] || [];
  }
}

export default AutonomousWorkflow;
