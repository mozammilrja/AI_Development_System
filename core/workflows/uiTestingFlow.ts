import { BaseWorkflow } from './baseWorkflow.js';
import type { TeamTemplate } from '../orchestrator/types.js';

/**
 * UI testing workflow.
 * Frontend agent implements, tester runs browser-based E2E tests,
 * reviewer checks accessibility and visual regressions.
 */
export class UiTestingFlow extends BaseWorkflow {
  get template(): TeamTemplate {
    return {
      name: 'ui_testing',
      goal: 'Validate UI components via automated browser tests and accessibility audits',
      members: ['frontend', 'tester', 'reviewer'],
      pattern: 'sequential',
      taskFlow: [
        'frontend prepares testable components',
        'tester runs Playwright E2E and visual regression tests',
        'reviewer audits accessibility and UX quality',
      ],
    };
  }
}
