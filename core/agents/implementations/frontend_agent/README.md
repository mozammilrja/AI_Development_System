# Frontend Agent

## Purpose

Contains prompt templates for the **Frontend** agent, responsible for building UI components, pages, and client-side logic.

## Owned Paths

- `apps/frontend/`
- `saas-app/frontend/`

## Capabilities

- Create React components with TypeScript strict mode
- Build responsive page layouts with Tailwind CSS
- Follow WAI-ARIA accessibility guidelines
- Implement loading/error states and SEO meta tags

## Stack

| Workspace | Runtime | State | Styling | Router |
|-----------|---------|-------|---------|--------|
| `apps/` | Next.js (App Router) | — | Tailwind CSS | App Router |
| `saas-app/` | React 18 + Vite | Zustand + React Query | Tailwind CSS | React Router v6 |

## Files

| File | Description |
|------|-------------|
| `prompts.md` | System prompt, component generation prompt, page layout prompt |

## Model

Primary: Claude Sonnet · Fallback: GPT-4o → GPT-4o-mini
