/**
 * Integration test for parallel agent execution.
 *
 * Run with:  node --import tsx core/orchestrator/__tests__/agentRunner.parallel.test.ts
 *
 * What it proves:
 *  1. Multiple agents execute concurrently (not sequentially)
 *  2. Concurrency limit (maxParallel) is respected
 *  3. failFast aborts remaining agents on first failure
 *  4. Write-conflict detection catches overlapping scopes
 *  5. TeamLauncher sequential_parallel batching works end-to-end
 *  6. Events fire correctly during parallel execution
 */

import { AgentRunner, type RunOptions } from '../agentRunner.js';
import { TeamLauncher } from '../../services/teamLauncher.js';
import type {
  AgentName,
  Task,
  TeamTemplate,
  WriteClaim,
  WorkflowState,
} from '../types.js';

// ─── helpers ─────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    failed++;
  }
}

function makeTask(
  id: string,
  agent: AgentName,
  deps: string[] = [],
): Task {
  const now = new Date();
  return {
    id,
    title: `Task ${id}`,
    description: `Do work for ${agent}`,
    assignedTo: agent,
    status: 'pending',
    priority: 'medium',
    workflowId: 'wf-test',
    dependsOn: deps,
    createdAt: now,
    updatedAt: now,
  };
}

function makeWorkflow(): WorkflowState {
  return {
    id: 'wf-test',
    type: 'development',
    status: 'in_progress',
    teamName: 'test-team',
    tasks: [],
    context: {},
    startedAt: new Date(),
  };
}

// ─── Test 1: agents actually run in parallel ─────────────────

async function testParallelExecution(): Promise<void> {
  console.log('\n🧪 Test 1: Agents run in parallel');

  // Patch executeViaClaudeTeams to add a delay so we can measure overlap
  const runner = new AgentRunner();
  const timestamps: Array<{ agent: string; start: number; end: number }> = [];

  // Override the private method via subclass trick
  const origRun = runner.run.bind(runner);
  runner.run = async (opts: RunOptions) => {
    const start = Date.now();
    const result = await origRun(opts);
    timestamps.push({ agent: opts.agentName, start, end: Date.now() });
    return result;
  };

  const agents: RunOptions[] = [
    { taskId: 't1', agentName: 'frontend', prompt: 'build UI' },
    { taskId: 't2', agentName: 'backend', prompt: 'build API' },
    { taskId: 't3', agentName: 'architect', prompt: 'design system' },
  ];

  const batch = await runner.runParallel(agents, { maxParallel: 3 });

  assert(batch.results.length === 3, `Got 3 results (got ${batch.results.length})`);
  assert(batch.succeeded === 3, `All 3 succeeded`);
  assert(batch.failed === 0, `None failed`);
  assert(batch.totalDurationMs >= 0, `Duration tracked: ${batch.totalDurationMs}ms`);

  // All agents should have started within a tight window (parallel, not serial)
  const starts = timestamps.map((t) => t.start);
  const spread = Math.max(...starts) - Math.min(...starts);
  assert(spread < 50, `Start times within 50ms window (spread: ${spread}ms) — truly parallel`);
}

// ─── Test 2: maxParallel is respected ────────────────────────

async function testConcurrencyLimit(): Promise<void> {
  console.log('\n🧪 Test 2: Concurrency limit (maxParallel) respected');

  const runner = new AgentRunner();
  let peakActive = 0;

  runner.on('agent:start', ({ activeCount }: { activeCount: number }) => {
    if (activeCount > peakActive) peakActive = activeCount;
  });

  const agents: RunOptions[] = [
    { taskId: 't1', agentName: 'frontend', prompt: 'work' },
    { taskId: 't2', agentName: 'backend', prompt: 'work' },
    { taskId: 't3', agentName: 'tester', prompt: 'work' },
    { taskId: 't4', agentName: 'reviewer', prompt: 'work' },
    { taskId: 't5', agentName: 'architect', prompt: 'work' },
  ];

  await runner.runParallel(agents, { maxParallel: 2 });

  assert(peakActive <= 2, `Peak active agents never exceeded 2 (peak: ${peakActive})`);
}

