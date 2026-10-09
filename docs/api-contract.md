# REECO Backend API Contract

The product and search behavior below was frozen for the Step 7.7 backend MVP; the commerce
endpoints (orders, VNPay, notifications) and the admin authorization rules were added afterwards and
are documented here from the current code. Frontend setup, UI guidance, and schema-valid JSON fixtures
are linked from [`frontend-handoff.md`](./frontend-handoff.md).

Base URL for local development: `http://localhost:3000/api/v1`.

Requests and responses use JSON. Public product and search endpoints expose only
`status = active`. Authenticated endpoints require `Authorization: Bearer <supabase-access-token>`;
the API verifies the token with Supabase Auth on every request (`SupabaseAuthGuard`).

Every `/admin/*` route additionally requires the admin role (`AdminGuard`,
`apps/api/src/auth/admin.guard.ts`): the verified user's `app_metadata.role` must be `"admin"`.
`app_metadata` can only be set with the service role (for the demo accounts, by
`scripts/demo/seed-demo.mjs`); `user_metadata` never grants admin.

## Errors

NestJS returns an HTTP status code with a JSON error. Validation errors include field-level details:

```json
{
  "message": "Request validation failed",
  "errors": [
    { "path": "limit", "message": "Number must be less than or equal to 100" }
  ]
}
```

Other common errors use this shape:

```json
{
  "statusCode": 404,
  "message": "Product was not found",
  "error": "Not Found"
}
```

The API uses:

| Status | Meaning                                                                                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | Invalid query/body (Zod validation), or an unsupported search negation                                                                                                     |
| `401`  | Missing, malformed, expired, or invalid Bearer token                                                                                                                       |
| `403`  | Authenticated but not an admin on an `/admin/*` route (`AdminGuard`); also every non-GET `/admin/*` request when `LOCAL_STAGING_READ_ONLY=true`                            |
| `404`  | Missing or non-public product; an order or notification that does not exist or belongs to someone else                                                                     |
| `409`  | Import already in progress; an order that can no longer be cancelled; an invalid admin status transition; a VNPay link requested for an order that is not awaiting payment |
| `429`  | `POST /search` rate limit exceeded (see below)                                                                                                                             |
| `503`  | Missing backend configuration, or an unavailable database/retrieval/import process                                                                                         |

Server errors never include Supabase keys, database credentials, or raw database error details
(order creation failures return a fixed message and log the database error server-side).
Unexpected server failures use `500`.

## GET /health

Returns 200 with status: "ok", check: "liveness" and configured embedding model, dimensions, version and query timeout.
This only confirms that the API process is responding. Use npm run embeddings:validate and npm run demo:smoke to verify the actual database, models and search behavior.

## GET `/products`

- Auth: none.
- Success: `200 OK`.
- Request body: none.
- Only active products are returned.

Query parameters:

| Parameter     | Type             | Default | Notes                                 |
| ------------- | ---------------- | ------- | ------------------------------------- |
| `page`        | positive integer | `1`     | Page number                           |
| `limit`       | integer 1–100    | `20`    | Items per page                        |
| `q`           | string           | omitted | Case-insensitive model/name substring |
| `category`    | string           | omitted | Exact category filter                 |
| `subcategory` | string           | omitted | Exact subcategory filter              |
| `device_type` | string           | omitted | Exact device-type filter              |

Example: `GET /products?page=1&limit=20&q=CS655&category=Sensors`

