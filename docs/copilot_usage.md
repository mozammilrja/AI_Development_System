# Using GitHub Copilot with the AI Development System

This guide explains how to use GitHub Copilot (powered by Claude Opus) to work effectively within this repository. Copilot reads the instructions in `.github/copilot-instructions.md` and `.claude/project_context.md` automatically, so it already understands the project architecture, agent roles, and coding conventions.

---

## 1. Creating New Agents

Agents are defined in two places: a YAML spec and a Markdown prompt file.

### Steps

1. **Create the definition** in `core/agents/definitions/<agent_name>.yaml`
2. **Create the prompts** in `core/agents/implementations/<agent_name>/prompts.md`
3. **Register the agent** in `configs/agents.yaml` under the `agents:` key
4. **Assign file ownership** — pick directories no other agent writes to

### Copilot Prompts

```
Create a new agent definition YAML file at core/agents/definitions/analytics.yaml.
The agent is called "analytics", role is "Analytics Engineer".
It should use claude-sonnet as the primary model with gpt-4o fallback.
Give it read access to all files and write access to apps/backend/analytics/.
Its tools are: file_editor, repo_reader, terminal_executor.
Follow the same YAML structure as core/agents/definitions/architect.yaml.
```

```
Create a prompts.md file at core/agents/implementations/analytics_agent/prompts.md.
Include a system prompt for a senior analytics engineer who builds data pipelines
and dashboards, a data model prompt, and a query optimization prompt.
Follow the format used in core/agents/implementations/backend_agent/prompts.md.
```

```
Add the analytics agent to configs/agents.yaml with temperature 0.3 and
add it to the feature team members list.
```

---

## 2. Creating New Workflows

Team workflows live in `core/agents/teams/` as Markdown templates. Each template defines the team goal, members, responsibilities, file ownership, communication rules, and task flow.

### Steps

1. **Create the template** in `core/agents/teams/<workflow>_team.md`
2. **Register the team** in `configs/agents.yaml` under the `teams:` key
3. **Add a slash command** in `.claude/commands/` (optional)
4. **Document the workflow** in `core/workflows/README.md`

### Copilot Prompts

```
Create a new team workflow template at core/agents/teams/migration_team.md.
The goal is to safely migrate a database schema. Members: Backend Developer
and Tester. The Backend agent writes migrations in apps/database/, the Tester
validates data integrity. Use the same sections as core/agents/teams/release_team.md:
Team Goal, Team Members, Responsibilities, File Ownership, Communication Rules,
Task Flow, Teammate Definitions with spawn prompts.
```

```
Add the migration team to configs/agents.yaml under the teams key with
members [backend, tester] and pattern "sequential".
```

```
Create a slash command file at .claude/commands/migrate-db.md that triggers
the migration_team workflow with a {{MIGRATION_DESCRIPTION}} placeholder.
```

---

## 3. Generating Backend APIs

The backend lives in two workspaces. Use the right one depending on what you're building:

| Workspace | Stack | Location |
|-----------|-------|----------|
| `saas-app/backend/` | Express.js + MongoDB (Mongoose) + Zod | Active SaaS product |
| `apps/backend/` | Python + Uvicorn + PostgreSQL | AI system backend |

### Copilot Prompts — Express.js (saas-app)

```
Create a new REST API resource for "notifications" in the saas-app backend.
Generate these files following the existing patterns:
- saas-app/backend/src/models/Notification.ts (Mongoose model with userId,
  type, message, read, createdAt)
- saas-app/backend/src/validators/notification.validator.ts (Zod schemas)
- saas-app/backend/src/services/notification.service.ts (CRUD operations)
- saas-app/backend/src/controllers/notification.controller.ts (request handlers
  using asyncHandler)
- saas-app/backend/src/routes/notification.routes.ts (GET list, GET by id,
  POST create, PATCH mark-read, DELETE)
Register the routes in saas-app/backend/src/routes/index.ts.
Use the protect middleware for all routes. Follow the patterns in
saas-app/backend/src/controllers/product.controller.ts.
```

```
Add a PATCH endpoint to saas-app/backend/src/routes/team.routes.ts that lets
an admin change a team member's role. Use restrictTo('admin', 'owner')
middleware. Validate the request body with Zod. Follow the existing controller
and service patterns.
```

### Copilot Prompts — Python (apps)

