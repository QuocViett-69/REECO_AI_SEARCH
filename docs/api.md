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
request/response/error contract and [`backend-handoff.md`](./backend-handoff.md) for React integration.
