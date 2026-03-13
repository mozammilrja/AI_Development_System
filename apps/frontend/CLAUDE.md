# Frontend Service — Conventions

## Stack
- React 18 with TypeScript
- Next.js 14 (App Router)
- Tailwind CSS for styling

## Component Patterns
- Use functional components with hooks (no class components)
- Co-locate component, styles, and tests: `ComponentName/index.tsx`, `ComponentName.test.tsx`
- Props interfaces must be explicitly typed — no `any`
- Use `React.memo` only when profiling shows re-render issues
- Prefer composition over prop drilling; use context for cross-cutting concerns

## File Naming
- Components: `PascalCase.tsx`
- Hooks: `useHookName.ts`
- Utils: `camelCase.ts`
- Types: `types.ts` in the module root

## Testing
- Every component must have a test file
- Use React Testing Library — test behavior, not implementation
- Test accessibility: each interactive element must have an accessible name
- Snapshot tests only for stable, visual components — never for logic

## Accessibility
- All images need `alt` text
- Interactive elements need keyboard support
- Color contrast must meet WCAG AA
- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`)

## Performance
- Lazy-load routes and heavy components with `React.lazy` + `Suspense`
- Images use `next/image` for optimization
- Avoid inline object/array literals in JSX props (causes re-renders)
