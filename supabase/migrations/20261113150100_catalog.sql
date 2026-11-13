-- KAMY Merchant Studio — catalog, licenses and moderation
-- Tables the listing wizard (Phase 4) and catalog lifecycle (Phase 5) build on.
-- Status changes are never client-writable; they will go through RPCs and every
-- change is recorded in moderation_events by trigger.

create type public.product_type as enum ('digital_file', 'bundle', 'service', 'template', 'course', 'software');
create type public.product_status as enum (
  'draft', 'submitted', 'in_review', 'approved', 'changes_requested',
  'rejected', 'published', 'unpublished', 'suspended'
);
create type public.delivery_method as enum ('instant_download', 'access_link', 'manual');
create type public.media_kind as enum ('image', 'video_link', 'model_3d', 'audio', 'document_page');
create type public.scan_status as enum ('pending', 'clean', 'infected', 'skipped');

-- ---------------------------------------------------------------------------
-- License templates (platform templates have merchant_id null)
-- ---------------------------------------------------------------------------
create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references public.merchants (id) on delete cascade,
  key text not null check (key ~ '^[a-z0-9-]{2,40}$'),
  version integer not null default 1 check (version > 0),
  name_id text not null,
  name_en text not null,
  summary_id text not null,
  summary_en text not null,
  can_id text[] not null default '{}',
  can_en text[] not null default '{}',
  cannot_id text[] not null default '{}',
  cannot_en text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique nulls not distinct (merchant_id, key, version)
);
create index licenses_merchant_id_idx on public.licenses (merchant_id);
alter table public.licenses enable row level security;
create policy "Platform licenses are public" on public.licenses
  for select to anon, authenticated using (merchant_id is null);
create policy "Members read their custom licenses" on public.licenses
  for select to authenticated using (merchant_id is not null and private.has_merchant_role(merchant_id, 'viewer'));
-- Licenses are immutable once issued: new terms = new version row, never an update.
create policy "Editors add custom license versions" on public.licenses
  for insert to authenticated
  with check (merchant_id is not null and private.has_merchant_role(merchant_id, 'editor'));
revoke update, delete on public.licenses from anon, authenticated;
revoke insert on public.licenses from anon;

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete restrict,
  type public.product_type not null default 'digital_file',
  title text not null default '' check (char_length(title) <= 120),
  slug text check (slug is null or slug ~ '^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$'),
  category_id text references public.categories (id) on delete restrict,
  subcategory_id text references public.categories (id) on delete restrict,
  summary text check (summary is null or char_length(summary) <= 200),
  description text check (description is null or char_length(description) <= 20000),
  whats_included text[] not null default '{}',
  specifications jsonb not null default '[]'::jsonb check (jsonb_typeof(specifications) = 'array'),
  requirements text check (requirements is null or char_length(requirements) <= 4000),
  tags text[] not null default '{}' check (cardinality(tags) <= 12),
  delivery_method public.delivery_method not null default 'instant_download',
  refund_policy text,
  status public.product_status not null default 'draft',
  current_version_id uuid,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  deleted_at timestamptz,
  unique (merchant_id, slug)
);
create index products_merchant_id_status_idx on public.products (merchant_id, status);
create index products_category_id_idx on public.products (category_id);
create index products_subcategory_id_idx on public.products (subcategory_id);
create index products_created_by_idx on public.products (created_by);
alter table public.products enable row level security;
create trigger products_set_updated_at before update on public.products
  for each row execute function private.set_updated_at();

create or replace function private.product_merchant(p_product uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select merchant_id from public.products where id = p_product;
$$;
grant execute on function private.product_merchant(uuid) to anon, authenticated;

create or replace function private.product_is_public(p_product uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.products p
    where p.id = p_product and p.status = 'published' and p.deleted_at is null
  );
$$;
grant execute on function private.product_is_public(uuid) to anon, authenticated;

create policy "Published products are public" on public.products
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null);
create policy "Members read their products" on public.products
  for select to authenticated
  using (private.has_merchant_role(merchant_id, 'viewer'));
create policy "Editors create draft products" on public.products
  for insert to authenticated
  with check (private.has_merchant_role(merchant_id, 'editor') and status = 'draft');
create policy "Editors edit products" on public.products
  for update to authenticated
  using (private.has_merchant_role(merchant_id, 'editor'))
  with check (private.has_merchant_role(merchant_id, 'editor'));
create policy "Admins delete drafts" on public.products
  for delete to authenticated
  using (private.has_merchant_role(merchant_id, 'admin') and status = 'draft');

