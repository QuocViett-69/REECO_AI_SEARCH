# REECO AI Search

REECO product search application with a React frontend, NestJS API, shared Zod contracts, and a Supabase PostgreSQL data foundation.

For the personal AI-search demo, follow [the demo checklist](./docs/demo-ai-search-checklist.md). The admin catalog is read-only; price editing remains available. Run the live embedding validator, model warmup and search smoke before presenting.

For teammate contributions and production deployments, follow the [Vercel Hobby PR workflow](./docs/vercel-hobby-workflow.md).

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
- `packages/shared`: shared Zod schemas, TypeScript types and constants (used by the API)
- `services/reranker`: optional Python BGE reranker service (`npm run reranker:serve`, off by default)
- `supabase`: versioned database migrations and RLS policies
- `scripts`: product processing, import, validation, and local database tooling
- `data`: source datasets, processed artifacts, and validation reports
- `docs`: architecture, API contract ([`docs/api-contract.md`](./docs/api-contract.md)), and handoff notes

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- Ollama with `qwen3-embedding:4b`

## Install

```bash
npm install
```

Run `npm install` again after pulling: new dependencies are not installed by `git pull`, and the
build fails with `Cannot find module` until they are.

## Run locally

Copy `apps/api/.env.example` to `apps/api/.env` and configure the Supabase URL, service-role key, and
database connection string.

`DATABASE_URL` (used by `POST /admin/import` and the `supabase:*` scripts) must be the **Session
pooler** string from Supabase → Connect, e.g.
`postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`.
The direct host `db.<project-ref>.supabase.co` only has an IPv6 address, so on IPv4-only networks the
import fails with `getaddrinfo ENOTFOUND`.

For the CRA frontends:

```bash
cp apps/client/.env.example apps/client/.env
cp apps/admin/.env.example apps/admin/.env
```

Both use `REACT_APP_*` environment variables (CRA runtime requirement). Ensure `REACT_APP_API_URL` (pointing to the NestJS API) and `REACT_APP_ADMIN_URL` (pointing to the admin frontend) are properly set in `apps/client/.env`. Never expose backend secrets through a `REACT_APP_` variable.

Confirm the embedding model exists:

````bash
ollama list
ollama pull qwen3-embedding:4b
``
Invoke-RestMethod `
  -Uri 'http://127.0.0.1:11434/api/chat' `
  -Method Post `
  -ContentType 'application/json' `
  -Body '{"model":"qwen3:4b-instruct-2507-q4_K_M","stream":false,"keep_alive":"10m"}'


Run Ollama if it is not already active, then start services in separate terminals:

```bash
# Backend API
npm run dev:api          # http://localhost:3000

# Customer frontend
npm run dev:client       # http://localhost:5173

# Admin frontend
npm run dev:admin        # http://localhost:5174

````

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

Customer UI: http://127.0.0.1:4173 · Admin UI: http://127.0.0.1:4174 · API health: http://127.0.0.1:3100/api/v1/health. Press Ctrl+C to stop. This uses the Supabase project configured in `apps/api/.env`. Admin imports and edits are blocked in local staging (`LOCAL_STAGING_READ_ONLY=true` rejects every non-GET `/admin/*` request with 403), so the shared product data stays read-only; orders and payments are not blocked. Do not expose this environment publicly.

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
- **Verify Payment Callback**: `GET /api/v1/payments/vnpay/verify`. Verifies HMAC-SHA512 checksum, locates order by `vnp_TxnRef`, verifies `vnp_Amount / 100 == total`. Transitions successful orders to `PROCESSING` with `PAID` status, recording status history and notifications. Idempotent: repeated calls for an already `PAID` order return cached state without duplicating notifications. Only orders in `PENDING_PAYMENT` or `PAYMENT_FAILED` are updated: for any other status (for example `CANCELLED`) nothing is written and the response is `success: false, code: "ORDER_NOT_AWAITING_PAYMENT"`.
- **VNPay IPN (Webhook)**: `GET /api/v1/payments/vnpay/ipn`. Shares the underlying validation and update logic with `verify`, responding in standard VNPay IPN format (`{ RspCode, Message }`):
  - `00`: Confirm Success
  - `01`: Order not found
  - `02`: Order already confirmed (Idempotency), or the order is no longer awaiting payment (for example cancelled) — the result is ignored and logged for manual reconciliation
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

Initialize your local Supabase instance and seed the demo data:

```bash
supabase start
supabase db reset
npm run demo:seed
npm run demo:seed:orders
```

`demo:seed:orders` creates the three `[demo-seed]` orders for `haitran@example.com` (rerunning
replaces them). Run it after `demo:seed`, which creates that customer; it builds `shared` and `api`
itself.

Configure both frontend apps from their `.env.example` (`REACT_APP_API_URL` is the only required value).
Neither frontend talks to Supabase directly: they sign in through `POST /api/v1/auth/login`, so no
Supabase key belongs in a `REACT_APP_` variable. Restart/rebuild after changing these values.
Configure `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, and `VNPAY_RETURN_URL` on the API (use placeholder sandbox values, never commit real secrets).

Start the services (in separate terminals):

```bash
# Backend API (port 3000)
npm run dev:api

# Customer frontend (port 5173)
npm run dev:client

# Admin frontend (port 5174)
npm run dev:admin
```

Demo Accounts:

| Email               | Password   | Role   |
| :------------------ | :--------- | :----- |
| haitran@example.com | ilovereeco | client |
| admin@reeco.vn      | ilovereeco | admin  |

Offline merge checks (no database writes):

```bash
npm run build
npm run test:api
npm run test:admin
npm run test:client -- --runInBand
node --test scripts/payments/vnpay-signing.test.mjs scripts/payments/merge-regression.test.mjs
```

Admin app (http://localhost:5174): only accounts whose `app_metadata.role` is `admin` can sign in
(`haitran@example.com` is refused). The session is kept in `localStorage['reeco_admin_session']` and
refreshed through `POST /auth/refresh`; when that fails the app returns to `/login`. Pages are real URLs
(`/`, `/products`, `/products/:productId`, `/orders`, `/orders/:orderId`, `/import`, …), so reloading
or sharing a link opens the same page.

The payment and notification integration suites write test rows; run them only
against a disposable/test database. API lint currently reports explicit `any`
types in the order/notification modules.

All `/admin/*` API routes require a Supabase token whose `app_metadata.role` is
`admin` (403 otherwise). `POST /api/v1/search` is rate limited per IP
(`SEARCH_RATE_LIMIT_PER_MINUTE`, default 60). See
[`docs/api-contract.md`](./docs/api-contract.md) for every route.

VD:

"bây giờ hồ cá tôi đang bị bẩn tôi muốn cải thiện chất lượng nước nên dùng thiết bị gì"