```
Create a new FastAPI endpoint in apps/backend/ for user analytics.
Add a GET /api/analytics/dashboard endpoint that returns aggregated metrics.
Use async/await, type hints on all functions, and follow the patterns in
apps/backend/CLAUDE.md.
```

---

## 4. Generating Frontend Components

The frontend also spans two workspaces:

| Workspace | Stack | Location |
|-----------|-------|----------|
| `saas-app/frontend/` | React 18 + Vite + Tailwind + Zustand + React Query | Active SaaS product |
| `apps/frontend/` | Next.js (App Router) + TypeScript + Tailwind | AI system frontend |

### Copilot Prompts — React/Vite (saas-app)

```
Create a NotificationBell component at
saas-app/frontend/src/components/ui/NotificationBell.tsx.
It should show an icon with an unread count badge, open a dropdown listing
recent notifications, and mark them as read on click. Use Lucide React for
icons, Tailwind CSS for styling, and fetch data via a useNotifications hook.
Follow the patterns in saas-app/frontend/src/components/ui/.
```

```
Create a React Query hook at saas-app/frontend/src/hooks/useNotifications.ts.
It should export useNotifications (GET /notifications), useMarkRead
(PATCH /notifications/:id), and useDeleteNotification (DELETE /notifications/:id).
Use the ApiClient from saas-app/frontend/src/lib/api.ts. Follow the patterns
in saas-app/frontend/src/hooks/useAuth.ts.
```

```
Create a new page at saas-app/frontend/src/pages/Notifications.tsx.
It should be a protected page that lists all notifications with filters
for read/unread. Add the route to App.tsx under /notifications.
Use React Router v6 and follow the patterns in
saas-app/frontend/src/pages/Dashboard.tsx.
```

```
Add a Zustand store at saas-app/frontend/src/stores/notificationStore.ts
for managing real-time notification state (unread count, latest notifications).
Persist with localStorage. Follow the patterns in
saas-app/frontend/src/stores/authStore.ts.
```

### Copilot Prompts — Next.js (apps)

```
Create a new page at apps/frontend/src/app/agents/page.tsx that displays
a list of all configured agents. Use server components, TypeScript strict
mode, and Tailwind CSS. Follow the patterns in apps/frontend/src/app/page.tsx.
```

---

## 5. More Example Prompts

### Agent Definitions & Configuration

```
Show me the YAML structure for defining a new agent. Use
core/agents/definitions/architect.yaml as the reference.
```

```
What model and fallback chain does the frontend agent use? Check
core/agents/definitions/frontend.yaml and configs/model_config.yaml.
```

### Debugging & Investigation

```
A user reports they get a 401 error when accessing /api/teams despite being
logged in. Trace the auth flow from saas-app/backend/src/middleware/auth.middleware.ts
through the team routes. Identify where the token verification could fail.
```

### Testing

```
Write Jest unit tests for the ProductService in
saas-app/backend/src/services/product.service.ts. Test create, getAll with
pagination, getBySlug, update, and soft-delete. Mock the Mongoose model.
```

```
Write a Playwright E2E test that logs in, navigates to the Teams page,
creates a new team, invites a member, and verifies the invite appears.
Put it in platform/simulations/browser_tests/.
```

### Infrastructure

```
Add a new service called "notification-worker" to
platform/infrastructure/docker/docker-compose.yml. It should use the same
Python base image, depend on redis, and run a celery worker. Follow the
existing service patterns.
```

### Documentation

```
Update docs/architecture.md to include the new notifications feature.
Add a section describing the Notification model, API endpoints, and
how it integrates with the existing subscription and team systems.
```

---

## Tips for Effective Copilot Usage

1. **Reference existing files** — Always point Copilot to an existing file as a pattern to follow (e.g., "follow the patterns in `auth.controller.ts`").
2. **Specify the workspace** — Say `saas-app/backend/` or `apps/frontend/` explicitly so Copilot writes to the correct location.
3. **Name the conventions** — Mention Zod, Zustand, React Query, asyncHandler, etc. so Copilot uses the project's established patterns.
4. **Respect file ownership** — Don't ask Copilot to write frontend code in a backend directory or vice versa.
5. **Use slash commands** — For multi-agent workflows, use `/build-feature`, `/debug-bug`, `/code-review`, `/deploy-app`, or `/research-tech` to trigger the appropriate team template.
