# REECO Basic Backend API Contract

This endpoint behavior is frozen for the Step 7.7 backend MVP. Frontend setup, UI guidance, and
schema-valid JSON fixtures are linked from [`frontend-handoff.md`](./frontend-handoff.md).

Base URL for local development: `http://localhost:3000/api/v1`.

Requests and responses use JSON. Public product and search endpoints expose only
`status = active`. Admin endpoints require `Authorization: Bearer <supabase-access-token>`.
The current Basic Backend authenticates the token but does not yet enforce a separate admin role.

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

The API uses `400` for invalid input, `401` for a missing/invalid token, `404` for a missing
or non-public product, `409` for an import already in progress, and `503` for missing backend
configuration or an unavailable database/import process. Server errors never include Supabase keys,
database credentials, or raw database error details.

The current API does not emit `403`: a valid Supabase token is authenticated but no admin role or
allowlist is enforced yet. This is a pre-production authorization TODO. Unexpected server failures use
`500`.

## GET `/health`

- Auth: none.
- Query parameters: none.
- Request body: none.
- Success: `200 OK`.
- Errors: standard `500` only if the NestJS process itself fails.

```json
{ "status": "ok" }
```

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
  "limit": 10
}
```

`limit` defaults to `10` and must be between 1 and 100.

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
sorted by it. `scores.rerank` remains `null`.

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
returns `200`.

## GET `/admin/products`

- Auth: required Bearer token.
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

Errors: `401` for missing/invalid token, `400` for invalid filters, and `503` for Supabase failure.

## GET `/admin/products/:productId`

- Auth: required Bearer token.
- Path/query/body: same as public product detail.
- Success: `200 OK` with the same `ProductDetail` contract.
- Difference from public detail: active and review rows are visible. Review products currently have
  no search document or normalized-spec rows, so `taxonomy` is `null` and semantic/spec arrays are empty.

Errors: `401`, `404`, or `503` as described above.

## POST `/admin/import`

- Auth: required Bearer token.
- Query parameters: none.
- Request body: none.
- Success: `201 Created` after the existing transactional import script finishes.
- Server requirements: `DATABASE_URL`, plus the deployed `scripts/supabase/` and `data/` directories.

```json
{
  "status": "completed",
  "report": {
    "mode": "import",
    "source_status": "passed",
    "import_status": "completed",
    "validation": { "status": "passed" }
  }
}
```

Errors: `401` for missing/invalid token, `409` if an import is already running, and `503` if the
script/configuration is absent or the import/validation fails.

## No compare endpoint

The Basic Backend intentionally has no `/compare` endpoint. Call product detail twice and compare the
two stable `ProductDetail` payloads in the React application.
