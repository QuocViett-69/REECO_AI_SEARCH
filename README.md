# REECO AI Search

REECO product search application with a React frontend, NestJS API, shared Zod contracts, and a Supabase PostgreSQL data foundation.

The frozen backend MVP includes public product browsing, hybrid/technical search, authenticated admin
product access, and an idempotent product import pipeline. See
[`docs/frontend-handoff.md`](./docs/frontend-handoff.md) for the frontend integration contract.

## Tech Stack

- React
- Vite
- TypeScript
- Node.js
- NestJS
- Supabase PostgreSQL
- pgvector

## Project Structure

- `apps/web`: React frontend
- `apps/api`: NestJS backend
- `packages/shared`: shared TypeScript types and constants
- `supabase`: versioned database migrations and RLS policies
- `scripts`: product processing, import, validation, and local database tooling
- `data`: source datasets, processed artifacts, and validation reports
- `docs`: architecture, API contract, and backend handoff notes

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- Ollama with `qwen3-embedding:4b`

## Install

```bash
npm install
```

## Run locally

Copy `apps/api/.env.example` to `apps/api/.env` and configure the Supabase URL, service-role key, and
database connection string. Copy `apps/web/.env.example` to `apps/web/.env`; its default
`VITE_API_URL` targets the local API. Never expose backend secrets through a `VITE_` variable.

Confirm the embedding model exists:

```bash
ollama list
ollama pull qwen3-embedding:4b
```

Run Ollama if it is not already active, then start the API and web app in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

Backend default: http://localhost:3000

Frontend default: http://localhost:5173

Health endpoint: http://localhost:3000/api/v1/health

## Import and validate Supabase data

Apply the migrations in `supabase/migrations` to the target Supabase project first, then run:

```bash
npm run supabase:import
npm run supabase:validate
```

The import is transactional and idempotent. Its latest validation report is written to `data/reports/supabase-data-foundation-report.json`.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```
