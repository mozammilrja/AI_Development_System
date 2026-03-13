import { BaseWorkflow } from './baseWorkflow.js';
import type { TeamTemplate } from '../orchestrator/types.js';

/**
 * Feature development workflow with autonomous parallel execution.
 * All agents start immediately and work independently.
 * Agents collaborate asynchronously through repository updates.
 */
export class DevelopmentFlow extends BaseWorkflow {
  get template(): TeamTemplate {
    return {
      name: 'feature',
      goal: 'Design, implement, test, and review a feature with autonomous parallel agents',
      members: [
        'architect',
        'backend-engineer',
        'frontend-engineer',
        'qa-engineer',
        'code-reviewer',
      ],
      pattern: 'autonomous_parallel',
      taskFlow: [
        'All agents start immediately at t=0',
        'Agents work independently on their tasks',
        'Collaboration happens asynchronously via repo updates',
        'Final report generated when all agents complete',
      ],
    };
  }
}
