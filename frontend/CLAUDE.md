@AGENTS.md

## Project Reference

See the root-level `CONTEXT.md` for full project architecture, API docs, and development setup.

## Key Points

- Next.js 16 with React 19 — check `node_modules/next/dist/docs/` for breaking changes
- Tailwind CSS v4 via `@tailwindcss/postcss` (not the old `tailwindcss` PostCSS plugin)
- API client lives in `src/lib/api.ts`, auth utilities in `src/lib/auth.ts`
- Dashboard works in **demo mode** (localStorage) when the backend is unreachable
- All client components need `"use client"` directive
- Path alias: `@/*` maps to `./src/*`
