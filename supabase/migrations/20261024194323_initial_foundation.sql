-- AVHA foundation. Checkout writes remain server-only until the trusted endpoint exists.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table private.admin_users enable row level security;
revoke all on private.admin_users from public, anon, authenticated;

-- Necessary definer: check a non-exposed membership table without granting it to clients.
-- Membership is managed only through trusted SQL, never user-editable JWT metadata.
create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from private.admin_users a where a.user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

create function public.is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select private.is_admin();
$$;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

create function private.set_updated_at() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  images text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default false,
  stock_status text not null default 'made_to_order' check (stock_status in ('in_stock', 'out_of_stock', 'made_to_order')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(images) <= 12)
);
create index products_category_idx on public.products(category_id);
create index products_active_featured_idx on public.products(featured, name) where active;

create table public.hair_services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  price_from numeric(12,2) check (price_from >= 0),
  images text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(images) <= 12)
);
create index hair_services_active_featured_idx on public.hair_services(featured, name) where active;

-- Public-safe singleton only. Banking details live in a separate table.
create table public.store_settings (
  id boolean primary key default true check (id),
  business_name text not null default 'AVHA CREATIONS',
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^\+?[0-9]{10,15}$'),
  email text,
  physical_address text not null default 'Olievenhoutbosch, Centurion, South Africa',
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  delivery_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (true);

create table public.bank_settings (
  id boolean primary key default true check (id),
  bank_name text not null,
  account_holder text not null,
  account_number text not null,
  branch_code text not null,
  account_type text not null,
  payment_instructions text not null default '',
  updated_at timestamptz not null default now()
);

create sequence private.order_number_seq start 1001;
revoke all on sequence private.order_number_seq from public, anon, authenticated;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('AVHA-' || nextval('private.order_number_seq')::text),
  customer_name text not null check (length(trim(customer_name)) between 1 and 160),
  customer_phone text not null check (length(customer_phone) between 7 and 30),
  customer_email text check (length(customer_email) <= 254),
  fulfilment_method text not null check (fulfilment_method in ('collection', 'delivery')),
  delivery_address text check (length(delivery_address) <= 2000),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  total numeric(12,2) not null check (total >= 0 and total = subtotal + delivery_fee),
  payment_method text not null default 'eft' check (payment_method = 'eft'),
  payment_status text not null default 'awaiting_payment'
    check (payment_status in ('awaiting_payment', 'proof_uploaded', 'payment_confirmed', 'payment_rejected')),
  order_status text not null default 'pending'
    check (order_status in ('pending', 'preparing', 'ready_for_collection', 'dispatched', 'completed', 'cancelled')),
  customer_notes text not null default '' check (length(customer_notes) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (fulfilment_method <> 'delivery' or length(trim(coalesce(delivery_address, ''))) > 0),
  check (fulfilment_method <> 'collection' or delivery_fee = 0)
);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_payment_status_created_idx on public.orders(payment_status, created_at desc);
create index orders_status_created_idx on public.orders(order_status, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  quantity integer not null check (quantity between 1 and 99),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) generated always as (quantity * unit_price) stored
);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);

create table public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  storage_path text not null unique,
  original_filename text not null check (length(original_filename) between 1 and 255),
  uploaded_at timestamptz not null default now(),
  verification_status text not null default 'pending' check (verification_status in ('pending', 'confirmed', 'rejected'))
);
create index payment_proofs_order_id_idx on public.payment_proofs(order_id);

-- Every exposed table is explicitly enabled, granted, and covered by RLS.
do $$
declare table_name text;
begin
  foreach table_name in array array['categories','products','hair_services','store_settings','bank_settings','orders','order_items','payment_proofs'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    execute format('create policy admin_read on public.%I for select to authenticated using ((select private.is_admin()))', table_name);
  end loop;
  foreach table_name in array array['categories','products','hair_services','store_settings','bank_settings'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('create policy admin_insert on public.%I for insert to authenticated with check ((select private.is_admin()))', table_name);
    execute format('create policy admin_update on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', table_name);
    execute format('create policy admin_delete on public.%I for delete to authenticated using ((select private.is_admin()))', table_name);
  end loop;
  foreach table_name in array array['categories','products','hair_services','store_settings','bank_settings','orders'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name);
  end loop;
end;
$$;

grant select on public.products, public.categories, public.hair_services, public.store_settings to anon, authenticated;
grant select on public.orders, public.order_items, public.payment_proofs to authenticated;
-- No client can create orders, alter totals, or rewrite historical item snapshots.
grant update (payment_status, order_status) on public.orders to authenticated;
grant update (verification_status) on public.payment_proofs to authenticated;
create policy admin_order_update on public.orders for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admin_proof_update on public.payment_proofs for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy public_active_categories on public.categories for select to anon, authenticated using (active);
create policy public_active_products on public.products for select to anon, authenticated using (
  active and (category_id is null or exists (select 1 from public.categories c where c.id = category_id and c.active))
);
create policy public_active_services on public.hair_services for select to anon, authenticated using (active);
create policy public_business_settings on public.store_settings for select to anon, authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('payment-proofs', 'payment-proofs', false, 10485760, array['image/jpeg','image/png','application/pdf']);

-- Public delivery of catalogue images is intentional; listing/mutation remains admin-only.
create policy admin_catalogue_images on storage.objects for all to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()))
  with check (bucket_id = 'product-images' and (select private.is_admin()));
-- No public proof policies, public links, or browser upload permissions.
create policy admin_proof_read on storage.objects for select to authenticated
  using (bucket_id = 'payment-proofs' and (select private.is_admin()));

commit;
