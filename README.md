# REECO AI Search

REECO product search application with a React frontend, NestJS API, shared Zod contracts, and a Supabase PostgreSQL data foundation.

The Basic Backend phase includes public product browsing, PostgreSQL full-text search, authenticated admin product access, and an idempotent product import pipeline.

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

## Install

```bash
npm install
```

## Run frontend

```bash
npm run dev:web
```

Frontend default: http://localhost:5173

## Run backend

Copy `apps/api/.env.example` to `apps/api/.env` and configure the Supabase URL, service-role key, and database connection string. Use the Supabase Session Pooler connection string for `DATABASE_URL` when the development machine does not have IPv6 connectivity.

```bash
npm run dev:api
```

Backend default: http://localhost:3000

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
