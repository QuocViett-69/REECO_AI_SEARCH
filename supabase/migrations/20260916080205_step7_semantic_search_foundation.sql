do $$
begin
  if exists (
    select 1
    from public.product_search_index
    where embedding is not null
  ) then
    raise exception using
      errcode = 'check_violation',
      message = 'Cannot set product_search_index.embedding to vector(1536): existing non-null embeddings require an explicit data migration';
  end if;
end;
$$;

alter table public.product_search_index
  alter column embedding
  type extensions.vector(1536)
  using embedding::extensions.vector(1536);

alter table public.product_search_index
  drop constraint if exists product_search_index_embedding_dimensions_check;

alter table public.product_search_index
  drop constraint if exists product_search_index_embedding_state_check;

alter table public.product_search_index
  add constraint product_search_index_embedding_state_check check (
    (
      embedding is null
      and embedding_model is null
      and embedding_dimensions is null
      and embedding_version is null
      and embedded_at is null
    )
    or
    (
      embedding is not null
      and embedding_model is not null
      and embedding_dimensions = 1536
      and embedding_version is not null
      and embedded_at is not null
    )
  );

create or replace function public.search_products_semantic(
  query_embedding extensions.vector(1536),
  required_embedding_model text,
  required_embedding_version text,
  result_limit integer default 10
)
returns table (
  product_id text,
  model text,
  product_name_en text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  with ranked as (
    select
      products.product_id,
      products.model,
      products.product_name_en,
      search_index.embedding
        operator(extensions.<=>) query_embedding as cosine_distance
    from public.product_search_index as search_index
    join public.products as products using (product_id)
    where query_embedding is not null
      and products.status = 'active'
      and search_index.embedding is not null
      and search_index.embedding_model = required_embedding_model
      and search_index.embedding_version = required_embedding_version
      and search_index.embedding_dimensions = 1536
  )
  select
    ranked.product_id,
    ranked.model,
    ranked.product_name_en,
    least(
      1::double precision,
      greatest(
        0::double precision,
        1::double precision - ranked.cosine_distance
      )
    ) as similarity
  from ranked
  order by ranked.cosine_distance asc, ranked.model asc, ranked.product_id asc
  limit least(greatest(coalesce(result_limit, 10), 1), 100);
$$;

revoke execute on function public.search_products_semantic(
  extensions.vector,
  text,
  text,
  integer
) from public;

revoke execute on function public.search_products_semantic(
  extensions.vector,
  text,
  text,
  integer
) from anon;

revoke execute on function public.search_products_semantic(
  extensions.vector,
  text,
  text,
  integer
) from authenticated;

grant execute on function public.search_products_semantic(
  extensions.vector,
  text,
  text,
  integer
) to service_role;
