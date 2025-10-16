### v0-clone

An open-source clone of Vercel's v0 experience: describe what you want to build, and an AI coding agent generates a working Next.js fragment in a disposable sandbox. Each iteration is saved as a message with an attached code fragment and a live preview.

### Features

- **Chat-to-build**: Send prompts to generate UI or features; results are saved as messages and fragments.
- **Live preview**: Each fragment runs in an isolated E2B sandbox with a public URL.
- **Code view**: Inspect generated files via an in-app file explorer.
- **Projects**: Group your conversations and fragments per project.
- **Auth and usage limits**: Clerk auth with free/pro usage tiers and rate limiting.
- **Background jobs**: Inngest powers the agent orchestration and sandbox operations.

### Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **UI**: Shadcn UI (Radix Primitives, Tailwind CSS 4)
- **Auth & Billing**: Clerk
- **Database**: Prisma + PostgreSQL
- **API**: tRPC (server adapters + TanStack Query 5 on client)
- **Agents/Jobs**: Inngest + `@inngest/agent-kit`
- **Sandboxing**: E2B

### Architecture Overview

- `src/app` — routes and API handlers
  - `api/trpc/[trpc]/route.ts` — tRPC fetch adapter
  - `api/inngest/route.ts` — Inngest function server
- `src/modules` — feature modules
  - `projects` — server procedures and UI for project view, messages, preview/code tabs
  - `home` — landing page, project creation
- `src/inngest` — agent network and functions
  - `functions.ts` — main `code/generate` function: spins up sandbox, runs agent network, stores results
  - `agents.ts`, `tools.ts`, `network.ts`, `prompt.ts` — agent definition, tools (terminal, read/write files), router, prompts
- `src/lib/prisma.ts` — Prisma client
- `prisma/schema.prisma` — models: `Project`, `Message`, `Fragment`, `Usage`
- `src/trpc` — router, context, server/client wiring
- `src/env` — validated env vars for server and client using `@t3-oss/env-nextjs`

Data flow for a generation:

1. User submits a prompt in a project → `messages.create` mutation saves user message and triggers Inngest event `code/generate`.
2. Inngest function creates an E2B sandbox, hydrates agent memory with last messages, runs the agent network.
3. Resulting files are written to the sandbox; a live URL is derived and saved with a fragment.
4. A new assistant message is stored with `type=RESULT` and linked `Fragment` containing `files` and `sandboxUrl`.
5. UI polls messages; latest assistant fragment becomes the active preview and code.

### Shadcn UI Usage

Shadcn components are colocated under `src/components/ui/*` and used throughout the app (e.g., buttons, tabs, dropdowns, resizable panels). Follow the component APIs as implemented in this repo. Tailwind CSS 4 powers styling; no extra CSS files are required beyond the provided theme and utilities.

### Environment Variables

Server (`src/env/server.ts`):

- `DATABASE_URL` — PostgreSQL connection URL
- `NODE_ENV` — `development` | `test` | `production`
- `OPENAI_API_KEY` — LLM key used by `@inngest/agent-kit`
- `E2B_API_KEY` — E2B sandbox API key
- `CLERK_SECRET_KEY` — Clerk server key

Client (`src/env/client.ts`):

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

Create a `.env` and `.env.local` with these values before running locally.

### Database

Prisma models live in `prisma/schema.prisma`. Run migrations and generate the client:

```bash
npm install
npx prisma migrate deploy
npx prisma generate
```

### Local Development

1. Set environment variables (see above).
2. Install deps: `npm install`.
3. Generate Prisma client: `npm run postinstall` (runs automatically) or `npx prisma generate`.
4. Start dev server: `npm run dev`.
5. Sign in with Clerk and create a project on `/`.
6. Send a message; an Inngest job will generate a fragment and attach a live sandbox preview.

### Production Deployment

- Deploy on your platform of choice (e.g., Vercel). Ensure runtime env vars are set.
- Provision a managed Postgres database and set `DATABASE_URL`.
- Set Clerk keys and domain.
- Ensure Inngest and E2B keys are configured in the environment.

### Key Scripts

- `dev` — Next.js dev with Turbopack
- `build` — Next.js build
- `start` — Next.js start
- `postinstall` — `prisma generate`

### Security & Limits

- Middleware protects non-public routes via Clerk; API routes are public but server procedures enforce auth.
- Usage limits are tracked in `Usage` via `rate-limiter-flexible`; free vs pro quotas enforced in `src/lib/usage.ts`.

### Folder Map

```
src/
  app/
  components/
  e2b/
  env/
  inngest/
  lib/
  modules/
  trpc/
prisma/
```
