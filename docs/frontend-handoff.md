# Frontend Handoff — Backend Contract

Step 7.7 froze the product/search contract; orders, VNPay, notifications, admin product editing and
admin authorization were added afterwards and are included below. There is still no compare endpoint
and no product create/delete endpoint. Product and commerce data must always flow through the NestJS
API; the browser must not query the database or Ollama directly (the only direct browser call is the
Supabase Auth password sign-in).

## Local Setup

Prerequisites:

- Node.js 22 or newer (verified with Node.js 24) and npm 10 or newer.
- Ollama with the `qwen3-embedding:4b` model.
- A configured Supabase project and the backend values described by `apps/api/.env.example`.

Install once and create local environment files:

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/client/.env.example apps/client/.env
cp apps/admin/.env.example apps/admin/.env
ollama list
ollama pull qwen3-embedding:4b
```

On PowerShell, use `Copy-Item` instead of `cp` if preferred. `ollama pull` is needed only when the model
is missing. Start `ollama serve` only when Ollama is not already running, then use separate terminals:

```bash
npm run dev:api
npm run dev:client
npm run dev:admin
```

The defaults are API `http://localhost:3000/api/v1`, client `http://localhost:5173`, and admin
`http://localhost:5174`.

## Frontend Environment Contract

```dotenv
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_SUPABASE_URL=https://<project>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<public anon key>
# client only: serve /search from local fixtures instead of the API
REACT_APP_SEARCH_MOCK=false
```

Both CRA frontends use `REACT_APP_API_URL` and sign in with a Supabase email/password grant using the
public anon key. The client login maps the demo usernames to their emails (`apps/client/src/services/authService.js`);
the admin app has its own login screen and only accepts users whose `app_metadata.role` is `admin`.
The token is then sent as `Authorization: Bearer <token>`. Demo passwords and the admin "quick login"
button exist only in development builds; production builds (`npm run build`) also skip source maps via
each app's `.env.production`.

Never put `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, Ollama configuration, or any backend secret in a
`REACT_APP_` variable. All product access remains through NestJS.

## CORS

The API reads a comma-separated `CORS_ORIGIN` allowlist. The example environment allows
`http://localhost:5173,http://localhost:5174`; the code fallback is client-only `http://localhost:5173`.
It allows credentials, headers `Authorization` and `Content-Type`, and methods
`GET`, `POST`, `PATCH`, `PUT`, `DELETE`, and `OPTIONS`. It does not use wildcard origin.

## Endpoint Surface

| Method | Path                                                             | Auth          | Success | Expected errors                   |
| ------ | ---------------------------------------------------------------- | ------------- | ------- | --------------------------------- |
| GET    | `/health`                                                        | none          | `200`   | `500` process failure             |
| GET    | `/products`                                                      | none          | `200`   | `400`, `503`                      |
| GET    | `/products/:productId`                                           | none          | `200`   | `404`, `503`                      |
| POST   | `/search`                                                        | none          | `200`   | `400`, `429`, `503`               |
| POST   | `/orders`                                                        | Bearer        | `201`   | `400`, `401`, `503`               |
| GET    | `/orders/me`                                                     | Bearer        | `200`   | `401`, `503`                      |
| GET    | `/orders/:orderId`                                               | Bearer        | `200`   | `401`, `404`                      |
| POST   | `/orders/:orderId/cancel`                                        | Bearer        | `200`   | `400`, `401`, `404`, `409`        |
| POST   | `/payments/vnpay/create-url`                                     | Bearer        | `200`   | `400`, `401`, `404`, `409`        |
| GET    | `/payments/vnpay/verify`                                         | none          | `200`   | `400`, `404`                      |
| GET    | `/payments/vnpay/ipn`                                            | none          | `200`   | (VNPay `RspCode` in body)         |
| GET    | `/notifications/me`                                              | Bearer        | `200`   | `401`, `503`                      |
| PATCH  | `/notifications/:id/read`                                        | Bearer        | `200`   | `400`, `401`, `404`               |
| POST   | `/notifications/read-all`                                        | Bearer        | `200`   | `401`, `503`                      |
| GET    | `/admin/products`                                                | Bearer, admin | `200`   | `400`, `401`, `403`, `503`        |
| GET    | `/admin/products/:productId`                                     | Bearer, admin | `200`   | `401`, `403`, `404`, `503`        |
| PATCH  | `/admin/products/:productId`                                     | Bearer, admin | `200`   | `400`, `401`, `403`, `404`, `503` |
| POST   | `/admin/import`                                                  | Bearer, admin | `201`   | `401`, `403`, `409`, `503`        |
| GET    | `/admin/orders`, `/admin/orders/stats`, `/admin/orders/:orderId` | Bearer, admin | `200`   | `401`, `403`, `404`, `503`        |
| PATCH  | `/admin/orders/:orderId/status`                                  | Bearer, admin | `200`   | `400`, `401`, `403`, `404`, `409` |

