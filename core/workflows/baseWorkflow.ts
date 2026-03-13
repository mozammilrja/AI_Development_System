import { TaskRouter } from '../services/taskRouter.js';
import { TeamLauncher } from '../services/teamLauncher.js';
import { AgentRunner } from '../orchestrator/agentRunner.js';
import type {
  AgentRunResult,
  ConcurrencyConfig,
  Task,
  TeamTemplate,
  WorkflowState,
} from '../orchestrator/types.js';

/**
 * Base class for DAG-based workflows.
 * Subclasses define the team template; the base handles execution
 * including parallel agent scheduling.
 */
export abstract class BaseWorkflow {
  protected readonly router = new TaskRouter();
  protected readonly launcher: TeamLauncher;

  constructor(concurrency?: Partial<ConcurrencyConfig>) {
    const runner = new AgentRunner();
    this.launcher = new TeamLauncher(runner, concurrency);

    // Bubble up useful events
    runner.on('batch:start', (e) => this.onBatchStart(e));
    runner.on('batch:complete', (e) => this.onBatchComplete(e));
    this.launcher.on('team:write-conflict', (e) => this.onWriteConflict(e));
    this.launcher.on('team:deadlock', (e) => this.onDeadlock(e));
  }

  /** Template that describes the team for this workflow. */
  abstract get template(): TeamTemplate;

  /** Execute the full workflow for a given request. */
  async execute(
    request: string,
    context?: Record<string, unknown>,
  ): Promise<{ workflow: WorkflowState; results: AgentRunResult[] }> {
    const route = this.router.route(request);

    const workflowId = crypto.randomUUID();
    const now = new Date();
    const tasks: Task[] = route.tasks.map((t, i) => ({
      ...t,
      id: `${workflowId}-task-${i}`,
      workflowId,
      createdAt: now,
      updatedAt: now,
    }));

    const workflow: WorkflowState = {
      id: workflowId,
      type: route.workflowType,
      status: 'in_progress',
      teamName: this.template.name,
      tasks: tasks.map((t) => t.id),
      context: context ?? {},
      startedAt: now,
    };

    const results = await this.launcher.launch(this.template, workflow, tasks);

    workflow.status = results.every((r) => r.status === 'completed')
      ? 'completed'
      : 'failed';
    workflow.completedAt = new Date();

    return { workflow, results };
  }

  // ── lifecycle hooks (override in subclasses if needed) ──────

  protected onBatchStart(event: Record<string, unknown>): void {
    // subclass can override
  }

  protected onBatchComplete(event: Record<string, unknown>): void {
    // subclass can override
  }

  protected onWriteConflict(event: Record<string, unknown>): void {
    console.warn('[workflow] write-conflict detected:', event);
  }

  protected onDeadlock(event: Record<string, unknown>): void {
    console.error('[workflow] deadlock — unresolvable dependencies:', event);
  }
}
