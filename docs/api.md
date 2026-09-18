# API

The implemented Basic Backend surface is:

```text
GET  /api/v1/health
GET  /api/v1/products
GET  /api/v1/products/:productId
POST /api/v1/search

GET  /api/v1/admin/products             Bearer token required
GET  /api/v1/admin/products/:productId  Bearer token required
POST /api/v1/admin/import               Bearer token required
```

There is intentionally no compare endpoint. See [`api-contract.md`](./api-contract.md) for the full
request/response/error contract and [`frontend-handoff.md`](./frontend-handoff.md) for the frozen React
integration handoff.

`POST /api/v1/search` uses keyword + semantic retrieval with RRF, followed by deterministic structured
technical ranking for exact identity, reviewed protocols, and conservative Celsius temperature
constraints. Its public `mode` is `hybrid` when
both retrieval paths succeed, `keyword` when semantic retrieval fails but keyword fallback succeeds,
and `semantic` when keyword retrieval fails but semantic fallback succeeds. Single-source fallback is
still `200 OK`; both sources failing returns a sanitized `503 Service Unavailable`. Technical ranking
does not alter mode or scores: `scores.hybrid` remains the RRF retrieval score and `scores.rerank`
remains `null`. `matched_features` contains positive structured evidence only.
