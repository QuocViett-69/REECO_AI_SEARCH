# Supabase Data Foundation v1

The committed migration creates the first PostgreSQL search foundation for REECO:

- `products`: all Product Master rows in the current dataset. `status = 'active'` is the
  search-eligibility rule. The MVP snapshot at the time was 50 total / 42 active / 8 review; the
  current product master holds 89 products, all active (`data/reports/product-master-report.json`).
  These counts are informational and are not validation constraints.
- `product_specifications`: normalized specification values for active products only.
- `product_documents`: one complete Search Document per active product, guarded by `content_hash`.
- `product_media`: primary image/product URLs with an extensible media type, position, and metadata shape.
- `product_search_index`: keyword/FTS data plus nullable embedding metadata for the later pgvector phase.

`product_search_index.search_tsv` is a stored generated `tsvector` using the multilingual-friendly
`simple` configuration. A GIN index backs the `search_products_keyword(text, integer)` RPC.
The migrations enable the `vector` extension and constrain `product_search_index.embedding` to
`extensions.vector(1536)`. They do not create or backfill embeddings.

## Migration history reconciliation

The hosted project originally recorded `20260915081333_data_foundation_v1.sql` and
`20260915081951_harden_rls_auto_enable.sql`. Earlier repository copies temporarily used versions
`20260915034753` and `20260915082000` for those same logical migrations. A forensic audit confirmed the
timestamp mismatch, and the repository migration identities now match the authoritative hosted history.

The local `20260915081951` hardening SQL is a replay-safe revision of the historical direct-revoke SQL:
it checks that `public.rls_auto_enable()` exists before revoking access. This revised file was not rerun
on hosted. Final hosted convergence is owned by the later `20260916074530` migration.

## Semantic search database foundation

The local Step 7 embedding contract uses Ollama at `http://127.0.0.1:11434` by default, model
`qwen3-embedding:4b`, explicit dimension `1536`, and version
`ollama-qwen3-embedding-4b-1536-v1`. The search-index row stores the vector together with
`embedding_model`, `embedding_dimensions`, `embedding_version`, and `embedded_at`. Database integrity
requires either all five fields to be null or a populated vector with complete metadata and
`embedding_dimensions = 1536`. The migration remains provider/model-agnostic: it does not hard-code a
model or version string, and runtime writes and queries match those metadata values explicitly.

`search_products_semantic(extensions.vector(1536), text, text, integer)` returns active products whose
embedding model and version match the caller's requirements. It ranks by raw cosine distance (`<=>`) and
returns a bounded `0..1` similarity score. Results use an exact vector scan with a deterministic tie-break;
no HNSW or IVFFlat index is created at the current dataset scale. Execute access is revoked from `PUBLIC`,
`anon`, and `authenticated` and granted only to `service_role`, so browser clients cannot call it directly.

Step 7.3A implements local Ollama embedding generation plus safe backfill tooling. Its only embedding
source is `product_search_index.search_text`; it does not translate or embed source JSON, URLs, images,
or complete product objects. The backfill selects active products with non-empty text, skips vectors
whose model/dimension/version are already current, batches requests, and guards updates with the source
content hash and index version read before embedding.

Hosted migrations `20260916074530_ensure_rls_auto_enable_reproducible.sql` and
`20260916080205_step7_semantic_search_foundation.sql` are deployed. The hosted embedding column is
`extensions.vector(1536)`, and all 42 searchable active products have current Ollama embeddings using
`qwen3-embedding:4b` and version `ollama-qwen3-embedding-4b-1536-v1`. The service-role-only semantic RPC
has been runtime-verified on English and Vietnamese queries. NestJS semantic retrieval, internal RRF
fusion, and public hybrid search are implemented. The public endpoint falls back to keyword or semantic
mode when exactly one retrieval source fails; both sources failing returns a sanitized HTTP 503.

Local model loading can take significant time, especially on the first request. The Ollama client has a
configurable 180-second default timeout and does not contact Ollama during backend startup.

