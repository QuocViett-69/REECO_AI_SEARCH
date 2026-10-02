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

```

Health endpoint: http://localhost:3000/api/v1/health

## Local staging demo

Each time you start the local demo:

1. Check that Ollama is running with `ollama ls`. If it cannot connect, open the Ollama desktop app or run `ollama serve` in a separate terminal.
2. From the project root, run the command below and leave that terminal open. It builds and starts the client, admin, and API.
3. Open http://127.0.0.1:4173 and search for `sensor supporting SDI-12`. The explanation appears under **Why this result**.

```bash
npm run staging:local
```

To use the installed Qwen model for search explanations, set `LLM_EXPLANATION_ENABLED=true` and `LLM_MODEL=qwen3:4b-instruct-2507-q4_K_M` in `apps/api/.env`. Search requests must include `explain: true`. The API uses catalog-backed explanations if Ollama is unavailable or its response fails validation. Leave the flag off to use templates only.

The models load on demand; you do not need to run `ollama run` or download them again at each startup. The reranker is disabled by default and does not need its own service for this demo.

Customer UI: http://127.0.0.1:4173 · Admin UI: http://127.0.0.1:4174 · API health: http://127.0.0.1:3100/api/v1/health. Press Ctrl+C to stop. This uses the Supabase project configured in `apps/api/.env`. Admin imports and edits are blocked in local staging, so the shared data stays read-only. The admin UI still has demo-only client login; do not use this environment to validate admin authentication or expose it publicly.

## Import and validate Supabase data

Apply the migrations in `supabase/migrations` to the target Supabase project first, then run:

```bash
npm run supabase:import
npm run supabase:validate
```

The import is transactional and idempotent. Its latest validation report is written to `data/reports/supabase-data-foundation-report.json`.

Run `npm run supabase:audit-specifications` to compare every live specification with its normalized artifact and referenced raw row. This read-only check reports missing/changed rows, suspect character encoding, and repeated keys in `data/reports/supabase-specification-audit.json`. Repeated keys can hold valid values for different conditions; the client groups them without discarding those values.

## VNPay Sandbox Integration

The application integrates with the VNPay Sandbox payment gateway:

- **Create Payment URL**: `POST /api/v1/payments/vnpay/create-url` (Requires authentication, body: `{ order_id }`). Validates order ownership, VNPay payment method, and status (`PENDING_PAYMENT` or `PAYMENT_FAILED`). Generates a strictly numeric `vnp_TxnRef`, stores it in `orders.vnpay_txn_ref`, resets `PAYMENT_FAILED` to `PENDING_PAYMENT`, and returns `{ payment_url, txn_ref, order_id }`.
- **Verify Payment Callback**: `GET /api/v1/payments/vnpay/verify`. Verifies HMAC-SHA512 checksum, locates order by `vnp_TxnRef`, verifies `vnp_Amount / 100 == total`. Transitions successful orders to `PROCESSING` with `PAID` status, recording status history and notifications. Idempotent: repeated calls for an already `PAID` order return cached state without duplicating notifications.
- **VNPay IPN (Webhook)**: `GET /api/v1/payments/vnpay/ipn`. Shares the underlying validation and update logic with `verify`, responding in standard VNPay IPN format (`{ RspCode, Message }`):
  - `00`: Confirm Success
  - `01`: Order not found
  - `02`: Order already confirmed (Idempotency)
  - `04`: Invalid amount
  - `97`: Checksum failed
  - `99`: Unknown error

Run VNPay automated test suite:
```bash
node --test --env-file=apps/api/.env scripts/payments/vnpay.test.mjs
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```


## Orders/payment merge setup

Apply `supabase/migrations/20261001000000_commerce_foundation.sql` and run
`npm run demo:seed` against your chosen demo database before using checkout.
Configure both frontend apps from their `.env.example`: `REACT_APP_SUPABASE_URL`
and `REACT_APP_SUPABASE_ANON_KEY` must use a public anon/publishable key,
never a service-role key. Restart/rebuild after changing these values.
Login requires a real Supabase token; generated demo tokens are rejected.
Configure `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, and `VNPAY_RETURN_URL` on the API.

Offline merge checks (no database writes):
```bash
npm run build
npm run test:client -- --runInBand
node --test scripts/payments/vnpay-signing.test.mjs scripts/payments/merge-regression.test.mjs
```
The payment and notification integration suites write test rows; run them only
against a disposable/test database. API lint currently reports explicit `any`
types in the added order/notification modules and one existing admin controller.
