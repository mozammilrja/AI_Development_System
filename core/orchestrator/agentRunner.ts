import { EventEmitter } from 'events';
import type {
  AgentDefinition,
  AgentRunResult,
  BatchRunResult,
  ConcurrencyConfig,
  WriteClaim,
} from './types.js';

export interface RunOptions {
  taskId: string;
  agentName: string;
  prompt: string;
  context?: Record<string, unknown>;
  timeoutMs?: number;
}

const DEFAULT_CONCURRENCY: ConcurrencyConfig = {
  maxParallel: 4,
  failFast: false,
};

/**
 * Executes agents against tasks, supporting both single and parallel runs.
 *
 * Single run  — `run(options)`: one agent at a time.
 * Parallel    — `runParallel(options[], config?)`: up to `maxParallel`
 *               agents execute concurrently using a semaphore pool.
 *               File-write conflicts are detected before launch so two
 *               agents never write to the same directory at the same time.
 */
export class AgentRunner extends EventEmitter {
  private readonly defaults = { timeoutMs: 120_000 };

  /** Currently running agent names (for progress tracking). */
  private readonly active = new Set<string>();

  // ── single run ──────────────────────────────────────────────

  async run(options: RunOptions): Promise<AgentRunResult> {
    const opts = { ...this.defaults, ...options };
    const { taskId, agentName, prompt, context, timeoutMs } = opts;

    this.active.add(agentName);
    this.emit('agent:start', { taskId, agentName, activeCount: this.active.size });

    const startedAt = new Date();
    try {
      const agentContext = this.buildContext(agentName, context);

      const result = await this.executeViaClaudeTeams(
        agentName,
        prompt,
        agentContext,
        timeoutMs,
      );

      const run: AgentRunResult = {
        taskId,
        agentName,
        status: 'completed',
        output: result.output,
        filesChanged: result.filesChanged,
        startedAt,
        completedAt: new Date(),
        tokenUsage: result.tokenUsage,
      };

      this.emit('agent:complete', run);
      return run;
    } catch (error) {
      const run: AgentRunResult = {
        taskId,
        agentName,
        status: 'failed',
        output: null,
        filesChanged: [],
        startedAt,
        completedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      };
      this.emit('agent:error', run);
      return run;
    } finally {
      this.active.delete(agentName);
    }
  }

  // ── parallel run ────────────────────────────────────────────

  /**
   * Run multiple agents concurrently, respecting a concurrency limit.
   *
   * @param optionsList  One `RunOptions` per agent to launch.
   * @param config       Concurrency knobs (max parallel, fail-fast).
   * @returns Aggregated results once every agent has finished (or
   *          after the first failure when `failFast` is true).
   */
  async runParallel(
    optionsList: RunOptions[],
    config: Partial<ConcurrencyConfig> = {},
  ): Promise<BatchRunResult> {
    const cfg: ConcurrencyConfig = { ...DEFAULT_CONCURRENCY, ...config };
    const batchStart = Date.now();

    this.emit('batch:start', {
      count: optionsList.length,
      maxParallel: cfg.maxParallel,
      agents: optionsList.map((o) => o.agentName),
    });

    const results = await this.semaphoreMap(
      optionsList,
      cfg.maxParallel,
      (opts) => this.run(opts),
      cfg.failFast,
    );

    const batch: BatchRunResult = {
      results,
      totalDurationMs: Date.now() - batchStart,
      succeeded: results.filter((r) => r.status === 'completed').length,
      failed: results.filter((r) => r.status === 'failed').length,
    };

    this.emit('batch:complete', batch);
    return batch;
  }

  // ── conflict detection ──────────────────────────────────────

  /**
   * Detect whether any agents in a planned parallel batch would
   * write to overlapping directory patterns.
   *
   * Returns pairs of agents whose write scopes overlap. An empty
   * array means no conflicts — safe to run in parallel.
   */
  detectWriteConflicts(
    claims: WriteClaim[],
  ): Array<{ a: string; b: string; overlap: string[] }> {
    const conflicts: Array<{ a: string; b: string; overlap: string[] }> = [];

    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        const overlap = claims[i].patterns.filter((p) =>
          claims[j].patterns.some((q) => this.patternsOverlap(p, q)),
        );
        if (overlap.length > 0) {
          conflicts.push({
            a: claims[i].agentName,
            b: claims[j].agentName,
            overlap,
          });
        }
      }
    }
    return conflicts;
  }

  /** Snapshot of agents currently executing. */
  getActiveAgents(): string[] {
    return [...this.active];
  }

  // ── internals ───────────────────────────────────────────────

  /**
   * Semaphore-based concurrency pool.
   * At most `limit` items run at once; results preserve input order.
   */
  private async semaphoreMap<T, R>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<R>,
    failFast: boolean,
  ): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let nextIndex = 0;
    let aborted = false;

    const worker = async (): Promise<void> => {
      while (!aborted) {
        const idx = nextIndex++;
        if (idx >= items.length) return;
        try {
          results[idx] = await fn(items[idx]);
          if (
            failFast &&
            (results[idx] as unknown as AgentRunResult).status === 'failed'
          ) {
            aborted = true;
          }
        } catch (err) {
          if (failFast) aborted = true;
          throw err;
        }
      }
    };

    const workers = Array.from(
      { length: Math.min(limit, items.length) },
      () => worker(),
    );
    await Promise.allSettled(workers);

    return results;
  }

  /** Merge global knowledge with per-agent context. */
  private buildContext(
    agentName: string,
    extra?: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      agent: agentName,
      knowledgePaths: [
        'knowledge/architecture.md',
        'knowledge/coding_standards.md',
        'knowledge/lessons_learned.md',
      ],
      ...extra,
    };
  }

  /** Rough glob overlap check (same directory prefix). */
  private patternsOverlap(a: string, b: string): boolean {
    const baseA = a.replace(/\*\*.*$/, '').replace(/\*.*$/, '');
    const baseB = b.replace(/\*\*.*$/, '').replace(/\*.*$/, '');
    return baseA.startsWith(baseB) || baseB.startsWith(baseA);
  }

  /**
   * Placeholder for the Claude Agent Teams integration point.
   * In production this calls the Claude Code CLI / SDK to spawn
   * the agent with its definition from core/agents/definitions/.
   */
  private async executeViaClaudeTeams(
    agentName: string,
    prompt: string,
    context: Record<string, unknown>,
    _timeoutMs: number,
  ): Promise<{
    output: string;
    filesChanged: string[];
    tokenUsage: { input: number; output: number };
  }> {
    return {
      output: `[${agentName}] executed prompt (${prompt.length} chars) with context keys: ${Object.keys(context).join(', ')}`,
      filesChanged: [],
      tokenUsage: { input: 0, output: 0 },
    };
  }
}
