-- KAMY — Phase 1: customer accounts, cart and wishlist sync, order and download
-- foundations, platform admin roles and wider audit logging.
--
-- Conventions follow the foundation migration: RLS on every table, no client writes to
-- trust-critical columns, SECURITY DEFINER functions pin an empty search_path and check
-- the caller themselves. Nothing in this file creates an order or moves money: checkout,
-- KanasaToken and payments arrive in Phase 2 and will write through their own RPCs.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.platform_role as enum ('support', 'moderator', 'finance', 'superadmin');
create type public.order_status as enum (
  'pending_payment', 'pending_delivery', 'delivered', 'completed', 'cancelled', 'refunded'
);
create type public.delivery_status as enum ('pending', 'available', 'delivered', 'revoked');

-- ---------------------------------------------------------------------------
-- Platform admins (provisioned by SQL only; there is no sign-up path)
-- ---------------------------------------------------------------------------
create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.platform_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now()
);
create index platform_admins_granted_by_idx on public.platform_admins (granted_by);
alter table public.platform_admins enable row level security;
revoke all on public.platform_admins from anon, authenticated;
grant select on public.platform_admins to authenticated;
create policy "Admins read their own grant" on public.platform_admins
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function private.platform_role_rank(r public.platform_role)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case r
    when 'superadmin' then 40
    when 'finance' then 30
    when 'moderator' then 20
    when 'support' then 10
  end;
$$;

-- Answers only for the calling user. SECURITY DEFINER so policies on other tables can
-- use it without granting anyone read access to the whole admin list.
create or replace function private.is_platform_admin(p_min public.platform_role default 'support')
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = (select auth.uid())
      and private.platform_role_rank(pa.role) >= private.platform_role_rank(p_min)
  );
$$;
revoke all on function private.is_platform_admin(public.platform_role) from public, anon;
grant execute on function private.is_platform_admin(public.platform_role) to authenticated;
grant execute on function private.platform_role_rank(public.platform_role) to authenticated;

-- ---------------------------------------------------------------------------
-- Audit log: request correlation id, admin visibility
-- ---------------------------------------------------------------------------
alter table public.audit_log
  add column request_id text check (request_id is null or char_length(request_id) <= 64);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

create policy "Platform admins read all audit entries" on public.audit_log
  for select to authenticated using (private.is_platform_admin('support'));

create or replace function private.write_audit(
  p_merchant uuid,
  p_action text,
  p_entity_type text default null,
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_headers json;
begin
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_headers := null;
  end;
  insert into public.audit_log (
    merchant_id, actor_id, action, entity_type, entity_id, metadata, ip, user_agent, request_id
  )
  values (
    p_merchant,
    (select auth.uid()),
    p_action,
    p_entity_type,
    p_entity_id,
    coalesce(p_metadata, '{}'::jsonb),
    left(coalesce(v_headers ->> 'x-kamy-client-ip', split_part(v_headers ->> 'x-forwarded-for', ',', 1)), 64),
    left(coalesce(v_headers ->> 'x-kamy-user-agent', v_headers ->> 'user-agent'), 300),
    left(nullif(v_headers ->> 'x-kamy-request-id', ''), 64)
  );
end;
$$;
revoke all on function private.write_audit(uuid, text, text, text, jsonb) from public, anon, authenticated;

create or replace function private.audit_platform_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.write_audit(null, 'platform_admin.revoked', 'user', old.user_id::text,
      jsonb_build_object('role', old.role));
    return old;
  end if;
  perform private.write_audit(null,
    case when tg_op = 'INSERT' then 'platform_admin.granted' else 'platform_admin.changed' end,
    'user', new.user_id::text, jsonb_build_object('role', new.role));
  return new;
end;
$$;
create trigger platform_admins_audit
  after insert or update or delete on public.platform_admins
  for each row execute function private.audit_platform_admin();

-- Admin read access to marketplace records (writes stay behind later RPCs).
create policy "Platform admins read all merchants" on public.merchants
  for select to authenticated using (private.is_platform_admin('support'));
create policy "Platform moderators read all products" on public.products
  for select to authenticated using (private.is_platform_admin('moderator'));

-- ---------------------------------------------------------------------------
-- Wishlist and cart
-- product_ref is the public catalogue key (the product slug used in /product/<slug>).
-- product_id stays null while the catalogue runs on staging data and is filled once the
-- Supabase catalogue provider is live.
-- ---------------------------------------------------------------------------
create table public.wishlist_items (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_ref text not null check (product_ref ~ '^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$'),
  product_id uuid references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_ref)
);
create index wishlist_items_product_id_idx on public.wishlist_items (product_id);
alter table public.wishlist_items enable row level security;
create policy "Users read their wishlist" on public.wishlist_items
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users add to their wishlist" on public.wishlist_items
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users remove from their wishlist" on public.wishlist_items
  for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.wishlist_items from anon, authenticated;
