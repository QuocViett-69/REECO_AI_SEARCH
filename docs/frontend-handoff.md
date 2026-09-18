# Frontend Handoff — Frozen Backend MVP

Step 7.7 freezes the backend MVP contract documented here. Frontend work may consume this surface,
but should not assume unimplemented CRUD, comparison, reranking, or explanation features. Product data
must always flow through the NestJS API; the browser must not query the database or Ollama directly.

## Local Setup

Prerequisites:

- Node.js 22 or newer (verified with Node.js 24) and npm 10 or newer.
- Ollama with the `qwen3-embedding:4b` model.
- A configured Supabase project and the backend values described by `apps/api/.env.example`.

Install once and create local environment files:

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
ollama list
ollama pull qwen3-embedding:4b
```

On PowerShell, use `Copy-Item` instead of `cp` if preferred. `ollama pull` is needed only when the model
is missing. Start `ollama serve` only when Ollama is not already running, then use separate terminals:

```bash
npm run dev:api
npm run dev:web
```

The defaults are API `http://localhost:3000/api/v1` and web `http://localhost:5173`.

## Frontend Environment Contract

```dotenv
VITE_API_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Public browse, detail, and search need only `VITE_API_URL`. The two Supabase public values are needed
for the existing admin login/session flow. They are browser-safe public configuration; authorization
still depends on the access token.

Never put `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, Ollama configuration, or any backend secret in a
`VITE_` variable. The browser may contact Supabase Auth for sign-in, but all product access remains
through NestJS.

## CORS

The API reads a comma-separated `CORS_ORIGIN` allowlist and defaults to
`http://localhost:5173`. It allows credentials, headers `Authorization` and `Content-Type`, and methods
`GET`, `POST`, and `OPTIONS`. It does not use wildcard origin. A live preflight from the default Vite
origin was verified during Step 7.7 and returned `204` with the expected headers.

## Frozen Endpoint Surface

| Method | Path                         | Auth   | Success | Expected errors       |
| ------ | ---------------------------- | ------ | ------- | --------------------- |
| GET    | `/health`                    | none   | `200`   | `500` process failure |
| GET    | `/products`                  | none   | `200`   | `400`, `503`          |
| GET    | `/products/:productId`       | none   | `200`   | `404`, `503`          |
| POST   | `/search`                    | none   | `200`   | `400`, `503`          |
| GET    | `/admin/products`            | Bearer | `200`   | `400`, `401`, `503`   |
| GET    | `/admin/products/:productId` | Bearer | `200`   | `401`, `404`, `503`   |
| POST   | `/admin/import`              | Bearer | `201`   | `401`, `409`, `503`   |

There are no `PUT`, `PATCH`, `DELETE`, or compare endpoints in this MVP.

## Search Contract

Request:

```json
{ "query": "CS655 SDI-12", "limit": 10 }
```

- `query`: trimmed, 1–500 characters, required.
- `limit`: integer 1–100, optional, default `10`; it is the final maximum result count.
- Extra body fields are rejected.

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
  the original RRF score or `null`; `rerank` is currently always `null`.
- These score fields have different scales. They are diagnostic contract fields, not percentages or a
  user-facing relevance grade.
- Technical ranking may change final order without rewriting `scores.hybrid`.
- `matched_features` contains positive, structured evidence only. Examples include
  `identity:model:CS655`, `protocol:SDI-12`, `operating-temperature:-40°C`, and
  `measurement-temperature:up-to-70°C`. The array is not a complete explanation; unknown, missing,
  negative, or semantic-only evidence is omitted.

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
Supabase Auth. Missing, malformed, expired, or invalid tokens return `401`.

Important pre-production security TODO: the current guard authenticates a valid Supabase user but does
not enforce an admin role, allowlist, or authorization claim. Consequently, `403` is not currently
emitted. Harden authorization before production or before inviting non-admin users.

The admin MVP can list/filter products, inspect detail, and trigger import. Import returns `201` on
success, `409` if another import is running, and `503` when required backend configuration, database,
or the import process is unavailable. There is no product create/edit/delete endpoint, so the frontend
must not present those actions as working.

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

## Suggested Frontend Pages

The current React routes are scaffolding: `/` and `/products/:id` are placeholders, `/login` has the
Supabase email/password flow, and the protected admin pages are placeholders. A future implementation
can build:

- Search/results with query, loading, empty, degraded keyword, validation, and retry states.
- Product detail using the complete detail sections.
- Client-side two-product comparison using parallel detail requests.
- Admin list/detail and import status, without edit/delete controls.

This is documentation only; Step 7.7 does not implement or redesign UI.

## MVP Readiness and Limits

Ready for frontend integration: public browse/detail/search, deterministic technical ordering,
keyword fallback, empty-result behavior, shared schemas, authenticated admin read/import routes, and
sanitized expected errors. The hosted searchable catalog currently has 42 active products with current
embeddings.

Not production-complete: eight known source-data validation blockers remain; admin role authorization
is not hardened; local semantic search depends on Ollama; Celsius-only technical temperature parsing
and a reviewed protocol/key subset are intentional v1 limits; there is no fuzzy typo correction,
AI/cross-encoder reranker, generated explanation, compare endpoint, or product mutation API.

Use [`api-contract.md`](./api-contract.md) as the detailed endpoint reference and import shared Zod
schemas/types from `@reeco/shared` wherever practical.
