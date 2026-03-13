import { BaseWorkflow } from './baseWorkflow.js';
import type { TeamTemplate } from '../orchestrator/types.js';

/**
 * Feature development workflow.
 * Architect → Frontend + Backend (parallel) → Tester → Reviewer
 */
export class DevelopmentFlow extends BaseWorkflow {
  get template(): TeamTemplate {
    return {
      name: 'feature',
      goal: 'Design, implement, test, and review a complete feature',
      members: ['architect', 'frontend', 'backend', 'tester', 'reviewer'],
      pattern: 'sequential_parallel',
      taskFlow: [
        'architect designs',
        'frontend + backend implement in parallel',
        'tester validates',
        'reviewer audits',
      ],
    };
  }
}
