begin;
select pg_advisory_xact_lock(610140000);
create table public.product_price_history (
  id bigint generated always as identity primary key,
  product_id text not null references public.products(product_id),
  old_price_vnd bigint,
  new_price_vnd bigint not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_by_email text,
  created_at timestamptz not null default now()
);
create index product_price_history_product_idx on public.product_price_history(product_id, id desc);
alter table public.product_price_history enable row level security;
revoke all on public.product_price_history from anon, authenticated;
grant select, insert on public.product_price_history to service_role;
grant usage on sequence public.product_price_history_id_seq to service_role;

create function public.record_product_price_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'UPDATE' and OLD.price_vnd is not distinct from NEW.price_vnd then return NEW; end if;
  insert into public.product_price_history(product_id, old_price_vnd, new_price_vnd, changed_by, changed_by_email)
  values (NEW.product_id, case when TG_OP = 'UPDATE' then OLD.price_vnd else null end,
    NEW.price_vnd, nullif(current_setting('reeco.actor_id', true), '')::uuid,
    nullif(current_setting('reeco.actor_email', true), ''));
  return NEW;
end;
$$;
create trigger product_price_change after insert or update of price_vnd on public.product_prices
for each row execute function public.record_product_price_change();

-- Price and its audit entry commit together; the API supplies the authenticated actor.
create function public.set_product_price(p_product_id text, p_price_vnd bigint, p_actor_id uuid, p_actor_email text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config('reeco.actor_id', coalesce(p_actor_id::text, ''), true);
  perform set_config('reeco.actor_email', coalesce(p_actor_email, ''), true);
  insert into public.product_prices(product_id, price_vnd) values(p_product_id, p_price_vnd)
  on conflict(product_id) do update set price_vnd = excluded.price_vnd, updated_at = now();
end;
$$;
revoke all on function public.set_product_price(text, bigint, uuid, text) from public, anon, authenticated;
grant execute on function public.set_product_price(text, bigint, uuid, text) to service_role;
revoke all on function public.record_product_price_change() from public, anon, authenticated;

insert into supabase_migrations.schema_migrations(version,name,statements) values('20261014000000','product_price_history',array['create table public.product_price_history (
  id bigint generated always as identity primary key,
  product_id text not null references public.products(product_id),
  old_price_vnd bigint,
  new_price_vnd bigint not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_by_email text,
  created_at timestamptz not null default now()
);
create index product_price_history_product_idx on public.product_price_history(product_id, id desc);
alter table public.product_price_history enable row level security;
revoke all on public.product_price_history from anon, authenticated;
grant select, insert on public.product_price_history to service_role;
grant usage on sequence public.product_price_history_id_seq to service_role;

create function public.record_product_price_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = ''UPDATE'' and OLD.price_vnd is not distinct from NEW.price_vnd then return NEW; end if;
  insert into public.product_price_history(product_id, old_price_vnd, new_price_vnd, changed_by, changed_by_email)
  values (NEW.product_id, case when TG_OP = ''UPDATE'' then OLD.price_vnd else null end,
    NEW.price_vnd, nullif(current_setting(''reeco.actor_id'', true), '''')::uuid,
    nullif(current_setting(''reeco.actor_email'', true), ''''));
  return NEW;
end;
$$;
create trigger product_price_change after insert or update of price_vnd on public.product_prices
for each row execute function public.record_product_price_change();

-- Price and its audit entry commit together; the API supplies the authenticated actor.
create function public.set_product_price(p_product_id text, p_price_vnd bigint, p_actor_id uuid, p_actor_email text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config(''reeco.actor_id'', coalesce(p_actor_id::text, ''''), true);
  perform set_config(''reeco.actor_email'', coalesce(p_actor_email, ''''), true);
  insert into public.product_prices(product_id, price_vnd) values(p_product_id, p_price_vnd)
  on conflict(product_id) do update set price_vnd = excluded.price_vnd, updated_at = now();
end;
$$;
revoke all on function public.set_product_price(text, bigint, uuid, text) from public, anon, authenticated;
grant execute on function public.set_product_price(text, bigint, uuid, text) to service_role;
revoke all on function public.record_product_price_change() from public, anon, authenticated;
']);
commit;
