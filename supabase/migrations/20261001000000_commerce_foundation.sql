-- Commerce foundation for the demo: server-owned prices, orders, order items,
-- order status history and customer notifications.
-- The API talks to these tables with the service-role key, which bypasses RLS.
-- RLS is enabled without any policy so anon/authenticated clients cannot read
-- or write them directly through PostgREST.

create table public.product_prices (
  product_id text primary key references public.products(product_id) on delete cascade,
  price_vnd bigint not null,
  updated_at timestamptz not null default now(),
  constraint product_prices_price_check check (price_vnd >= 0)
);

create sequence public.order_number_seq start with 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint not null unique default nextval('public.order_number_seq'),
  order_code text generated always as ('REECO-' || order_number::text) stored,
  customer_id uuid not null references auth.users(id),
  status text not null,
  payment_method text not null,
  payment_status text not null,
  shipping_method text not null,
  shipping_fee bigint not null,
  subtotal bigint not null,
  total bigint not null,
  currency text not null default 'VND',
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  city text not null,
  province text,
  country text not null default 'Vietnam',
  postal_code text,
  notes text,
  estimated_delivery_from date,
  estimated_delivery_to date,
  vnpay_txn_ref text unique,
  vnpay_transaction_no text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (
    status in (
      'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'FORWARDED_TO_MANUFACTURER',
      'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED'
    )
  ),
  constraint orders_payment_status_check check (
    payment_status in ('PENDING_PAYMENT', 'COD_PENDING', 'PAID', 'FAILED')
  ),
  constraint orders_payment_method_check check (payment_method in ('cod', 'vnpay')),
  constraint orders_shipping_method_check check (shipping_method in ('standard', 'express')),
  constraint orders_currency_check check (currency = 'VND'),
  constraint orders_amounts_check check (
    shipping_fee >= 0 and subtotal >= 0 and total = subtotal + shipping_fee
  )
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(product_id),
  model text not null,
  product_name text not null,
  image_url text,
  unit_price bigint not null,
  quantity integer not null,
  line_total bigint not null,
  constraint order_items_quantity_check check (quantity between 1 and 999),
  constraint order_items_line_total_check check (unit_price >= 0 and line_total = unit_price * quantity),
  constraint order_items_order_product_unique unique (order_id, product_id)
);

create table public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id),
  note text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  order_id uuid references public.orders(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_check check (
    type in ('ORDER_CREATED', 'PAYMENT_UPDATED', 'ORDER_STATUS_CHANGED')
  )
);

create index orders_customer_created_idx on public.orders (customer_id, created_at desc);
create index orders_status_idx on public.orders (status);
create index order_items_order_idx on public.order_items (order_id);
create index order_status_history_order_idx on public.order_status_history (order_id, created_at);
create index notifications_customer_created_idx on public.notifications (customer_id, created_at desc);

create or replace function public.commerce_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.commerce_touch_updated_at() from public, anon, authenticated;

create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.commerce_touch_updated_at();

create trigger product_prices_touch_updated_at
  before update on public.product_prices
  for each row execute function public.commerce_touch_updated_at();

alter table public.product_prices enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.notifications enable row level security;

revoke all on public.product_prices, public.orders, public.order_items,
  public.order_status_history, public.notifications from anon, authenticated;
revoke all on sequence public.order_number_seq from anon, authenticated;
