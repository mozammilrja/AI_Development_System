import { BaseWorkflow } from './baseWorkflow.js';
import type { TeamTemplate } from '../orchestrator/types.js';

/**
 * Technology research workflow.
 * Proponent vs Critic → Neutral evaluator produces recommendation.
 */
export class ResearchFlow extends BaseWorkflow {
  get template(): TeamTemplate {
    return {
      name: 'research',
      goal: 'Evaluate a technology through adversarial debate and produce a recommendation',
      members: ['architect', 'reviewer'],
      pattern: 'adversarial',
      taskFlow: [
        'proponent builds case FOR adoption',
        'critic builds case AGAINST adoption',
        'evaluator produces recommendation',
      ],
    };
  }
}