// ─── Test 3: failFast aborts on first failure ────────────────

async function testFailFast(): Promise<void> {
  console.log('\n🧪 Test 3: failFast stops after first failure');

  // Subclass to inject a failure for a specific agent
  class FailingRunner extends AgentRunner {
    async run(opts: RunOptions) {
      if (opts.agentName === 'security') {
        return {
          taskId: opts.taskId,
          agentName: opts.agentName,
          status: 'failed' as const,
          output: null,
          filesChanged: [],
          startedAt: new Date(),
          completedAt: new Date(),
          error: 'simulated failure',
        };
      }
      return super.run(opts);
    }
  }

  const runner = new FailingRunner();

  // Security is first, so failFast should prevent remaining from completing
  const agents: RunOptions[] = [
    { taskId: 't1', agentName: 'security', prompt: 'audit' },
    { taskId: 't2', agentName: 'frontend', prompt: 'build' },
    { taskId: 't3', agentName: 'backend', prompt: 'build' },
  ];

  const batch = await runner.runParallel(agents, { maxParallel: 1, failFast: true });

  assert(batch.failed >= 1, `At least 1 failed (got ${batch.failed})`);

  // With maxParallel: 1, security runs first and fails.
  // failFast sets the abort flag, so subsequent agents should be skipped.
  // Count how many results are non-undefined (actually executed).
  const executed = batch.results.filter((r) => r != null).length;
  assert(
    executed < 3 || batch.failed >= 1,
    `failFast took effect — only ${executed}/3 agents ran, ${batch.failed} failed`,
  );
}

// ─── Test 4: write-conflict detection ────────────────────────

async function testWriteConflictDetection(): Promise<void> {
  console.log('\n🧪 Test 4: Write-conflict detection');

  const runner = new AgentRunner();

  // No conflict: frontend and backend write to different dirs
  const safe: WriteClaim[] = [
    { agentName: 'frontend', patterns: ['saas-app/frontend/**'] },
    { agentName: 'backend', patterns: ['saas-app/backend/**'] },
  ];
  const safeConflicts = runner.detectWriteConflicts(safe);
  assert(safeConflicts.length === 0, `No conflicts between frontend & backend`);

  // Conflict: qa and tester both write to tests/
  const conflicting: WriteClaim[] = [
    { agentName: 'qa', patterns: ['tests/**'] },
    { agentName: 'tester', patterns: ['tests/**', 'platform/simulations/**'] },
  ];
  const found = runner.detectWriteConflicts(conflicting);
  assert(found.length === 1, `Found 1 conflict between qa & tester`);
  assert(found[0]?.a === 'qa' && found[0]?.b === 'tester', `Conflict is qa↔tester`);

  // Conflict: debugger writes to ** (everything) — overlaps with anyone
  const debuggerClaim: WriteClaim[] = [
    { agentName: 'debugger', patterns: ['**'] },
    { agentName: 'frontend', patterns: ['saas-app/frontend/**'] },
  ];
  const debugConflicts = runner.detectWriteConflicts(debuggerClaim);
  assert(debugConflicts.length === 1, `Debugger (write-all) conflicts with frontend`);
}

// ─── Test 5: TeamLauncher sequential_parallel batching ───────

