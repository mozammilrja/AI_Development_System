# MCP (Model Context Protocol) Configuration

## Overview

MCP enables AI agents to connect with external tools, databases, and services through a standardized protocol.

## Configured Servers

| Server | Purpose | Status |
|--------|---------|--------|
| `filesystem` | Read/write project files | ✅ Active |
| `git` | Git operations (commit, branch, etc.) | ✅ Active |
| `memory` | Persistent agent memory | ✅ Active |
| `github` | GitHub API (issues, PRs) | 🔧 Needs token |
| `postgres` | Database operations | 🔧 Needs connection |
| `fetch` | HTTP requests to external APIs | ✅ Active |
| `sequential-thinking` | Enhanced reasoning | ✅ Active |

## Setup

### 1. Install MCP Servers

```bash
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-fetch
```

### 2. Configure Environment Variables

Create `.env` file:

```bash
# GitHub (for github server)
GITHUB_TOKEN=ghp_your_token_here

# Database (for postgres server)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### 3. Verify Configuration

```bash
# Test filesystem server
npx @modelcontextprotocol/server-filesystem .

# Test git server
npx @modelcontextprotocol/server-git
```

## Configuration Files

| File | Purpose |
|------|---------|
| `.mcp.json` | Root MCP configuration |
| `.claude/settings.json` | Claude-specific MCP settings |

## Using MCP in Agents

Agents can use MCP tools by referencing them in their definitions:

```yaml
# In .agents/backend.agent.md
tools:
  - mcp_filesystem_read
  - mcp_filesystem_write
  - mcp_git_commit
  - mcp_postgres_query
```

## Available MCP Tools

### Filesystem
- `mcp_filesystem_read` - Read file contents
- `mcp_filesystem_write` - Write to files
- `mcp_filesystem_list` - List directory contents

### Git
- `mcp_git_status` - Get repo status
- `mcp_git_commit` - Create commits
- `mcp_git_branch` - Manage branches
- `mcp_git_diff` - View changes

### GitHub
- `mcp_github_create_issue` - Create issues
- `mcp_github_create_pr` - Create pull requests
- `mcp_github_list_repos` - List repositories

### Memory
- `mcp_memory_store` - Store persistent data
- `mcp_memory_retrieve` - Retrieve stored data

### Database (Postgres)
- `mcp_postgres_query` - Execute SQL queries
- `mcp_postgres_schema` - Get schema info

## Troubleshooting

### Server Not Found
```bash
npm install -g @modelcontextprotocol/server-<name>
```

### Permission Denied
```bash
chmod +x node_modules/.bin/mcp-server-*
```

### Connection Failed
Check environment variables and network connectivity.

## References

- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)
