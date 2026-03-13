import { BaseWorkflow } from './baseWorkflow.js';
import type { TeamTemplate } from '../orchestrator/types.js';

/**
 * Bug investigation workflow.
 * Three adversarial investigators run in parallel, then a lead
 * synthesizes the winning hypothesis into a verified fix.
 */
export class DebugFlow extends BaseWorkflow {
  get template(): TeamTemplate {
    return {
      name: 'debug',
      goal: 'Identify root cause via adversarial investigation and produce a verified fix',
      members: ['debugger', 'tester'],
      pattern: 'adversarial',
      taskFlow: [
        'investigator A — logic error hypothesis',
        'investigator B — state/data hypothesis',
        'investigator C — integration hypothesis',
        'lead synthesizes fix',
        'tester validates fix',
      ],
    };
  }
}
