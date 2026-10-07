# API

The implemented backend surface (all paths under `/api/v1`):

```text
GET   /health
GET   /products
GET   /products/:productId
POST  /search                              rate limited per IP (429)

POST  /orders                              Bearer token
GET   /orders/me                           Bearer token
GET   /orders/:orderId                     Bearer token (owner or admin)
POST  /orders/:orderId/cancel              Bearer token (owner or admin)

POST  /payments/vnpay/create-url           Bearer token (owner or admin)
GET   /payments/vnpay/verify               public (VNPay browser return)
GET   /payments/vnpay/ipn                  public (VNPay server callback)

GET   /notifications/me                    Bearer token
PATCH /notifications/:id/read              Bearer token
POST  /notifications/read-all              Bearer token

GET   /admin/products                      Bearer token + admin role
GET   /admin/products/:productId           Bearer token + admin role
PATCH /admin/products/:productId           Bearer token + admin role
POST  /admin/import                        Bearer token + admin role
GET   /admin/orders                        Bearer token + admin role
GET   /admin/orders/stats                  Bearer token + admin role
GET   /admin/orders/:orderId               Bearer token + admin role
PATCH /admin/orders/:orderId/status        Bearer token + admin role
```

"Admin role" means the Supabase user's `app_metadata.role` is `"admin"` (`AdminGuard`); other
authenticated users get `403`. There is intentionally no compare endpoint. See
[`api-contract.md`](./api-contract.md) for the full request/response/error contract and
[`frontend-handoff.md`](./frontend-handoff.md) for the React integration handoff.

`POST /api/v1/search` uses keyword + semantic retrieval with RRF, followed by deterministic structured
technical ranking for exact identity, reviewed protocols, and conservative Celsius temperature
constraints, and an optional Top-5 BGE reranker (`RERANKER_ENABLED`, off by default). Its public `mode`
is `hybrid` when both retrieval paths succeed, `keyword` when semantic retrieval fails but keyword
fallback succeeds, and `semantic` when keyword retrieval fails but semantic fallback succeeds.
Single-source fallback is still `200 OK`; both sources failing returns a sanitized
`503 Service Unavailable`. Technical ranking does not alter mode or scores: `scores.hybrid` remains the
RRF retrieval score and `scores.rerank` remains `null`. `matched_features` contains positive structured
evidence only. With `explain: true` each result can include a grounded `explanation`, and some requests
also return an overall `guidance` answer.