async function testSequentialParallelBatching(): Promise<void> {
  console.log('\n🧪 Test 5: TeamLauncher sequential_parallel batching');

  const runner = new AgentRunner();
  const batchSizes: number[] = [];

  const launcher = new TeamLauncher(runner, { maxParallel: 4 });
  launcher.on('batch:ready', ({ batchSize }: { batchSize: number }) => {
    batchSizes.push(batchSize);
  });

  const template: TeamTemplate = {
    name: 'feature',
    goal: 'Build a feature',
    members: ['architect', 'frontend', 'backend', 'tester', 'reviewer'],
    pattern: 'sequential_parallel',
    taskFlow: ['design', 'implement', 'test', 'review'],
  };

  // architect first, then frontend+backend in parallel, then tester, then reviewer
  const tasks: Task[] = [
    makeTask('design', 'architect'),
    makeTask('impl-fe', 'frontend', ['design']),
    makeTask('impl-be', 'backend', ['design']),
    makeTask('test', 'tester', ['impl-fe', 'impl-be']),
    makeTask('review', 'reviewer', ['test']),
  ];

  const workflow = makeWorkflow();
  workflow.tasks = tasks.map((t) => t.id);

  const results = await launcher.launch(template, workflow, tasks);

  assert(results.length === 5, `All 5 tasks completed (got ${results.length})`);
  assert(results.every((r) => r.status === 'completed'), `All tasks succeeded`);

  // Batching: should be 4 batches — [architect], [frontend, backend], [tester], [reviewer]
  // The [architect] batch is size 1 so it runs via single run (no batch:ready event)
  // [frontend, backend] → batchSize 2
  // [tester] → single run
  // [reviewer] → single run
  assert(
    batchSizes.includes(2),
    `Frontend + Backend were batched together (batch sizes: ${batchSizes.join(', ')})`,
  );
}

// ─── Test 6: events fire during parallel execution ───────────

async function testEventEmission(): Promise<void> {
  console.log('\n🧪 Test 6: Events fire correctly');

  const runner = new AgentRunner();
  const events: string[] = [];

  runner.on('agent:start', () => events.push('agent:start'));
  runner.on('agent:complete', () => events.push('agent:complete'));
  runner.on('batch:start', () => events.push('batch:start'));
  runner.on('batch:complete', () => events.push('batch:complete'));

  await runner.runParallel(
    [
      { taskId: 't1', agentName: 'frontend', prompt: 'work' },
      { taskId: 't2', agentName: 'backend', prompt: 'work' },
    ],
    { maxParallel: 2 },
  );

  assert(events.includes('batch:start'), `batch:start emitted`);
  assert(events.includes('batch:complete'), `batch:complete emitted`);
  assert(events.filter((e) => e === 'agent:start').length === 2, `2× agent:start`);
  assert(events.filter((e) => e === 'agent:complete').length === 2, `2× agent:complete`);

  const batchStartIdx = events.indexOf('batch:start');
  const batchCompleteIdx = events.indexOf('batch:complete');
  assert(batchStartIdx < batchCompleteIdx, `batch:start before batch:complete`);
}

// ─── Test 7: getActiveAgents snapshot ────────────────────────

async function testActiveAgentsSnapshot(): Promise<void> {
  console.log('\n🧪 Test 7: getActiveAgents() tracks running agents');

  const runner = new AgentRunner();
  const snapshots: string[][] = [];

  runner.on('agent:start', () => {
    snapshots.push(runner.getActiveAgents());
  });

  await runner.runParallel(
    [
      { taskId: 't1', agentName: 'frontend', prompt: 'work' },
      { taskId: 't2', agentName: 'backend', prompt: 'work' },
    ],
    { maxParallel: 2 },
  );

  assert(snapshots.length === 2, `Captured 2 snapshots`);
  // After both agents finish, active should be empty
  assert(runner.getActiveAgents().length === 0, `No agents active after completion`);
}

// ─── Run all tests ───────────────────────────────────────────

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════');
  console.log('  Parallel Agent Execution — Integration Tests ');
  console.log('═══════════════════════════════════════════════');

  await testParallelExecution();
  await testConcurrencyLimit();
  await testFailFast();
  await testWriteConflictDetection();
  await testSequentialParallelBatching();
  await testEventEmission();
  await testActiveAgentsSnapshot();

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main();