grant select, delete on public.wishlist_items to authenticated;
grant insert (product_ref) on public.wishlist_items to authenticated;

create table public.cart_items (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_ref text not null check (product_ref ~ '^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$'),
  product_id uuid references public.products (id) on delete cascade,
  license text not null check (license in ('personal', 'commercial', 'extended', 'service')),
  quantity integer not null default 1 check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_ref)
);
create index cart_items_product_id_idx on public.cart_items (product_id);
alter table public.cart_items enable row level security;
create trigger cart_items_set_updated_at before update on public.cart_items
  for each row execute function private.set_updated_at();
create policy "Users read their cart" on public.cart_items
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users add to their cart" on public.cart_items
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users change their cart" on public.cart_items
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users remove from their cart" on public.cart_items
  for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.cart_items from anon, authenticated;
grant select, delete on public.cart_items to authenticated;
grant insert (product_ref, license, quantity) on public.cart_items to authenticated;
grant update (license, quantity) on public.cart_items to authenticated;

-- Size caps so a script cannot fill either list without bound.
create or replace function private.enforce_list_cap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_cap integer := tg_argv[0]::integer;
begin
  if tg_table_name = 'cart_items' then
    select count(*) into v_count from public.cart_items where user_id = new.user_id;
  else
    select count(*) into v_count from public.wishlist_items where user_id = new.user_id;
  end if;
  if v_count >= v_cap then
    raise exception 'list_full' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger cart_items_cap before insert on public.cart_items
  for each row execute function private.enforce_list_cap('50');
create trigger wishlist_items_cap before insert on public.wishlist_items
  for each row execute function private.enforce_list_cap('200');

-- ---------------------------------------------------------------------------
-- Orders (read model for Phase 1; rows are created by Phase 2 checkout RPCs only)
-- ---------------------------------------------------------------------------
create or replace function private.new_order_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'KMY-' || to_char(now() at time zone 'Asia/Jakarta', 'YYMMDD') || '-'
      || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default private.new_order_number(),
  customer_id uuid not null references auth.users (id) on delete restrict,
  status public.order_status not null default 'pending_payment',
  currency char(3) not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  subtotal bigint not null check (subtotal >= 0),
  discount_total bigint not null default 0 check (discount_total >= 0),
  total bigint not null check (total >= 0),
  payment_method text check (payment_method is null or payment_method in ('kt', 'gateway')),
  idempotency_key text check (idempotency_key is null or char_length(idempotency_key) between 8 and 80),
  placed_at timestamptz not null default now(),
  paid_at timestamptz,
  completed_at timestamptz,
  closed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint orders_total_matches check (total = subtotal - discount_total),
  constraint orders_idempotency_unique unique (customer_id, idempotency_key)
);
create index orders_customer_id_placed_at_idx on public.orders (customer_id, placed_at desc);
create index orders_status_idx on public.orders (status);
alter table public.orders enable row level security;
create policy "Customers read their orders" on public.orders
  for select to authenticated using (customer_id = (select auth.uid()));
create policy "Platform admins read all orders" on public.orders
  for select to authenticated using (private.is_platform_admin('support'));
revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  merchant_id uuid references public.merchants (id) on delete set null,
  product_ref text not null,
  title text not null check (char_length(title) between 1 and 160),
  license text not null check (license in ('personal', 'commercial', 'extended', 'service')),
  unit_price bigint not null check (unit_price >= 0),
  quantity integer not null default 1 check (quantity between 1 and 99),
  line_total bigint not null check (line_total >= 0),
  delivery_status public.delivery_status not null default 'pending',
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint order_items_line_total_matches check (line_total = unit_price * quantity)
);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);
create index order_items_merchant_id_idx on public.order_items (merchant_id);
alter table public.order_items enable row level security;
create policy "Customers read their order items" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid())
  ));
create policy "Sellers read items sold by their store" on public.order_items
  for select to authenticated
  using (merchant_id is not null and private.has_merchant_role(merchant_id, 'support'));
create policy "Platform admins read all order items" on public.order_items
  for select to authenticated using (private.is_platform_admin('support'));
revoke all on public.order_items from anon, authenticated;
grant select on public.order_items to authenticated;

create table public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  actor_id uuid references auth.users (id) on delete set null,
  reason text check (reason is null or char_length(reason) <= 500),
  created_at timestamptz not null default now()
);
create index order_status_history_order_id_idx on public.order_status_history (order_id, created_at);
create index order_status_history_actor_id_idx on public.order_status_history (actor_id);
alter table public.order_status_history enable row level security;
create policy "Customers read their order history" on public.order_status_history
  for select to authenticated
  using (exists (
    select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid())
  ));
create policy "Platform admins read all order history" on public.order_status_history
  for select to authenticated using (private.is_platform_admin('support'));
revoke all on public.order_status_history from anon, authenticated;
grant select on public.order_status_history to authenticated;

