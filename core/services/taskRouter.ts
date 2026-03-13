import type {
  AgentName,
  Task,
  TaskPriority,
  WorkflowType,
} from '../orchestrator/types.js';

interface RouteResult {
  workflowType: WorkflowType;
  tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[];
}

/**
 * Analyzes a user request and produces a workflow type + ordered task list.
 * Pairs each task with the agent best suited for it based on the agent
 * definitions in core/agents/definitions/.
 */
export class TaskRouter {
  /** Map keywords / intent signals to workflow types. */
  private static readonly INTENT_MAP: Record<string, WorkflowType> = {
    build: 'development',
    feature: 'development',
    create: 'development',
    add: 'development',
    implement: 'development',
    bug: 'debug',
    fix: 'debug',
    error: 'debug',
    debug: 'debug',
    review: 'review',
    audit: 'review',
    deploy: 'release',
    release: 'release',
    ship: 'release',
    research: 'research',
    evaluate: 'research',
    compare: 'research',
  };

  /** Detect workflow type from free-text request. */
  detectWorkflow(request: string): WorkflowType {
    const lower = request.toLowerCase();
    for (const [keyword, type] of Object.entries(TaskRouter.INTENT_MAP)) {
      if (lower.includes(keyword)) return type;
    }
    return 'development'; // default
  }

  /** Break a request into an ordered task list for the detected workflow. */
  route(request: string, priority: TaskPriority = 'medium'): RouteResult {
    const workflowType = this.detectWorkflow(request);

    switch (workflowType) {
      case 'development':
        return this.planDevelopment(request, priority);
      case 'debug':
        return this.planDebug(request, priority);
      case 'review':
        return this.planReview(request, priority);
      case 'release':
        return this.planRelease(request, priority);
      case 'research':
        return this.planResearch(request, priority);
    }
  }

  private planDevelopment(request: string, priority: TaskPriority): RouteResult {
    return {
      workflowType: 'development',
      tasks: [
        this.task('architect', 'Design architecture', `Design the architecture for: ${request}`, priority, []),
        this.task('frontend', 'Implement frontend', `Build the frontend for: ${request}`, priority, ['design']),
        this.task('backend', 'Implement backend', `Build the backend API for: ${request}`, priority, ['design']),
        this.task('tester', 'Write and run tests', `Test the implementation of: ${request}`, priority, ['frontend', 'backend']),
        this.task('reviewer', 'Code review', `Review all changes for: ${request}`, priority, ['tests']),
      ],
    };
  }

  private planDebug(request: string, priority: TaskPriority): RouteResult {
    return {
      workflowType: 'debug',
      tasks: [
        this.task('debugger', 'Investigate (logic)', `Hypothesis A — logic error: ${request}`, priority, []),
        this.task('debugger', 'Investigate (state)', `Hypothesis B — state/data issue: ${request}`, priority, []),
        this.task('debugger', 'Investigate (integration)', `Hypothesis C — integration issue: ${request}`, priority, []),
        this.task('debugger', 'Synthesize fix', `Synthesize root cause and fix: ${request}`, priority, ['investigate']),
        this.task('tester', 'Validate fix', `Validate the fix for: ${request}`, priority, ['fix']),
      ],
    };
  }

  private planReview(request: string, priority: TaskPriority): RouteResult {
    return {
      workflowType: 'review',
      tasks: [
        this.task('security', 'Security review', `Security audit: ${request}`, priority, []),
        this.task('reviewer', 'Performance review', `Performance review: ${request}`, priority, []),
        this.task('qa', 'Coverage review', `Test coverage review: ${request}`, priority, []),
      ],
    };
  }

  private planRelease(request: string, priority: TaskPriority): RouteResult {
    return {
      workflowType: 'release',
      tasks: [
        this.task('devops', 'Deploy', `Deploy to target environment: ${request}`, priority, []),
        this.task('qa', 'Validate deployment', `Validate deployment: ${request}`, priority, ['deploy']),
      ],
    };
  }

  private planResearch(request: string, priority: TaskPriority): RouteResult {
    return {
      workflowType: 'research',
      tasks: [
        this.task('architect', 'Proponent case', `Build case FOR: ${request}`, priority, []),
        this.task('reviewer', 'Critic case', `Build case AGAINST: ${request}`, priority, []),
        this.task('architect', 'Evaluate', `Evaluate and recommend: ${request}`, priority, ['proponent', 'critic']),
      ],
    };
  }

  private task(
    agent: AgentName,
    title: string,
    description: string,
    priority: TaskPriority,
    dependsOn: string[],
  ): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      title,
      description,
      assignedTo: agent,
      status: 'pending',
      priority,
      workflowId: '',
      dependsOn,
    };
  }
}