There is no `DELETE` route and no compare endpoint. Request/response details for every route are in
[`api-contract.md`](./api-contract.md).

## Search Contract

Request:

```json
{ "query": "CS655 SDI-12", "limit": 10 }
```

- `query`: trimmed, 1–500 characters, required.
- `limit`: integer 1–100, optional, default `10`; it is the final maximum result count.
- `explain`: optional boolean; the client sends `true` to receive `results[].explanation`.
- `context`: optional `{ base_query, previous_query, product_ids (1–5) }` for follow-up refinements.
- Extra body fields are rejected.
- Rate limit: `SEARCH_RATE_LIMIT_PER_MINUTE` per client IP (default 60); over it the API returns `429`
  with `Retry-After`. Show a "wait a moment" state rather than retrying immediately.

Response:

```json
{
  "query": "CS655",
  "mode": "hybrid",
  "results": [
    {
      "product_id": "CSI_CS655",
      "model": "CS655",
      "name_en": "12cm Water Content Reflectometer Plus (-50 to +70C)**",
      "name_vi": null,
      "category": "Sensors",
      "device_type": "Soil Moisture, Temperature, and EC Sensor",
      "image_url": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4883",
      "matched_features": ["identity:model:CS655"],
      "scores": {
        "keyword": 0.166667,
        "semantic": null,
        "hybrid": 0.01639344262295082,
        "rerank": null
      }
    }
  ]
}
```

Render results in the returned order. Do not re-sort them by a score:

- `mode` describes the retrieval path, not quality: `hybrid` means both sources succeeded, `keyword`
  means semantic failed and keyword succeeded, and `semantic` means the reverse.
- An empty successful source is still a success. A valid no-match search returns `200` with
  `results: []`.
- `keyword` is the raw keyword score or `0`; `semantic` is cosine similarity or `null`; `hybrid` is
  the original RRF score or `null`; `rerank` remains `null` because BGE logits stay internal.
- These score fields have different scales. They are diagnostic contract fields, not percentages or a
  user-facing relevance grade.
- Technical ranking may change final order without rewriting `scores.hybrid`.
- `matched_features` contains positive, structured evidence only. Examples include
  `identity:model:CS655`, `protocol:SDI-12`, `operating-temperature:-40°C`, and
  `measurement-temperature:up-to-70°C`. The array is not a complete explanation; unknown, missing,
  negative, or semantic-only evidence is omitted.

