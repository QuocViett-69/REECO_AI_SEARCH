# Basic Backend Handoff for React

This remains the implementation-oriented backend note. For the frozen Step 7.7 startup, endpoint,
error, security, and UI readiness contract, use [`frontend-handoff.md`](./frontend-handoff.md).

The React applications use `REACT_APP_API_URL=http://localhost:3000/api/v1`. They are plain JavaScript
CRA apps and do not import `@reeco/shared`; its Zod schemas are the reference for the search and
product payloads (the API validates its own responses with them). Product data must come through
NestJS; the browser never receives `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL`.

## Product List

Call `GET /products` with `page`, `limit`, and any required filters. Render cards from `items`; use
`pagination.total_pages` for navigation. The backend guarantees this public list contains active products
only. Current `q` matching covers model and English product name; use `POST /search` for semantic labels,
protocols, aliases, and Vietnamese keyword documents.

## Product Detail

Call `GET /products/:productId` using the `product_id` from a card/search result. An exact model also works.
Render identity/card fields from `product`, categorization from `taxonomy`, feature sections from
`measurements`, `applications`, and `capabilities`, protocol badges from the protocol arrays, technical
tables from `specifications`, highlights from `important_specifications`, and links/images from `media`.

## Search

Call `POST /search` with `{ "query": string, "limit"?: number, "explain"?: boolean, "context"?: {...} }`
(the client sends `explain: true`; see [`api-contract.md`](./api-contract.md#post-search) for
`explanation`, `guidance`, `resolved_query`, `context_applied`, and the `429` rate limit). Render `results` in returned order.
`mode` is `hybrid` when keyword and semantic retrieval both succeed, `keyword` when semantic retrieval
is unavailable and keyword fallback succeeds, or `semantic` when keyword retrieval is unavailable and
semantic fallback succeeds. Mode describes the retrieval path, not result quality. A source returning
zero rows still succeeded and does not trigger fallback. Internal fallback names are not exposed.

Read score values by name. In hybrid mode, `keyword` is the raw keyword score or `0`, `semantic` is
cosine similarity or `null`, and `hybrid` is the RRF score. Keyword fallback populates only `keyword`;
semantic fallback uses keyword `0` and populates only `semantic`. The fields have different scales and
must not be compared directly. `hybrid` remains the original RRF retrieval score even when structured
technical evidence changes final ordering. `rerank` remains `null`. `matched_features` contains only
positive structured evidence and may include stable labels such as `identity:model:CS655`,
`protocol:SDI-12`, `operating-temperature:-40°C`, or
`measurement-temperature:up-to-70°C`. Explanations, when requested, are in the separate
`explanation` field.

The request `limit` is the final result count. The backend retrieves at least the configured candidate
depth, applies deterministic technical ranking/filtering, batch-loads active summaries, drops
candidates that have no active public summary, and then applies the final limit. Definitive numeric
temperature mismatches may reduce the response below the requested limit; unknown evidence survives.
Do not reorder results in React or attempt to sort them by `scores.hybrid`.

The endpoint now uses the server-only local Ollama provider for semantic retrieval. If Ollama is
offline, keyword fallback returns HTTP 200 with mode `keyword`. If keyword RPC fails while semantic
retrieval succeeds, HTTP 200 uses mode `semantic`. Only failure of both retrieval paths returns a
sanitized HTTP 503. Hosted migrations `20260916074530` and `20260916080205` are deployed and the hosted
column is `extensions.vector(1536)`. At the Step 7.5 handoff, 42/42 searchable active products had
current `qwen3-embedding:4b` embeddings at version `ollama-qwen3-embedding-4b-1536-v1`; the product
master has since grown to 89 active products, so run `npm run embeddings:backfill -- --execute` after
each import. RRF remains the Step
7.5A baseline with configurable `SEARCH_RRF_K=60`.

Step 7.6B integrates the Step 7.6A parser/evaluator into `SearchService`. An exact active identity is
prioritized only when already retrieved. Confirmed protocol and numeric temperature matches are
prioritized deterministically; protocol unknowns and numeric unknowns remain. Only definitive,
high-confidence operating/measurement temperature mismatch is filtered. This is a lexicographic
policy, not a score boost or model reranker. The public schema and modes are unchanged.

Later steps added an optional protected Top-5 BGE reranker (`RERANKER_ENABLED`, default `false`; see
[`reranker-runtime.md`](./reranker-runtime.md)), grounded rule-based explanations with optional local
Ollama wording selection (`explain: true`; see
[`grounded-explanation-design.md`](./grounded-explanation-design.md)), multi-component `guidance`, and
follow-up `context`.

## Compare 2 Products

There is no compare API in this phase. Fetch both in parallel:

```ts
const [left, right] = await Promise.all([
  fetch(`${apiUrl}/products/${leftProductId}`).then((response) =>
    response.json(),
  ),
  fetch(`${apiUrl}/products/${rightProductId}`).then((response) =>
    response.json(),
  ),
]);
```

Align rows by each specification's `canonical_key`; use `important_specifications` for a compact default
comparison and `specifications` for an expanded table.

## Admin Product Management

Sign in through the admin login screen (Supabase email/password) and call `GET /admin/products`
with `Authorization: Bearer <access-token>`. It uses the same filters/response wrapper as the public list,
but includes active and review products. Call `GET /admin/products/:productId` for admin detail.

`PATCH /admin/products/:productId` edits the whitelisted editor fields (strict schema; see
[`api-contract.md`](./api-contract.md)). Every `/admin/*` route requires a valid Supabase token
(`401` otherwise) and `app_metadata.role === "admin"` (`AdminGuard`, `403` otherwise). Customers are
ordinary Supabase users without that role.

## Admin Import

Call `POST /admin/import` with the same Bearer header and no body. Disable the import button while the
request runs. Show `409` as “an import is already running”; show a generic retry/configuration message for
`503`. The endpoint waits for source validation, transaction, DB validation, and keyword smoke tests.

## Fetch helper expectations

- Treat every non-2xx response as an error before parsing a success schema.
- Validate major payloads with `ProductListResponseSchema`, `ProductDetailSchema`, or
  `SearchResponseSchema` from `@reeco/shared` during integration/development.
- Do not call Supabase database tables from React and never add service-role/database credentials to
  a `REACT_APP_*` variable.
- Public product/search calls do not need a token. `/orders`, `/notifications`,
  `POST /payments/vnpay/create-url`, and `/admin/*` calls attach the Supabase access token.

The complete HTTP contract, examples, and error codes are in [`api-contract.md`](./api-contract.md).

## Local run

Use Node.js 22 or newer (verified with Node.js 24). Copy `apps/api/.env.example` to `apps/api/.env`, fill server-only values, and run:

```powershell
npm install
npm run build:shared
npm run dev:api
```

In another shell:

```powershell
npm run dev:client
npm run dev:admin
```

The embedding defaults are `EMBEDDING_PROVIDER=ollama`,
`OLLAMA_BASE_URL=http://127.0.0.1:11434`, `EMBEDDING_MODEL=qwen3-embedding:4b`, 1536 dimensions,
version `ollama-qwen3-embedding-4b-1536-v1`, 180-second timeout, and batch size 8. These values are
server-only and must not be exposed through `REACT_APP_*` variables. A cold local model load can take
significant time.

Before handoff or deployment run:

```powershell
npm run lint
npm run build:shared
npm run build:api
```
