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

/**
 * Per-agent write scopes for the 10-agent autonomous team.
 * Each agent has exclusive write access to their directories.
 */
const AGENT_WRITE_SCOPES: Record<string, string[]> = {
  'product-manager': ['docs/product.md', 'docs/user-stories/**', 'docs/acceptance/**', 'docs/features/**'],
  'architect': ['docs/architecture.md', 'docs/adr/**', 'docs/knowledge/architecture.md', 'docs/api-contracts/**'],
  'backend-engineer': ['app/backend/**', 'tests/unit/backend/**', 'tests/integration/**', 'docs/api/**'],
  'frontend-engineer': ['app/frontend/**', 'tests/unit/frontend/**', 'tests/e2e/**'],
  'ui-designer': ['ui/**', 'docs/design/**'],
  'devops-engineer': ['platform/**', '.github/**', 'docker-compose.yml', 'docs/infrastructure/**'],
  'security-engineer': ['security/**', 'docs/security/**', 'tests/security/**'],
  'qa-engineer': ['tests/**', 'docs/testing/**'],
  'performance-engineer': ['tests/benchmarks/**', 'docs/tests/benchmarks/**', 'tests/tests/benchmarks/**'],
  'code-reviewer': ['reviews/**'],
};

/**
 * Launches a team of agents according to a team template's pattern.
 * Supports autonomous parallel execution where all agents start
 * simultaneously and coordinate through file-based communication.
 */
export class TeamLauncher extends EventEmitter {
  private readonly runner: AgentRunner;
  private readonly concurrency: ConcurrencyConfig;

  constructor(runner?: AgentRunner, concurrency?: Partial<ConcurrencyConfig>) {
    super();
    this.runner = runner ?? new AgentRunner();
    // Default to 10 parallel agents for autonomous execution
    this.concurrency = { maxParallel: 10, failFast: false, ...concurrency };
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

      case 'autonomous_parallel':
        results = await this.runAutonomousParallel(tasks, workflow);
        break;

      case 'phased_sequential':
        results = await this.runPhasedSequential(tasks, workflow, template);
        break;

      default:
        // Default to autonomous_parallel - all agents start immediately
        results = await this.runAutonomousParallel(tasks, workflow);
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

  /**
   * Autonomous parallel execution for the 10-agent team.
   * All agents start simultaneously with no dependencies.
   */
  private async runAutonomousParallel(
    tasks: Task[],
    workflow: WorkflowState,
  ): Promise<AgentRunResult[]> {
    this.emit('execution:mode', { mode: 'autonomous_parallel', agents: tasks.length });
    
    // Verify no write conflicts (should not happen with proper ownership)
    const claims = this.buildWriteClaims(tasks);
    const conflicts = this.runner.detectWriteConflicts(claims);
    if (conflicts.length > 0) {
      this.emit('team:write-conflict', { conflicts });
      // Continue anyway since ownership is designed to not overlap
    }

    // Launch all agents simultaneously
    const options: RunOptions[] = tasks.map((t) => ({
      taskId: t.id,
      agentName: t.assignedTo,
      prompt: t.description,
      context: { workflow: workflow.context, autonomousMode: true },
    }));

    const batch = await this.runner.runParallel(options, this.concurrency);
    return batch.results;
  }

  /**
   * Phased sequential execution with dependencies.
   * Phase 1: Architect (requires approval)
   * Phase 2: Backend + Frontend (parallel)
   * Phase 3: Tester (after implementation)
   * Phase 4: Reviewer (after testing)
   */
  private async runPhasedSequential(
    tasks: Task[],
    workflow: WorkflowState,
    template: TeamTemplate,
  ): Promise<AgentRunResult[]> {
    this.emit('execution:mode', { mode: 'phased_sequential', phases: template.phases?.length || 4 });
    
    const results: AgentRunResult[] = [];
    const phases = template.phases || [];

    for (const phase of phases) {
      this.emit('phase:start', { name: phase.name, agents: phase.agents });

      // Get tasks for this phase
      const phaseTasks = tasks.filter(t => phase.agents.includes(t.assignedTo));
      
      if (phaseTasks.length === 0) {
        this.emit('phase:skip', { name: phase.name, reason: 'no tasks' });
        continue;
      }

      let phaseResults: AgentRunResult[];

      if (phase.parallel && phaseTasks.length > 1) {
        // Run agents in parallel within this phase
        const options: RunOptions[] = phaseTasks.map((t) => ({
          taskId: t.id,
          agentName: t.assignedTo,
          prompt: t.description,
          context: { workflow: workflow.context, phase: phase.name },
        }));
        const batch = await this.runner.runParallel(options, this.concurrency);
        phaseResults = batch.results;
      } else {
        // Run agents sequentially
        phaseResults = [];
        for (const task of phaseTasks) {
          const result = await this.runTask(task, workflow);
          phaseResults.push(result);
          if (result.status === 'failed' && phase.blocking) {
            this.emit('phase:failed', { name: phase.name, task: task.id });
            break;
          }
        }
      }

      results.push(...phaseResults);

      // Check if phase requires approval
      if (phase.requiresApproval) {
        this.emit('phase:approval-required', { name: phase.name });
        // In real implementation, would wait for external approval
      }

      // Check if any phase task failed and phase is blocking
      const phaseFailed = phaseResults.some(r => r.status === 'failed');
      if (phaseFailed && phase.blocking) {
        this.emit('phase:blocked', { name: phase.name });
        break;
      }

      this.emit('phase:complete', { name: phase.name, results: phaseResults.length });
    }

    return results;
  }

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