## Auth and access

All public-schema tables have RLS enabled and explicit Data API grants:

- `anon` can read active product data only and can call the keyword-search RPC.
- `authenticated` can read all imported product rows, including review rows.
- Browser code receives only public configuration through `REACT_APP_*` variables.
- The NestJS API keeps `SUPABASE_SERVICE_ROLE_KEY` server-side and validates Bearer tokens for import routes.
- `/admin/products` and `/admin/import` are protected React routes; `/login` uses email/password Auth.

Local Auth sign-up is disabled because this is an admin login. Create or invite admin users from the
Supabase Dashboard. Mirror the local URL and sign-up settings in the hosted project's Auth configuration.

### RLS auto-enable defense in depth

The five current public tables explicitly enable RLS in the data-foundation migration. The `ensure_rls`
event trigger also enables RLS automatically when future tables are created in `public`. Its
`public.rls_auto_enable()` function is internal database infrastructure, not an application RPC; execute
privileges are revoked from `PUBLIC`, `anon`, `authenticated`, and `service_role`.

This trigger is defense in depth, not a replacement for migration review. Migration authors must still
explicitly enable RLS and define the intended grants and policies for every exposed table. The PGlite
harness statically checks the event-trigger migration contract but does not runtime-test event-trigger
behavior. A hosted transaction test confirmed that the trigger enables RLS on a newly created `public`
table; the transaction was rolled back and the probe table does not exist.

## Apply and import

```powershell
supabase link --project-ref <project-ref>
supabase db push

$env:DATABASE_URL = '<Supabase direct or session-pooler connection string>'
npm run supabase:import
npm run supabase:validate
```

The importer reads but never writes these pipeline inputs:

- `data/master/product-master.json`
- `data/normalized/specifications/*.json`
- `data/search-documents/*.json`

It validates all source document hashes before opening a database connection. Document upserts are skipped
when `content_hash` is unchanged; search-index upserts are skipped when both source hash and index version
are unchanged. Re-running the import is therefore idempotent.

For a local PostgreSQL-compatible test without Docker:

```powershell
npm run supabase:dry-run
npm run supabase:test:local
```

The local harness replaces only the pgvector column type because PGlite does not bundle pgvector. The
committed Supabase migration continues to use `extensions.vector`. PGlite does not runtime-test
event-trigger behavior; a full local Supabase test depends on Docker and the local stack.

## Embedding tools

The default backfill command is deliberately a no-database/no-Ollama dry-run that writes only the local
report at `data/reports/embedding-backfill-report.json`:

```powershell
npm run embeddings:test
npm run embeddings:validate
npm run embeddings:backfill
npm run embeddings:smoke
```

`embeddings:validate` uses fixtures and does not contact a database or Ollama. Hosted execution is
explicit: load the server-only application environment and run
`node --env-file=apps/api/.env scripts/create-embeddings/backfill.mjs --execute`. The optional
`--limit <positive integer>` uses the same active-only, idempotent, concurrency-guarded path for a bounded
canary. Execute mode records counters, processed product IDs/models, and sanitized failure codes, never
vectors, full search text, or credentials. The Step 7.3B hosted run completed a one-product canary, the
remaining 41-product backfill, and an idempotency run with zero provider calls and zero database updates.

## Commerce tables

Migration `20261001000000_commerce_foundation.sql` adds `product_prices` (VND), `orders`
(`order_number` sequence from 1001, generated `order_code` `REECO-<n>`, status/payment CHECKs, amounts
constrained to `total = subtotal + shipping_fee`, unique `vnpay_txn_ref`), `order_items`,
`order_status_history` (`from_status`, `to_status`, `changed_by` uuid referencing `auth.users`, `note`),
and `notifications` (`ORDER_CREATED`, `PAYMENT_UPDATED`, `ORDER_STATUS_CHANGED`, `read_at`). RLS is
enabled on all of them with no policies and grants are revoked from `anon`/`authenticated`, so only the
API (service role) reads or writes them.
