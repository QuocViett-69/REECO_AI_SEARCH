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
The migration enables the `vector` extension and adds a nullable dimensionless `embedding` column,
but it does not create embeddings or any HNSW/IVFFlat index.

## Auth and access

All public-schema tables have RLS enabled and explicit Data API grants:

- `anon` can read active product data only and can call the keyword-search RPC.
- `authenticated` can read all imported product rows, including review rows.
- Browser code uses only `VITE_SUPABASE_PUBLISHABLE_KEY`.
- The NestJS API keeps `SUPABASE_SERVICE_ROLE_KEY` server-side and validates Bearer tokens for import routes.
- `/admin/products` and `/admin/import` are protected React routes; `/login` uses email/password Auth.

Local Auth sign-up is disabled because this is an admin login. Create or invite admin users from the
Supabase Dashboard. Mirror the local URL and sign-up settings in the hosted project's Auth configuration.

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
committed Supabase migration continues to use `extensions.vector`.
