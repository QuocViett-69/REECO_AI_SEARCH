# Supabase Data Foundation v1

The committed migration creates the first PostgreSQL search foundation for REECO:

- `products`: all Product Master rows in the current dataset. `status = 'active'` is the
  search-eligibility rule. The current MVP snapshot is 50 total / 42 active / 8 review; these counts
  are informational and are not validation constraints.
- `product_specifications`: normalized specification values for active products only.
- `product_documents`: one complete Search Document per active product, guarded by `content_hash`.
- `product_media`: primary image/product URLs with an extensible media type, position, and metadata shape.
- `product_search_index`: keyword/FTS data plus nullable embedding metadata for the later pgvector phase.

`product_search_index.search_tsv` is a stored generated `tsvector` using the multilingual-friendly
`simple` configuration. A GIN index backs the `search_products_keyword(text, integer)` RPC.
The migrations enable the `vector` extension and constrain `product_search_index.embedding` to
`extensions.vector(1536)`. They do not create or backfill embeddings.

## Semantic search database foundation

Step 7 uses OpenAI `text-embedding-3-large` with an explicit output dimension of `1536` and the
embedding version identifier `openai-te3-large-1536-v1`. The search-index row stores the vector together
with `embedding_model`, `embedding_dimensions`, `embedding_version`, and `embedded_at`. Database integrity
requires either all five fields to be null or a populated vector with complete metadata and
`embedding_dimensions = 1536`. The migration intentionally does not hard-code a model or version string;
runtime writes and queries match those metadata values explicitly.

`search_products_semantic(extensions.vector(1536), text, text, integer)` returns active products whose
embedding model and version match the caller's requirements. It ranks by raw cosine distance (`<=>`) and
returns a bounded `0..1` similarity score. Results use an exact vector scan with a deterministic tie-break;
no HNSW or IVFFlat index is created at the current dataset scale. Execute access is revoked from `PUBLIC`,
`anon`, and `authenticated` and granted only to `service_role`, so browser clients cannot call it directly.

Embedding generation, backfill, semantic runtime services, and hybrid retrieval are not implemented in
Step 7.2.

## Auth and access

All public-schema tables have RLS enabled and explicit Data API grants:

- `anon` can read active product data only and can call the keyword-search RPC.
- `authenticated` can read all imported product rows, including review rows.
- Browser code uses only `VITE_SUPABASE_PUBLISHABLE_KEY`.
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
behavior. A full runtime check requires Docker and a local Supabase stack.

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