revoke insert, update on public.products from anon, authenticated;
revoke delete on public.products from anon;
grant insert (
  merchant_id, type, title, slug, category_id, subcategory_id, summary, description,
  whats_included, specifications, requirements, tags, delivery_method, refund_policy
) on public.products to authenticated;
grant update (
  type, title, slug, category_id, subcategory_id, summary, description,
  whats_included, specifications, requirements, tags, delivery_method, refund_policy
) on public.products to authenticated;

-- ---------------------------------------------------------------------------
-- Versions, files, media, prices, product licenses
-- ---------------------------------------------------------------------------
create table public.product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  version_label text not null default '1.0.0' check (version_label ~ '^[0-9A-Za-z][0-9A-Za-z.+-]{0,31}$'),
  changelog text check (changelog is null or char_length(changelog) <= 4000),
  compatibility jsonb not null default '[]'::jsonb check (jsonb_typeof(compatibility) = 'array'),
  files_manifest jsonb not null default '[]'::jsonb check (jsonb_typeof(files_manifest) = 'array'),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_at timestamptz
);
create index product_versions_product_id_idx on public.product_versions (product_id);
alter table public.product_versions enable row level security;

alter table public.products
  add constraint products_current_version_fk
  foreign key (current_version_id) references public.product_versions (id) on delete set null;
create index products_current_version_id_idx on public.products (current_version_id);

create policy "Members read versions" on public.product_versions
  for select to authenticated
  using (private.has_merchant_role(private.product_merchant(product_id), 'viewer'));
create policy "Current version of published products is public" on public.product_versions
  for select to anon, authenticated
  using (
    private.product_is_public(product_id)
    and exists (select 1 from public.products p where p.id = product_id and p.current_version_id = product_versions.id)
  );
create policy "Editors add versions" on public.product_versions
  for insert to authenticated
  with check (private.has_merchant_role(private.product_merchant(product_id), 'editor'));
create policy "Editors edit unsubmitted versions" on public.product_versions
  for update to authenticated
  using (submitted_at is null and private.has_merchant_role(private.product_merchant(product_id), 'editor'))
  with check (submitted_at is null and private.has_merchant_role(private.product_merchant(product_id), 'editor'));
revoke insert, update, delete on public.product_versions from anon, authenticated;
grant insert (product_id, version_label, changelog, compatibility) on public.product_versions to authenticated;
grant update (version_label, changelog, compatibility) on public.product_versions to authenticated;

-- Product files are never public. Buyers receive expiring signed URLs from the server.
create table public.product_files (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.product_versions (id) on delete cascade,
  storage_key text not null unique,
  filename text not null check (char_length(filename) between 1 and 255),
  size_bytes bigint not null check (size_bytes >= 0),
  checksum_sha256 text check (checksum_sha256 is null or checksum_sha256 ~ '^[a-f0-9]{64}$'),
  format text,
  detected_mime text,
  scan_status public.scan_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index product_files_version_id_idx on public.product_files (version_id);
alter table public.product_files enable row level security;
create policy "Members read file records" on public.product_files
  for select to authenticated
  using (private.has_merchant_role(
    private.product_merchant((select v.product_id from public.product_versions v where v.id = version_id)), 'viewer'));
-- File records are written by the server after magic-byte checks (Phase 4).
revoke insert, update, delete on public.product_files from anon, authenticated;

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  kind public.media_kind not null default 'image',
  storage_path text,
  external_url text check (external_url is null or external_url ~ '^https://'),
  alt_text text check (alt_text is null or char_length(alt_text) <= 300),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (storage_path is not null or external_url is not null)
);
create index product_media_product_id_idx on public.product_media (product_id, sort_order);
create unique index product_media_one_cover on public.product_media (product_id) where is_cover;
alter table public.product_media enable row level security;
create policy "Media of published products is public" on public.product_media
  for select to anon, authenticated using (private.product_is_public(product_id));
create policy "Members read media" on public.product_media
  for select to authenticated using (private.has_merchant_role(private.product_merchant(product_id), 'viewer'));
create policy "Editors add media" on public.product_media
  for insert to authenticated with check (private.has_merchant_role(private.product_merchant(product_id), 'editor'));
create policy "Editors edit media" on public.product_media
  for update to authenticated
  using (private.has_merchant_role(private.product_merchant(product_id), 'editor'))
  with check (private.has_merchant_role(private.product_merchant(product_id), 'editor'));
create policy "Editors remove media" on public.product_media
  for delete to authenticated using (private.has_merchant_role(private.product_merchant(product_id), 'editor'));
revoke insert, update, delete on public.product_media from anon;