Optional response fields (see [`api-contract.md`](./api-contract.md#post-search)):
`resolved_query`, `context_applied`, `results[].explanation` (`text`, `language`, `source` `rule|llm`,
`generation`, `evidence`), and `guidance` (`text`, `language`, `needs_clarification`, `components`).
The client renders `guidance` as the answer above the results and, when it is absent, summarises the
returned explanations itself (`apps/client/src/components/search/SearchResults.js`).

If Ollama is unavailable but keyword search works, show the normal results returned with mode
`keyword`; this is not an error. If both retrieval paths fail, the API returns sanitized `503`. For a
successful empty list, show a no-results state. For `400`, surface the input error; for `503`, provide a
retry state without exposing raw backend details.

Schema-valid examples live in [`examples/`](./examples/README.md).

## Product List Contract

`GET /products` accepts `page` (default `1`), `limit` (default `20`, maximum `100`), and optional
trimmed `q`, `category`, `subcategory`, and `device_type` filters (maximum 200 characters each). Unknown
query fields are rejected. Public results contain active products only.

The response is `{ items, pagination }`; pagination includes `page`, `limit`, `total`, and
`total_pages`. Use `product_id` for detail links. A schema-valid sample is
[`product-list-response.json`](./examples/product-list-response.json).

## Product Detail and Comparison

`GET /products/:productId` accepts a canonical `product_id` or an exact model. It returns `product`,
`taxonomy`, `measurements`, `applications`, `capabilities`, `supported_protocols`,
`unsupported_protocols`, `specifications`, `important_specifications`, `aliases`, and `media`. Missing
or inactive public products return `404`.

There is no compare endpoint. Fetch two details in parallel and align rows by `canonical_key`:

```ts
const [left, right] = await Promise.all([
  fetch(`${apiUrl}/products/${leftId}`)
    .then(assertOk)
    .then((r) => r.json()),
  fetch(`${apiUrl}/products/${rightId}`)
    .then(assertOk)
    .then((r) => r.json()),
]);
```

Use `important_specifications` for the compact view and `specifications` for the expanded view. The
union of both products' canonical keys defines the rows; render a missing side as unavailable, never as
zero or false.

## Admin Contract and Security Boundary

The login page obtains a Supabase Auth access token. Send it as
`Authorization: Bearer <access-token>` to every `/admin/*` request. The API validates that token with
Supabase Auth (`SupabaseAuthGuard`): missing, malformed, expired, or invalid tokens return `401`. It then
requires `app_metadata.role === "admin"` (`AdminGuard`); any other authenticated user receives `403`.
`app_metadata` is set only with the service role (the demo admin is created by
`scripts/demo/seed-demo.mjs`).

The admin app can list/filter products, inspect and edit product detail (`PATCH
/admin/products/:productId` — a strict whitelist of editor fields, `400` for anything else), trigger
import, and manage orders (list, stats, detail, status transitions). Import returns `201` on success,
`409` if another import is running, and `503` when required backend configuration, database, or the
import process is unavailable. There is no product create/delete endpoint and no user-management API:
the admin "Users" screen is local mock data (`apps/admin/src/services/adminUserService.js`).

## Error Handling

Validation errors use:

```json
{
  "message": "Request validation failed",
  "errors": [
    { "path": "limit", "message": "Number must be less than or equal to 100" }
  ]
}
```

Other expected errors use NestJS' `{ statusCode, message, error }` shape. Handle by HTTP status rather
than matching exact text. `500` remains the catch-all for an unexpected server failure. No error should
contain service-role keys, database credentials, raw SQL/database errors, or stack traces.

## Current Frontends

- `apps/client` (CRA, port 5173): home search, AI search results with guidance and explanations,
  product catalog and detail, client-side two-product compare, cart and favorites (browser storage
  only), checkout (COD or VNPay), order success / VNPay return, account dashboard, orders, order detail
  (cancel, pay again), notifications, profile, and an in-client admin orders page. Navigation is a page
  state machine in `App.js`, not a URL router.
- `apps/admin` (CRA, port 5174): login, dashboard, products (list/detail/edit), import, orders,
  reports, and a mock-only users screen.

Prices shown before checkout come from a client-side table (`commercialService.js`); the order total is
always recomputed on the server from `product_prices`.

## MVP Readiness and Limits

Ready for frontend integration: public browse/detail/search, deterministic technical ordering,
keyword fallback, grounded explanations and guidance, orders with COD/VNPay sandbox, notifications,
admin-role-protected admin routes, and sanitized expected errors. The product master currently holds
89 active products with no blocking validation errors (`data/reports/product-master-report.json`).

Not production-complete: local semantic search and LLM wording depend on Ollama; Celsius-only technical
temperature parsing and a reviewed protocol/key subset are intentional v1 limits; there is no fuzzy
typo correction, compare endpoint, or product create/delete API; the search rate limit is per API
process; tokens are kept in browser storage with no refresh flow. The optional protected Top-5
cross-encoder is backend-only (`RERANKER_ENABLED`, off by default) and does not change the response
schema.

Use [`api-contract.md`](./api-contract.md) as the detailed endpoint reference. The Zod schemas in
`@reeco/shared` define the search and product contract; the CRA frontends are plain JavaScript and do
not import them.
