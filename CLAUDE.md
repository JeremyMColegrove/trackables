# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server with Turbopack
npm run build         # Production build (Webpack)
npm run start         # Start production server
npm run test          # Run tests with tsx
npm run lint          # ESLint
npm run typecheck     # TypeScript strict check (no emit)
npm run format        # Prettier

# Database
npm run db:generate   # Generate Drizzle migrations after schema changes
npm run db:migrate    # Apply migrations
npm run db:studio     # Open Drizzle Studio UI

# Docker
npm run docker:build:multi  # Build multi-platform Docker image
```

## Architecture

**Trackables** is a Next.js 15 full-stack app for creating shareable forms and tracking API usage events. Key domains: workspaces (multi-tenant), trackable items (forms + API logs), sharing/access control, API keys, usage tracking, and an MCP server for AI agent access.

### Request Flow

```
UI (React Query + tRPC client)
  → /api/trpc/[trpc]  (Next.js route)
  → tRPC router (thin — validate input, check auth, delegate)
  → Service layer (business logic)
  → Drizzle ORM → PostgreSQL
  → Redis (cache, counters, BullMQ job queue)
```

### Key Directories

| Path | Purpose |
|------|---------|
| `app/[locale]/` | Next.js App Router pages (i18n via gt-next) |
| `app/api/` | Non-tRPC endpoints: `/usage`, `/mcp`, `/trackable-assets`, webhooks |
| `server/api/routers/` | tRPC routers (thin — no inline business logic) |
| `server/services/` | Business logic layer |
| `server/mcp/` | Model Context Protocol server and tools |
| `server/redis/` | Redis client and cache repositories |
| `server/batch/` | BullMQ background jobs |
| `db/schema/` | Drizzle ORM schema (source of truth for DB) |
| `drizzle/` | Auto-generated migration files — never edit by hand |
| `components/ui/` | shadcn/ui components |

### Tech Constraints

- **tRPC only** — no REST routes; use existing `/api/usage` and `/api/mcp` patterns for non-browser clients
- **Tailwind CSS only** — no other styling systems
- **Drizzle migrations** — never hand-write SQL in `drizzle/`; always run `npm run db:generate` after schema changes
- Authentication via **Clerk** (JWT for browser, API keys for usage tracking, MCP tokens for agents)
- Billing via **Lemon Squeezy** webhooks

### Code Organization Rules (from AGENTS.md)

- **Routers are thin**: validate input, authorize, call a service, return result
- **Services own business logic**: no DB calls in routers, no tRPC in services
- **Authorization is centralized**: `server/services/access-control.service.ts` — do not scatter permission checks
- **UI components are presentational**: no business logic in React components
- Prefer explicit, readable code over clever abstractions

### Formatting

Prettier config: no semicolons, double quotes, 80-char line width, 2-space tabs, Tailwind plugin enabled. Run `npm run format` before committing.
