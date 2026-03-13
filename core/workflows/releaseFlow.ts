import { BaseWorkflow } from './baseWorkflow.js';
import type { TeamTemplate } from '../orchestrator/types.js';

/**
 * Release deployment workflow.
 * Deployer builds and ships, Validator independently verifies.
 * Automatic rollback on validation failure.
 */
export class ReleaseFlow extends BaseWorkflow {
  get template(): TeamTemplate {
    return {
      name: 'release',
      goal: 'Safely build, deploy, and validate a release with automatic rollback',
      members: ['devops', 'qa', 'security'],
      pattern: 'sequential',
      taskFlow: [
        'devops runs pre-flight checks and deploys',
        'qa validates deployment',
        'rollback if validation fails',
      ],
    };
  }
}
