# REECO AI Search

Project skeleton for the REECO product search application. This repository currently contains infrastructure and placeholder modules only; business features are intentionally not implemented.

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
- `supabase`: placeholders for future Supabase migrations, seed files, and functions
- `scripts`: placeholders for future data tooling
- `data`: placeholders for raw, processed, and sample data
- `docs`: architecture and API notes

## Requirements

- Node.js 20 or newer
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

```bash
npm run dev:api
```

Backend default: http://localhost:3000

Health endpoint: http://localhost:3000/api/v1/health

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```
