# Basic Backend Handoff for React

The React application should use `VITE_API_URL=http://localhost:3000/api/v1` and import response/request
types plus Zod schemas from `@reeco/shared`. Product data must come through NestJS; the browser never
receives `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL`.

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

Call `POST /search` with `{ "query": string, "limit"?: number }`. Render `results` in returned order.
`mode` is currently `keyword`. Read score values by name and tolerate `null`: future semantic, hybrid, and
rerank phases will populate existing slots rather than replace the response shape. `matched_features` is
currently empty.

The backend contains a server-only local Ollama embedding provider, but it is not connected to this
endpoint. Backend startup performs no Ollama request, so keyword search continues to run when Ollama is
offline, the model is unloaded, or the model has not been pulled. The semantic database migration also
has not been deployed to hosted Supabase and hosted embeddings have not been generated.

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

Obtain the Supabase Auth access token from the existing browser session and call `GET /admin/products`
with `Authorization: Bearer <access-token>`. It uses the same filters/response wrapper as the public list,
but includes active and review products. Call `GET /admin/products/:productId` for admin detail.

The current backend validates a Supabase user token but the project has no separate admin-role claim or
allowlist. Until that authorization model is added, do not provision ordinary non-admin Supabase users.

## Admin Import

Call `POST /admin/import` with the same Bearer header and no body. Disable the import button while the
request runs. Show `409` as “an import is already running”; show a generic retry/configuration message for
`503`. The endpoint waits for source validation, transaction, DB validation, and keyword smoke tests.

## Fetch helper expectations

- Treat every non-2xx response as an error before parsing a success schema.
- Validate major payloads with `ProductListResponseSchema`, `ProductDetailSchema`, or
  `SearchResponseSchema` from `@reeco/shared` during integration/development.
- Do not call Supabase database tables from React and never add service-role/database credentials to
  a `VITE_*` variable.
- Public pages do not need a token. Only `/admin/*` API calls attach the Supabase access token.

The complete HTTP contract, examples, and error codes are in [`api-contract.md`](./api-contract.md).

## Local run

Use Node.js 24 or newer. Copy `apps/api/.env.example` to `apps/api/.env`, fill server-only values, and run:

```powershell
npm install
npm run build:shared
npm run dev:api
```

In another shell:

```powershell
npm run dev:web
```

The embedding defaults are `EMBEDDING_PROVIDER=ollama`,
`OLLAMA_BASE_URL=http://127.0.0.1:11434`, `EMBEDDING_MODEL=qwen3-embedding:4b`, 1536 dimensions,
version `ollama-qwen3-embedding-4b-1536-v1`, 180-second timeout, and batch size 8. These values are
server-only and must not be exposed through `VITE_*` variables. A cold local model load can take
significant time.

Before handoff or deployment run:

```powershell
npm run lint
npm run build:shared
npm run build:api
```
