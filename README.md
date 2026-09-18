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

- `apps/api`: NestJS backend (port 3000)
- `apps/client`: Customer-facing React frontend — CRA, port 5173
- `apps/admin`: Admin React frontend — CRA, port 5174
- `apps/web`: Legacy React scaffold (Vite, port 5173)
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
database connection string.

For the CRA frontends:

```bash
cp apps/client/.env.example apps/client/.env
cp apps/admin/.env.example apps/admin/.env
```

Both use `REACT_APP_*` environment variables (CRA runtime requirement). Never expose backend secrets through a `REACT_APP_` variable.

Confirm the embedding model exists:

```bash
ollama list
ollama pull qwen3-embedding:4b
```

Run Ollama if it is not already active, then start services in separate terminals:

```bash
# Backend API
npm run dev:api          # http://localhost:3000

# Customer frontend
npm run dev:client       # http://localhost:5173

# Admin frontend
npm run dev:admin        # http://localhost:5174

# Legacy web scaffold (Vite)
npm run dev:web          # http://localhost:5173
```

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