-- Prices are integers in the smallest sensible unit (IDR has no minor unit in practice).
create table public.product_prices (
  product_id uuid not null references public.products (id) on delete cascade,
  currency char(3) not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  amount bigint not null default 0 check (amount >= 0),
  sale_amount bigint check (sale_amount is null or (sale_amount >= 0 and sale_amount < amount)),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  pay_what_you_want boolean not null default false,
  min_amount bigint check (min_amount is null or min_amount >= 0),
  updated_at timestamptz not null default now(),
  primary key (product_id, currency),
  check (sale_ends_at is null or sale_starts_at is null or sale_ends_at > sale_starts_at)
);
alter table public.product_prices enable row level security;
create trigger product_prices_set_updated_at before update on public.product_prices
  for each row execute function private.set_updated_at();
create policy "Prices of published products are public" on public.product_prices
  for select to anon, authenticated using (private.product_is_public(product_id));
create policy "Members read prices" on public.product_prices
  for select to authenticated using (private.has_merchant_role(private.product_merchant(product_id), 'viewer'));
create policy "Editors set prices" on public.product_prices
  for insert to authenticated with check (private.has_merchant_role(private.product_merchant(product_id), 'editor'));
create policy "Editors change prices" on public.product_prices
  for update to authenticated
  using (private.has_merchant_role(private.product_merchant(product_id), 'editor'))
  with check (private.has_merchant_role(private.product_merchant(product_id), 'editor'));
create policy "Editors remove prices" on public.product_prices
  for delete to authenticated using (private.has_merchant_role(private.product_merchant(product_id), 'editor'));
revoke insert, update, delete on public.product_prices from anon;

create table public.product_licenses (
  product_id uuid not null references public.products (id) on delete cascade,
  license_id uuid not null references public.licenses (id) on delete restrict,
  price_override bigint check (price_override is null or price_override >= 0),
  sort_order integer not null default 0,
  primary key (product_id, license_id)
);
create index product_licenses_license_id_idx on public.product_licenses (license_id);
alter table public.product_licenses enable row level security;
create policy "Licenses of published products are public" on public.product_licenses
  for select to anon, authenticated using (private.product_is_public(product_id));
create policy "Members read product licenses" on public.product_licenses
  for select to authenticated using (private.has_merchant_role(private.product_merchant(product_id), 'viewer'));
create policy "Editors attach licenses" on public.product_licenses
  for insert to authenticated with check (private.has_merchant_role(private.product_merchant(product_id), 'editor'));
create policy "Editors change product licenses" on public.product_licenses
  for update to authenticated
  using (private.has_merchant_role(private.product_merchant(product_id), 'editor'))
  with check (private.has_merchant_role(private.product_merchant(product_id), 'editor'));
create policy "Editors detach licenses" on public.product_licenses
  for delete to authenticated using (private.has_merchant_role(private.product_merchant(product_id), 'editor'));
revoke insert, update, delete on public.product_licenses from anon;

-- Per-product ownership declarations reuse policy_acceptances.
alter table public.policy_acceptances
  add constraint policy_acceptances_product_fk
  foreign key (product_id) references public.products (id) on delete set null;
create index policy_acceptances_product_id_idx on public.policy_acceptances (product_id);

-- ---------------------------------------------------------------------------
-- Moderation history
-- ---------------------------------------------------------------------------
create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  from_status public.product_status,
  to_status public.product_status not null,
  actor_id uuid references auth.users (id) on delete set null,
  reason text,
  field_ref text,
  policy_ref text,
  created_at timestamptz not null default now()
);
create index moderation_events_product_id_idx on public.moderation_events (product_id, created_at desc);
create index moderation_events_actor_id_idx on public.moderation_events (actor_id);
alter table public.moderation_events enable row level security;
create policy "Members read moderation history" on public.moderation_events
  for select to authenticated using (private.has_merchant_role(private.product_merchant(product_id), 'viewer'));
revoke insert, update, delete on public.moderation_events from anon, authenticated;

create or replace function private.record_product_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.moderation_events (product_id, from_status, to_status, actor_id, reason, policy_ref)
    values (
      new.id,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status,
      (select auth.uid()),
      nullif(current_setting('kamy.status_reason', true), ''),
      nullif(current_setting('kamy.policy_ref', true), '')
    );
    perform private.write_audit(new.merchant_id, 'product.status_changed', 'product', new.id::text,
      jsonb_build_object('from', case when tg_op = 'INSERT' then null else old.status end, 'to', new.status));
  end if;
  return new;
end;
$$;
create trigger products_record_status
  after insert or update of status on public.products
  for each row execute function private.record_product_status();
