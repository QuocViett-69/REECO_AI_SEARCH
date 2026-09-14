# API

```text
GET    /api/v1/health

GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id

POST   /api/v1/imports
GET    /api/v1/imports/:id

POST   /api/v1/search

POST   /api/v1/products/:id/reindex
POST   /api/v1/index/rebuild
```

Only the health endpoint is implemented in the current scaffold.
