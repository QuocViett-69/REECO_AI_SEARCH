create schema if not exists extensions;
create extension if not exists vector with schema extensions;

create table public.products (
  product_id text primary key,
  model text not null unique,
  product_name_en text not null,
  category text,
  subcategory text,
  device_type text,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_status_check check (status in ('active', 'review'))
);

create table public.product_specifications (
  specification_id bigint generated always as identity primary key,
  product_id text not null references public.products(product_id) on delete cascade,
  source_key text not null,
  canonical_key text not null,
  quantity_kind text,
  normalized_value jsonb not null,
  raw_ref jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_specifications_source_key_unique unique (product_id, source_key),
  constraint product_specifications_source_key_check check (source_key ~ '^[a-f0-9]{64}$')
);

create table public.product_documents (
  product_id text primary key references public.products(product_id) on delete cascade,
  search_document jsonb not null,
  search_text_en text not null,
  search_text_vi text not null,
  search_text text not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_documents_content_hash_check check (content_hash ~ '^[a-f0-9]{64}$'),
  constraint product_documents_product_id_check check (search_document ->> 'product_id' = product_id)
);

create table public.product_media (
  media_id bigint generated always as identity primary key,
  product_id text not null references public.products(product_id) on delete cascade,
  media_type text not null default 'primary',
  image_url text,
  product_url text,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_media_product_type_position_unique unique (product_id, media_type, position),
  constraint product_media_position_check check (position >= 0),
  constraint product_media_url_check check (image_url is not null or product_url is not null)
);

create table public.product_search_index (
  product_id text primary key references public.products(product_id) on delete cascade,
  search_text text not null,
  search_tsv tsvector generated always as (
    to_tsvector('simple'::regconfig, coalesce(search_text, ''))
  ) stored,
  source_content_hash text not null,
  index_version text not null,
  embedding extensions.vector,
  embedding_model text,
  embedding_dimensions integer,
  embedding_version text,
  embedded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_search_index_content_hash_check check (source_content_hash ~ '^[a-f0-9]{64}$'),
  constraint product_search_index_embedding_dimensions_check check (
    embedding_dimensions is null or embedding_dimensions > 0
  )
);

create index product_specifications_product_id_idx
  on public.product_specifications (product_id);

create index product_media_product_id_idx
  on public.product_media (product_id);

create index product_search_index_search_tsv_idx
  on public.product_search_index using gin (search_tsv);

create or replace function public.search_products_keyword(
  query_text text,
  result_limit integer default 10
)
returns table (
  product_id text,
  model text,
  product_name_en text,
  search_text text,
  rank real
)
language sql
stable
security invoker
set search_path = ''
as $$
  with parsed_query as (
    select websearch_to_tsquery('simple'::regconfig, query_text) as value
    where nullif(btrim(query_text), '') is not null
  )
  select
    products.product_id,
    products.model,
    products.product_name_en,
    search_index.search_text,
    ts_rank_cd(search_index.search_tsv, parsed_query.value, 32) as rank
  from public.product_search_index as search_index
  join public.products as products using (product_id)
  cross join parsed_query
  where products.status = 'active'
    and search_index.search_tsv @@ parsed_query.value
  order by rank desc, products.model asc
  limit greatest(1, least(coalesce(result_limit, 10), 100));
$$;

alter table public.products enable row level security;
alter table public.product_specifications enable row level security;
alter table public.product_documents enable row level security;
alter table public.product_media enable row level security;
alter table public.product_search_index enable row level security;

create policy products_public_active_read
  on public.products for select to anon
  using (status = 'active');

create policy products_authenticated_read
  on public.products for select to authenticated
  using (true);

create policy product_specifications_public_active_read
  on public.product_specifications for select to anon
  using (
    exists (
      select 1
      from public.products
      where products.product_id = product_specifications.product_id
        and products.status = 'active'
    )
  );

create policy product_specifications_authenticated_read
  on public.product_specifications for select to authenticated
  using (true);

create policy product_documents_public_active_read
  on public.product_documents for select to anon
  using (
    exists (
      select 1
      from public.products
      where products.product_id = product_documents.product_id
        and products.status = 'active'
    )
  );

create policy product_documents_authenticated_read
  on public.product_documents for select to authenticated
  using (true);

create policy product_media_public_active_read
  on public.product_media for select to anon
  using (
    exists (
      select 1
      from public.products
      where products.product_id = product_media.product_id
        and products.status = 'active'
    )
  );

create policy product_media_authenticated_read
  on public.product_media for select to authenticated
  using (true);

create policy product_search_index_public_active_read
  on public.product_search_index for select to anon
  using (
    exists (
      select 1
      from public.products
      where products.product_id = product_search_index.product_id
        and products.status = 'active'
    )
  );

create policy product_search_index_authenticated_read
  on public.product_search_index for select to authenticated
  using (true);

grant usage on schema public to anon, authenticated, service_role;
grant select on table
  public.products,
  public.product_specifications,
  public.product_documents,
  public.product_media,
  public.product_search_index
to anon, authenticated;

grant all on table
  public.products,
  public.product_specifications,
  public.product_documents,
  public.product_media,
  public.product_search_index
to service_role;

grant usage, select on all sequences in schema public to service_role;

revoke execute on function public.search_products_keyword(text, integer) from public;
grant execute on function public.search_products_keyword(text, integer)
  to anon, authenticated, service_role;