-- The only legal moves. Mirrored in src/lib/commerce/order-status.ts for UI hints.
create or replace function private.order_transition_allowed(
  p_from public.order_status,
  p_to public.order_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_from
    when 'pending_payment' then p_to in ('pending_delivery', 'cancelled')
    when 'pending_delivery' then p_to in ('delivered', 'refunded')
    when 'delivered' then p_to in ('completed', 'refunded')
    when 'completed' then p_to = 'refunded'
    else false
  end;
$$;

create or replace function private.guard_order_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if not private.order_transition_allowed(old.status, new.status) then
      raise exception 'order_transition_not_allowed' using errcode = '22023';
    end if;
    if new.status = 'pending_delivery' then new.paid_at := coalesce(new.paid_at, now()); end if;
    if new.status = 'completed' then new.completed_at := coalesce(new.completed_at, now()); end if;
    if new.status in ('completed', 'cancelled', 'refunded') then new.closed_at := now(); end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger orders_guard_status before update on public.orders
  for each row execute function private.guard_order_status();

create or replace function private.record_order_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_status_history (order_id, from_status, to_status, actor_id, reason)
    values (
      new.id,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status,
      (select auth.uid()),
      nullif(current_setting('kamy.status_reason', true), '')
    );
    perform private.write_audit(null, 'order.status_changed', 'order', new.id::text,
      jsonb_build_object(
        'order_number', new.order_number,
        'from', case when tg_op = 'INSERT' then null else old.status end,
        'to', new.status));
  end if;
  return new;
end;
$$;
create trigger orders_record_status
  after insert or update of status on public.orders
  for each row execute function private.record_order_status();

-- ---------------------------------------------------------------------------
-- Download library
-- ---------------------------------------------------------------------------
create table public.download_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_file_id uuid not null references public.product_files (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index download_events_user_id_created_at_idx on public.download_events (user_id, created_at desc);
create index download_events_product_file_id_idx on public.download_events (product_file_id);
alter table public.download_events enable row level security;
create policy "Users read their download history" on public.download_events
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Platform admins read all download history" on public.download_events
  for select to authenticated using (private.is_platform_admin('support'));
revoke all on public.download_events from anon, authenticated;
grant select on public.download_events to authenticated;

-- True only when the caller bought the product this file belongs to, the order is paid,
-- the item has not been revoked and the file passed scanning.
create or replace function private.user_can_download(p_file uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.product_files f
    join public.product_versions v on v.id = f.version_id
    join public.order_items oi on oi.product_id = v.product_id
    join public.orders o on o.id = oi.order_id
    where f.id = p_file
      and f.scan_status = 'clean'
      and o.customer_id = (select auth.uid())
      and o.status in ('pending_delivery', 'delivered', 'completed')
      and oi.delivery_status in ('available', 'delivered')
  );
$$;
revoke all on function private.user_can_download(uuid) from public, anon;
grant execute on function private.user_can_download(uuid) to authenticated;

create or replace function private.user_can_download_object(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.product_files f
    where f.storage_key = p_name and private.user_can_download(f.id)
  );
$$;
revoke all on function private.user_can_download_object(text) from public, anon;
grant execute on function private.user_can_download_object(text) to authenticated;

-- Lets the server sign a short-lived URL while acting as the buyer. No service-role key.
create policy "Buyers read purchased product files"
  on storage.objects for select to authenticated
  using (bucket_id = 'product-files' and private.user_can_download_object(name));

-- Everything the signed-in customer can download, one row per file.
create or replace function public.my_library()
returns table (
  order_item_id uuid,
  order_number text,
  purchased_at timestamptz,
  product_ref text,
  title text,
  license text,
  file_id uuid,
  filename text,
  size_bytes bigint,
  version_label text
)
language sql
stable
security definer
set search_path = ''
as $$
  select oi.id, o.order_number, o.placed_at, oi.product_ref, oi.title, oi.license,
         f.id, f.filename, f.size_bytes, v.version_label
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  join public.products p on p.id = oi.product_id
  join public.product_versions v on v.id = p.current_version_id
  join public.product_files f on f.version_id = v.id and f.scan_status = 'clean'
  where o.customer_id = (select auth.uid())
    and o.status in ('pending_delivery', 'delivered', 'completed')
    and oi.delivery_status in ('available', 'delivered')
  order by o.placed_at desc, f.filename;
$$;
revoke all on function public.my_library() from public, anon;
grant execute on function public.my_library() to authenticated;

-- Authorises one download, records it and returns the private storage key. The server
-- turns the key into a signed URL that expires within a minute; the key never reaches
-- the browser.
create or replace function public.request_download(p_file uuid)
returns table (storage_key text, filename text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_recent integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if not private.user_can_download(p_file) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select count(*) into v_recent
  from public.download_events e
  where e.user_id = v_uid and e.created_at > now() - interval '1 hour';
  if v_recent >= 60 then
    raise exception 'rate_limited' using errcode = '54000';
  end if;

  insert into public.download_events (user_id, product_file_id) values (v_uid, p_file);
  perform private.write_audit(null, 'download.requested', 'product_file', p_file::text);

  return query
    select f.storage_key, f.filename from public.product_files f where f.id = p_file;
end;
$$;
revoke all on function public.request_download(uuid) from public, anon;
grant execute on function public.request_download(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin overview (figures only; GMV is order value, not platform revenue)
-- ---------------------------------------------------------------------------
create or replace function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_platform_admin('support') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'orders_total', (select count(*) from public.orders),
    'orders_paid', (select count(*) from public.orders
                     where status in ('pending_delivery', 'delivered', 'completed')),
    'gmv', (select coalesce(sum(total), 0) from public.orders
             where status in ('pending_delivery', 'delivered', 'completed')),
    'products_published', (select count(*) from public.products
                            where status = 'published' and deleted_at is null),
    'products_awaiting_review', (select count(*) from public.products
                                  where status in ('submitted', 'in_review') and deleted_at is null),
    'merchants_active', (select count(*) from public.merchants
                          where onboarding_completed_at is not null and deleted_at is null),
    'customers_total', (select count(*) from public.profiles),
    'customers_new_30d', (select count(*) from public.profiles
                           where created_at > now() - interval '30 days')
  );
end;
$$;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