```json
{
  "items": [
    {
      "product_id": "CSI_CS655",
      "model": "CS655",
      "name_en": "12cm Water Content Reflectometer Plus (-50 to +70C)**",
      "name_vi": null,
      "category": "Sensors",
      "subcategory": "Soil Moisture, Temperature, and EC Sensors",
      "device_type": "Soil Moisture, Temperature, and EC Sensor",
      "image_url": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4883",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

Errors: `400` for invalid query parameters and `503` when Supabase is not configured/unavailable.

## GET `/products/:productId`

- Auth: none.
- Path parameter: canonical `product_id`; an exact model such as `CS655` is also accepted.
- Query parameters: none.
- Request body: none.
- Success: `200 OK`; only active products are visible.

```json
{
  "product": {
    "product_id": "CSI_CS655",
    "model": "CS655",
    "name_en": "12cm Water Content Reflectometer Plus (-50 to +70C)**",
    "name_vi": null,
    "category": "Sensors",
    "subcategory": "Soil Moisture, Temperature, and EC Sensors",
    "device_type": "Soil Moisture, Temperature, and EC Sensor",
    "image_url": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4883",
    "status": "active"
  },
  "taxonomy": {
    "category": "Sensors",
    "category_key": "sensors",
    "subcategory": "Soil Moisture, Temperature, and EC Sensors",
    "subcategory_key": "soil_moisture_temperature_and_ec_sensors",
    "device_type": "Soil Moisture, Temperature, and EC Sensor",
    "device_type_key": "soil_moisture_temperature_and_ec_sensor"
  },
  "measurements": [
    {
      "key": "soil_temperature",
      "label_en": "Soil Temperature",
      "label_vi": "Nhiệt độ đất"
    }
  ],
  "applications": [],
  "capabilities": [
    {
      "key": "measure_soil_temperature",
      "label_en": "Measure Soil Temperature",
      "label_vi": "Đo nhiệt độ đất"
    }
  ],
  "supported_protocols": ["RS-232", "SDI-12"],
  "unsupported_protocols": [],
  "specifications": [
    {
      "specification_id": 1,
      "canonical_key": "operating_temperature_range",
      "quantity_kind": "temperature",
      "normalized_value": {
        "type": "range",
        "min_value": -50,
        "max_value": 70,
        "unit": "°C",
        "qualifier": null
      },
      "raw_ref": {
        "file": "data/raw/CS616_CS650_CS655.json",
        "product_index": 2,
        "spec_index": 7,
        "source_rows": [12]
      }
    }
  ],
  "important_specifications": [
    {
      "canonical_key": "operating_temperature_range",
      "name": "Operating Temperature Range",
      "quantity_kind": "temperature",
      "normalized_value": {
        "type": "range",
        "min_value": -50,
        "max_value": 70,
        "unit": "°C",
        "qualifier": null
      },
      "raw_ref": {
        "file": "data/raw/CS616_CS650_CS655.json",
        "product_index": 2,
        "spec_index": 7,
        "source_rows": [12]
      }
    }
  ],
  "aliases": ["CS655", "CSI_CS655"],
  "media": [
    {
      "media_id": 1,
      "media_type": "primary",
      "image_url": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4883",
      "product_url": "https://www.campbellsci.com/products/cs655",
      "position": 0,
      "metadata": {}
    }
  ]
}
```

Errors: `404` when the product does not exist or is not active; `503` when Supabase is unavailable.

## POST `/search`

- Auth: none.
- Query parameters: none.
- Success: `200 OK`.
- Retrieval: keyword FTS and semantic vector search fused with Reciprocal Rank Fusion (RRF).
- Only active/searchable products are returned.

Request:

```json
{
  "query": "soil moisture",
  "limit": 10,
  "explain": true
}
```

| Field     | Type          | Notes                                                                                                                                                                                      |
| --------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `query`   | string 1–500  | Required, trimmed                                                                                                                                                                          |
| `limit`   | integer 1–100 | Optional, default `10`; final maximum result count                                                                                                                                         |
| `explain` | boolean       | Optional; when `true` each result may carry an `explanation`                                                                                                                               |
| `context` | object        | Optional follow-up context: `{ base_query, previous_query, product_ids }` (`product_ids`: 1–5 ids from earlier results). The client sends it for refinements such as "and supports Modbus" |

Unknown body fields are rejected (`400`).

**Rate limit.** `POST /search` is limited per client IP to `SEARCH_RATE_LIMIT_PER_MINUTE` requests per
minute (default `60`; `0` disables it). Responses carry `RateLimit-Limit` and `RateLimit-Remaining`;
over the limit the API answers `429` with a `Retry-After` header (seconds) and
`{ "message": "Too many searches. Please wait a moment and try again." }`. The limit is kept in process
memory (`apps/api/src/common/middleware/rate-limit.middleware.ts`), so it applies per API instance.

Response:

```json
{
  "query": "soil moisture",
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
      "matched_features": [],
      "scores": {
        "keyword": 0.1935484,
        "semantic": 0.8123,
        "hybrid": 0.0325224749,
        "rerank": null
      }
    }
  ]
}
```

Optional response fields:

- `resolved_query`: the query actually searched after follow-up resolution (for example, a short
  refinement appended to the previous query).
- `context_applied`: `true` when the request `context` was used and results were limited to its
  `product_ids`.
- `results[].explanation` (only when `explain: true`):

  ```json
  {
    "text": "SoilVue10-5: dữ liệu xác nhận độ ẩm đất.",
    "language": "vi",
    "source": "rule",
    "generation": { "status": "disabled" },
    "evidence": [
      {
        "source": "product_document",
        "field": "measurements",
        "value": "soil moisture / độ ẩm đất"
      }
    ]
  }
  ```

  `text` is always built from product evidence by rules. When `LLM_EXPLANATION_ENABLED=true` and
  `LLM_MODEL` is set, a local Ollama model may pick one of up to three prepared wordings for the first
  three results; it never writes new claims. `source` is then `llm` and `generation.status` is
  `accepted` (with `model` and `latency_ms`); otherwise `source` is `rule` and `generation.status` is
  one of `disabled`, `not_applicable`, `timeout`, `unavailable`, `invalid_response`. `evidence[].source`
  is `products`, `product_document`, or `normalized_spec`.

- `guidance`: an overall answer for the request, present only in specific cases — a multi-instrument
  system request (split into components such as sensor / data logger / communication / power), a
  follow-up explanation question about selected products, a request with no product confirming all
  requirements, or a comparison question:

  ```json
  {
    "text": "Nhu cầu này cần phối hợp các thành phần bên dưới. ...",
    "language": "vi",
    "needs_clarification": false,
    "components": [
      {
        "label": "độ ẩm đất",
        "query": "soil moisture sensor",
        "models": ["SoilVue10-5", "CS650"]
      },
      {
        "label": "Truyền dữ liệu",
        "query": "communication equipment",
        "models": []
      }
    ]
  }
  ```

  An empty `models` array means no confirmed candidate was found for that component;
  `needs_clarification` asks the user to specify a measurement or medium.

Public `mode` is one of `hybrid`, `keyword`, or `semantic` and describes the retrieval path, not a
quality judgment:

- `hybrid`: both keyword and semantic retrieval executed successfully, including when either source
  returned zero candidates.
- `keyword`: semantic retrieval was unavailable and keyword fallback succeeded.
- `semantic`: keyword retrieval was unavailable and semantic fallback succeeded.

Internal fallback names are never exposed. In hybrid mode, `scores.keyword` is the raw keyword score
or `0` when the candidate came only from semantic retrieval, `scores.semantic` is cosine similarity or
`null`, and `scores.hybrid` is the RRF score. In keyword fallback, only `scores.keyword` is populated.
In semantic fallback, `scores.keyword` is `0` and only `scores.semantic` is populated. These fields use
different scales and must not be compared directly. `scores.hybrid` remains the original RRF retrieval
score after technical ordering and therefore technical-query results are not guaranteed to be globally
sorted by it. `scores.rerank` remains `null` even when the optional reranker runs.

When `RERANKER_ENABLED=true` (default `false`), the top results (at most 5) are reordered by the local
BGE reranker service (`services/reranker`); an exact identity match stays first and any reranker
failure or timeout keeps the original order.

After retrieval, the server applies a deterministic structured technical policy. A retrieved exact
active identity ranks first. Confirmed protocol matches rank before candidates without confirmed
protocol evidence, but protocol unknowns are retained. For high-confidence Celsius operating or
measurement constraints, `MATCH` ranks before `UNKNOWN`, definitive `MISMATCH` is filtered, and
`UNKNOWN` is retained. No product is injected outside the retrieval union and no arbitrary numeric
boost is added. `matched_features` uses the existing string-array field and contains positive evidence
only, for example `identity:model:CS655`, `protocol:SDI-12`,
`operating-temperature:-40°C`, or `measurement-temperature:up-to-70°C`.

The request `limit` controls final results. The server retrieves at least
`max(SEARCH_RETRIEVAL_LIMIT, request.limit)`, clamped to 1–100, performs technical evaluation and
filtering before the final limit, batch-loads active product summaries, drops any candidate without an
active public summary, and only then applies the final request limit. Definitive numeric mismatches are
not backfilled merely to reach the limit. Errors: `400` for an invalid body and `503` only when both
retrieval sources fail or required product data is unavailable. A successful single-source fallback
returns `200`. A query with an unsupported negation (anything other than excluding a protocol, cellular,
or temperature sensors) returns `400`.

## GET `/admin/products`

- Auth: Bearer token of an admin user (`401` without a valid token, `403` for non-admins).
- Query parameters: the same `page`, `limit`, `q`, `category`, `subcategory`, and `device_type`
  parameters as public `GET /products`.
- Request body: none.
- Success: `200 OK`, with the same `items` + `pagination` response contract.
- Difference from public list: returns both `active` and `review` rows.

Sample review item:

```json
{
  "product_id": "CSI_43347",
  "model": "43347",
  "name_en": "RM Young 1K RTD Temperature Sensor (-50 to +50C) Half Bridge/VX 4-Wire Resistance/IX Uncalibrated Calibrated",
  "name_vi": null,
  "category": "Sensors",
  "subcategory": "Air Temperature Sensors",
  "device_type": "Air Temperature Sensor",
  "image_url": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/10",
  "status": "review"
}
```

Errors: `401` for missing/invalid token, `403` for non-admins, `400` for invalid filters, and `503`
for Supabase failure.

## GET `/admin/products/:productId`

- Auth: Bearer token of an admin user.
- Path/query/body: same as public product detail.
- Success: `200 OK` with the `ProductDetail` contract plus `price_vnd` (integer VND from
  `product_prices`, or `null` when no price is stored). Unlike `product.price`, it is returned even when
  the product is not purchasable (for example a review product).
- Difference from public detail: active and review rows are visible. Review products currently have
  no search document or normalized-spec rows, so `taxonomy` is `null` and semantic/spec arrays are empty.

Errors: `401`, `403`, `404`, or `503` as described above.

## PATCH /admin/products/:productId

- Demo catalog is frozen. Only { "price_vnd": <integer 0-100,000,000,000> } is accepted.
- Auth: admin Bearer token. Strict validation rejects catalog fields with 400.
- Effect and response: same as the dedicated price endpoint below.
- Names, taxonomy, protocols, media and specifications must be updated through the offline data pipeline, followed by embedding backfill.

## PUT `/admin/products/:productId/price`

- Auth: Bearer token of an admin user.
- Body: `{ "price_vnd": <integer 0–100,000,000,000> }`, strict (any other key → `400`).
- Effect: upserts the row in `product_prices` keyed by `product_id` (the path accepts the product id or
  model). A product is purchasable only when it is `active` and `price_vnd > 0`.
- Success: `200 OK` with the product in the `GET /admin/products/:productId` shape (includes `price_vnd`).

Errors: `400`, `401`, `403`, `404`, `503` (database write failed).

## POST /admin/import

- Demo catalog is frozen: this endpoint always returns 403 after authentication.
- Missing or invalid tokens return 401. No import process or database write is started.
- Use the offline import and embedding-backfill pipeline before the demo.

## Orders

All `/orders` routes require a Bearer token (any authenticated user is a customer). Bodies are
validated with Zod schemas in `apps/api/src/modules/orders/dto/create-order.dto.ts`; invalid bodies
return `400` with the standard validation error. Unknown keys are stripped, so a client cannot set
totals, prices, status, or the owner.

An order object is the `orders` row (`id` uuid, `order_number`, `order_code` such as `REECO-1001`,
`customer_id`, `status`, `payment_method`, `payment_status`, `shipping_method`, `shipping_fee`,
`subtotal`, `total`, `currency` `VND`, customer and address fields, `notes`,
`estimated_delivery_from`/`_to`, `vnpay_txn_ref`, `vnpay_transaction_no`, `paid_at`, timestamps) with
its `order_items` (`product_id`, `model`, `product_name`, `image_url`, `unit_price`, `quantity`,
`line_total`). All amounts are integer VND.

Order statuses (`orders.constants.ts`): `PENDING_PAYMENT`, `PAID`, `PROCESSING`,
`FORWARDED_TO_MANUFACTURER`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `PAYMENT_FAILED`. Payment statuses:
`PENDING_PAYMENT`, `COD_PENDING`, `PAID`, `FAILED`.

### POST `/orders`

- Success: `201 Created` with the order and `items`.

| Field                                         | Type                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `items`                                       | 1–50 × `{ product_id, quantity (integer 1–999) }`; duplicates are merged                    |
| `payment_method`                              | `cod` or `vnpay` (required)                                                                 |
| `shipping_method`                             | `standard` (250,000 VND, 3–5 days) or `express` (500,000 VND, 1–2 days); default `standard` |
| `customer_name`                               | string 1–120                                                                                |
| `customer_email`                              | email                                                                                       |
| `customer_phone`                              | 6–20 characters of digits, spaces, `+ ( ) . -`                                              |
| `shipping_address`                            | string 1–500                                                                                |
| `city`                                        | string 1–120                                                                                |
| `province`, `country`, `postal_code`, `notes` | optional strings (`country` defaults to `Vietnam`)                                          |

Prices come from the `product_prices` table on the server; every product must be active and priced
(`400` otherwise). `total = subtotal + shipping_fee`. COD orders start as `PROCESSING` /
`COD_PENDING`; VNPay orders start as `PENDING_PAYMENT` / `PENDING_PAYMENT`. A status-history row and an
`ORDER_CREATED` notification are recorded.

### GET `/orders/me?page=&page_size=`

Returns `{ items, total }` — the caller's orders with `order_items`, newest first. `page_size` defaults
to 20, maximum 100.

### GET `/orders/:orderId`

`orderId` may be the uuid, the `order_number` (`1001`) or the `order_code` (`REECO-1001`). Returns the
order for its owner or an admin; anyone else gets `404`.

### POST `/orders/:orderId/cancel`

Body: `{ "reason"?: string ≤500 }`. Allowed only from `PENDING_PAYMENT`, `PAYMENT_FAILED`, `PAID`, or
`PROCESSING`; otherwise `409`. The update is conditional on the status that was checked, so if the
order changed meanwhile (for example a VNPay callback) the API returns `409` instead of overwriting it.
Returns the updated order.

## Admin orders

Admin only (`SupabaseAuthGuard` + `AdminGuard`).

- `GET /admin/orders?search=&status=&page=&page_size=` → `{ items, total }`. `search` (≤100 characters)
  matches order code/number, customer name, email, phone, or VNPay reference; `status` is applied only
  when it is a known order status. `page_size` defaults to 20, maximum 100.
- `GET /admin/orders/stats` → `{ totalOrders, totalRevenue, paidOrdersCount, averageOrderValue,
processingCount, shippedCount, deliveredCount, pendingCount, cancelledCount, ordersByStatus, vnpayRevenue,
codRevenue, dailyRevenueMap, topProducts }`. Revenue counts orders with `payment_status = PAID`.
`ordersByStatus` maps every order status to its count (`0` included), so each number matches
`GET /admin/orders?status=<status>` → `total`.
- `GET /admin/orders/:orderId` → the order (same identifiers as above).
- `PATCH /admin/orders/:orderId/status` with `{ "status": <order status>, "note"?: string ≤500 }`.
  Allowed transitions:

  | From                        | To                                                  |
  | --------------------------- | --------------------------------------------------- |
  | `PENDING_PAYMENT`           | `PAID`, `PAYMENT_FAILED`, `CANCELLED`               |
  | `PAID`                      | `PROCESSING`, `CANCELLED`                           |
  | `PROCESSING`                | `FORWARDED_TO_MANUFACTURER`, `SHIPPED`, `CANCELLED` |
  | `FORWARDED_TO_MANUFACTURER` | `SHIPPED`, `CANCELLED`                              |
  | `SHIPPED`                   | `DELIVERED`, `CANCELLED`                            |
  | `PAYMENT_FAILED`            | `PENDING_PAYMENT`, `CANCELLED`                      |
  | `DELIVERED`, `CANCELLED`    | —                                                   |

  Any other transition returns `409` with `current_status`, `target_status`, and `allowed_statuses`.
  Moving a COD order to `DELIVERED` also marks it paid. History and notifications are recorded.

## VNPay (sandbox)

- `POST /payments/vnpay/create-url` — Bearer token; body `{ "order_id": string }`. The caller must own
  the order (or be admin), the order must use `vnpay` (`400` otherwise) and be `PENDING_PAYMENT` or
  `PAYMENT_FAILED` (`409` otherwise). A new numeric `vnp_TxnRef` is stored on the order and a
  `PAYMENT_FAILED` order returns to `PENDING_PAYMENT`. Returns `200`
  `{ payment_url, txn_ref, order_id }`; the link expires after 15 minutes.
- `GET /payments/vnpay/verify` — public; VNPay's browser return URL. Checks the HMAC-SHA512 signature
  (`400` if invalid), finds the order by `vnp_TxnRef` (`404`), and checks the amount (`400` on
  mismatch). Returns `{ success, message, code?, is_already_paid?, order }`:
  - already paid → `success: true, is_already_paid: true`, nothing is written again;
  - order not in `PENDING_PAYMENT`/`PAYMENT_FAILED` (for example cancelled) → nothing is written;
    `success: false, code: "ORDER_NOT_AWAITING_PAYMENT"`, and the event is logged for manual refund;
  - response code `00` with transaction status `00` → order becomes `PROCESSING` / `PAID`;
  - otherwise → order becomes `PAYMENT_FAILED` / `FAILED` and `code` is the VNPay response code.
    Payment writes are conditional on the order still awaiting payment, so a concurrent cancellation is
    never overwritten.
- `GET /payments/vnpay/ipn` — public; VNPay server-to-server callback with the same rules, answering
  `{ RspCode, Message }`: `97` bad checksum, `01` order not found, `04` invalid amount, `02` already
  confirmed or no longer awaiting payment, `00` success, `99` unexpected error.

## Notifications

Bearer token; every route touches only the caller's own rows.

- `GET /notifications/me?unread_only=true|1` → `{ items, unread_count, total }`, newest first; each
  item is the `notifications` row (`id`, `customer_id`, `type` — `ORDER_CREATED`, `PAYMENT_UPDATED` or
  `ORDER_STATUS_CHANGED` —, `title`, `message`, `order_id`, `read_at`, `created_at`) plus `is_read`.
- `PATCH /notifications/:id/read` → the notification marked read; `404` if it is not the caller's.
- `POST /notifications/read-all` → `{ success: true, updated_count }`.

## No compare endpoint

The backend intentionally has no `/compare` endpoint. Call product detail twice and compare the
two stable `ProductDetail` payloads in the React application.
