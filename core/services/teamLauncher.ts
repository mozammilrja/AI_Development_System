import { EventEmitter } from 'events';
import { AgentRunner, type RunOptions } from '../orchestrator/agentRunner.js';
import type {
  AgentRunResult,
  ConcurrencyConfig,
  Task,
  TeamPattern,
  TeamTemplate,
  WriteClaim,
  WorkflowState,
} from '../orchestrator/types.js';

/** Per-agent write scopes loaded from definitions. */
const AGENT_WRITE_SCOPES: Record<string, string[]> = {
  architect: ['docs/architecture.md', 'knowledge/**', 'configs/**'],
  planner: ['docs/tasks/**', 'core/agents/teams/**'],
  frontend: ['apps/frontend/**', 'saas-app/frontend/**'],
  backend: ['apps/backend/**', 'saas-app/backend/**', 'apps/database/**'],
  'ui-designer': ['docs/design/**'],
  qa: ['tests/**'],
  tester: ['tests/**', 'platform/simulations/**'],
  security: ['docs/security/**'],
  reviewer: [],
  debugger: ['**'],
  devops: ['platform/infrastructure/**'],
  documentation: ['docs/**', 'README.md'],
};

/**
 * Launches a team of agents according to a team template's pattern.
 * Supports concurrent execution with configurable parallelism and
 * automatic write-conflict detection so agents never collide on files.
 */
export class TeamLauncher extends EventEmitter {
  private readonly runner: AgentRunner;
  private readonly concurrency: ConcurrencyConfig;

  constructor(runner?: AgentRunner, concurrency?: Partial<ConcurrencyConfig>) {
    super();
    this.runner = runner ?? new AgentRunner();
    this.concurrency = { maxParallel: 4, failFast: false, ...concurrency };
  }

  /** Execute all tasks for a team according to the template pattern. */
  async launch(
    template: TeamTemplate,
    workflow: WorkflowState,
    tasks: Task[],
  ): Promise<AgentRunResult[]> {
    this.emit('team:start', {
      team: template.name,
      workflow: workflow.id,
      pattern: template.pattern,
      agents: tasks.map((t) => t.assignedTo),
    });

    let results: AgentRunResult[];

    switch (template.pattern) {
      case 'sequential':
        results = await this.runSequential(tasks, workflow);
        break;

      case 'parallel':
        results = await this.runFullParallel(tasks, workflow);
        break;

      case 'sequential_parallel':
        results = await this.runSequentialParallel(tasks, workflow);
        break;

      case 'adversarial':
        results = await this.runAdversarial(tasks, workflow);
        break;

      default:
        results = await this.runSequential(tasks, workflow);
    }

    this.emit('team:complete', {
      team: template.name,
      workflow: workflow.id,
      total: results.length,
      succeeded: results.filter((r) => r.status === 'completed').length,
      failed: results.filter((r) => r.status === 'failed').length,
    });

    return results;
  }

  // ── execution strategies ────────────────────────────────────

  /** One agent at a time. Stops on first failure. */
  private async runSequential(
    tasks: Task[],
    workflow: WorkflowState,
  ): Promise<AgentRunResult[]> {
    const results: AgentRunResult[] = [];
    for (const task of tasks) {
      const result = await this.runTask(task, workflow);
      results.push(result);
      if (result.status === 'failed') break;
    }
    return results;
  }

  /** All agents at once (up to concurrency limit), with conflict detection. */
  private async runFullParallel(
    tasks: Task[],
    workflow: WorkflowState,
  ): Promise<AgentRunResult[]> {
    this.warnOnConflicts(tasks);

    const optionsList = tasks.map((t) => this.toRunOptions(t, workflow));
    const batch = await this.runner.runParallel(optionsList, this.concurrency);
    return batch.results;
  }

  /**
   * DAG-aware batching: tasks whose dependencies are satisfied run in
   * parallel; sequential gates separate the batches.
   */
  private async runSequentialParallel(
    tasks: Task[],
    workflow: WorkflowState,
  ): Promise<AgentRunResult[]> {
    const completed = new Set<string>();
    const results: AgentRunResult[] = [];
    const remaining = [...tasks];

    while (remaining.length > 0) {
      // Find all tasks whose deps are met
      const batch = remaining.filter((t) =>
        t.dependsOn.every((dep) => completed.has(dep)),
      );
      if (batch.length === 0) {
        this.emit('team:deadlock', {
          remaining: remaining.map((t) => t.id),
        });
        break;
      }

      this.emit('batch:ready', {
        batchSize: batch.length,
        agents: batch.map((t) => t.assignedTo),
      });

      // Run batch through the parallel runner
      if (batch.length === 1) {
        results.push(await this.runTask(batch[0], workflow));
      } else {
        this.warnOnConflicts(batch);
        const optionsList = batch.map((t) => this.toRunOptions(t, workflow));
        const batchResult = await this.runner.runParallel(
          optionsList,
          this.concurrency,
        );
        results.push(...batchResult.results);
      }

      for (const task of batch) {
        completed.add(task.id);
        remaining.splice(remaining.indexOf(task), 1);
      }
    }

    return results;
  }

  /**
   * Adversarial: competing investigators run in parallel, then a
   * synthesiser aggregates their findings sequentially.
   */
  private async runAdversarial(
    tasks: Task[],
    workflow: WorkflowState,
  ): Promise<AgentRunResult[]> {
    const investigations = tasks.filter((t) => t.dependsOn.length === 0);
    const synthesis = tasks.filter((t) => t.dependsOn.length > 0);

    // investigations run in parallel
    const invOpts = investigations.map((t) => this.toRunOptions(t, workflow));
    const invBatch = await this.runner.runParallel(invOpts, this.concurrency);

    // synthesis runs sequentially, receiving investigation outputs
    const synthResults: AgentRunResult[] = [];
    for (const task of synthesis) {
      const enrichedTask: Task = {
        ...task,
        description:
          task.description +
          '\n\n## Prior investigation results\n' +
          invBatch.results
            .map((r) => `[${r.agentName}]: ${r.output ?? 'no output'}`)
            .join('\n'),
      };
      synthResults.push(await this.runTask(enrichedTask, workflow));
    }

    return [...invBatch.results, ...synthResults];
  }

  // ── helpers ─────────────────────────────────────────────────

  private toRunOptions(task: Task, workflow: WorkflowState): RunOptions {
    return {
      taskId: task.id,
      agentName: task.assignedTo,
      prompt: task.description,
      context: { workflowId: workflow.id, ...workflow.context },
    };
  }

  private runTask(task: Task, workflow: WorkflowState): Promise<AgentRunResult> {
    return this.runner.run(this.toRunOptions(task, workflow));
  }

  /** Emit a warning if any parallel agents would write to overlapping dirs. */
  private warnOnConflicts(tasks: Task[]): void {
    const claims: WriteClaim[] = tasks.map((t) => ({
      agentName: t.assignedTo,
      patterns: AGENT_WRITE_SCOPES[t.assignedTo] ?? [],
    }));

    const conflicts = this.runner.detectWriteConflicts(claims);
    if (conflicts.length > 0) {
      this.emit('team:write-conflict', { conflicts });
    }
  }
}
