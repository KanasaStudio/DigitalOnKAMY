-- KAMY Merchant Studio — foundation
-- Profiles, merchants, membership roles, payout references, versioned policies,
-- policy acceptances and the audit log. Every table has RLS enabled.
-- Trust-critical writes (store creation, policy acceptance) go through
-- SECURITY DEFINER functions so timestamps, actors and audit rows cannot be forged.

create extension if not exists citext with schema extensions;

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.merchant_type as enum ('individual', 'studio');
create type public.verification_state as enum ('unverified', 'pending', 'verified', 'rejected');
create type public.member_role as enum ('owner', 'admin', 'editor', 'support', 'viewer');
create type public.member_status as enum ('invited', 'active', 'removed');
create type public.payout_state as enum ('not_connected', 'pending', 'connected', 'restricted');
create type public.policy_kind as enum ('seller_agreement', 'ownership_declaration');

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.try_uuid(p text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return p::uuid;
exception when others then
  return null;
end;
$$;

create or replace function private.role_rank(r public.member_role)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case r
    when 'owner' then 50
    when 'admin' then 40
    when 'editor' then 30
    when 'support' then 20
    when 'viewer' then 10
  end;
$$;

-- ---------------------------------------------------------------------------
-- Categories (KAMY taxonomy; editable data, not hardcoded in UI)
-- ---------------------------------------------------------------------------
create table public.categories (
  id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  parent_id text references public.categories (id) on delete restrict,
  name_id text not null,
  name_en text not null,
  icon text not null default 'asset',
  sort_order integer not null default 0
);
create index categories_parent_id_idx on public.categories (parent_id);
alter table public.categories enable row level security;
create policy "Categories are public" on public.categories
  for select to anon, authenticated using (true);
revoke insert, update, delete on public.categories from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 60),
  locale text not null default 'id' check (locale in ('id', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

create policy "Users read their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Users update their own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (display_name, locale) on public.profiles to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, locale)
  values (
    new.id,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 60), ''),
    case when new.raw_user_meta_data ->> 'locale' = 'en' then 'en' else 'id' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Merchants
-- ---------------------------------------------------------------------------
create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete restrict,
  type public.merchant_type not null,
  store_name text not null check (char_length(btrim(store_name)) between 2 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$'),
  tagline text check (tagline is null or char_length(tagline) <= 120),
  bio text check (bio is null or char_length(bio) <= 1200),
  avatar_path text,
  banner_path text,
  specialties text[] not null default '{}' check (cardinality(specialties) <= 6),
  social_links jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object'),
  pinned_announcement text check (pinned_announcement is null or char_length(pinned_announcement) <= 200),
  featured_product_ids uuid[] not null default '{}' check (cardinality(featured_product_ids) <= 6),
  verification_state public.verification_state not null default 'unverified',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint merchants_avatar_path_scoped check (avatar_path is null or avatar_path like id::text || '/%'),
  constraint merchants_banner_path_scoped check (banner_path is null or banner_path like id::text || '/%')
);
create index merchants_owner_user_id_idx on public.merchants (owner_user_id);
alter table public.merchants enable row level security;
create trigger merchants_set_updated_at before update on public.merchants
  for each row execute function private.set_updated_at();

create or replace function private.validate_merchant_specialties()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from unnest(new.specialties) s
    where not exists (
      select 1 from public.categories c where c.id = s and c.parent_id is null
    )
  ) then
    raise exception 'Unknown specialty category' using errcode = '23503';
  end if;
  return new;
end;
$$;
create trigger merchants_validate_specialties
  before insert or update of specialties on public.merchants
  for each row execute function private.validate_merchant_specialties();

-- ---------------------------------------------------------------------------
-- Membership and roles
-- ---------------------------------------------------------------------------
create table public.merchant_members (
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null,
  status public.member_status not null default 'active',
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (merchant_id, user_id)
);
create index merchant_members_user_id_idx on public.merchant_members (user_id);
create index merchant_members_invited_by_idx on public.merchant_members (invited_by);
alter table public.merchant_members enable row level security;

-- Role check used by every merchant-scoped policy. SECURITY DEFINER avoids RLS
-- recursion on merchant_members; it only ever answers for the calling user.
create or replace function private.has_merchant_role(
  p_merchant uuid,
  p_min public.member_role default 'viewer'
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.merchant_members mm
    where mm.merchant_id = p_merchant
      and mm.user_id = (select auth.uid())
      and mm.status = 'active'
      and private.role_rank(mm.role) >= private.role_rank(p_min)
  );
$$;
grant execute on function private.has_merchant_role(uuid, public.member_role) to anon, authenticated;
grant execute on function private.role_rank(public.member_role) to anon, authenticated;
grant execute on function private.try_uuid(text) to anon, authenticated;

create policy "Members see their team" on public.merchant_members
  for select to authenticated
  using (user_id = (select auth.uid()) or private.has_merchant_role(merchant_id, 'viewer'));
-- Team management (invites, role changes) ships with /studio/team via RPCs.
revoke insert, update, delete on public.merchant_members from anon, authenticated;

-- Merchants: public storefront fields are readable once onboarding is complete.
create policy "Public storefronts are readable" on public.merchants
  for select to anon, authenticated
  using (deleted_at is null and onboarding_completed_at is not null);
create policy "Members read their merchant" on public.merchants
  for select to authenticated
  using (private.has_merchant_role(id, 'viewer'));
create policy "Admins update their merchant" on public.merchants
  for update to authenticated
  using (private.has_merchant_role(id, 'admin'))
  with check (private.has_merchant_role(id, 'admin'));

revoke insert, update, delete on public.merchants from anon, authenticated;
-- verification_state, owner, onboarding and deletion columns are never client-writable.
grant update (
  type, store_name, slug, tagline, bio, avatar_path, banner_path,
  specialties, social_links, pinned_announcement, featured_product_ids
) on public.merchants to authenticated;

-- ---------------------------------------------------------------------------
-- Payout references (no raw bank data, ever — provider references only)
-- ---------------------------------------------------------------------------
create table public.merchant_payout_settings (
  merchant_id uuid primary key references public.merchants (id) on delete cascade,
  state public.payout_state not null default 'not_connected',
  provider text,
  provider_account_ref text,
  updated_at timestamptz not null default now()
);
alter table public.merchant_payout_settings enable row level security;
create trigger merchant_payout_settings_set_updated_at before update on public.merchant_payout_settings
  for each row execute function private.set_updated_at();
create policy "Admins read payout status" on public.merchant_payout_settings
  for select to authenticated using (private.has_merchant_role(merchant_id, 'admin'));
revoke insert, update, delete on public.merchant_payout_settings from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Versioned policy documents and acceptances
-- ---------------------------------------------------------------------------
create table public.policy_documents (
  id uuid primary key default gen_random_uuid(),
  kind public.policy_kind not null,
  version text not null,
  title_id text not null,
  title_en text not null,
  summary_id text[] not null default '{}',
  summary_en text[] not null default '{}',
  body_id text not null,
  body_en text not null,
  effective_at timestamptz not null default now(),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  unique (kind, version)
);
create unique index policy_documents_one_current_per_kind
  on public.policy_documents (kind) where is_current;
alter table public.policy_documents enable row level security;
create policy "Policies are public" on public.policy_documents
  for select to anon, authenticated using (true);
revoke insert, update, delete on public.policy_documents from anon, authenticated;

create table public.policy_acceptances (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete restrict,
  policy_document_id uuid not null references public.policy_documents (id) on delete restrict,
  product_id uuid,
  user_agent text,
  accepted_at timestamptz not null default now()
);
create index policy_acceptances_merchant_id_idx on public.policy_acceptances (merchant_id);
create index policy_acceptances_user_id_idx on public.policy_acceptances (user_id);
create index policy_acceptances_policy_document_id_idx on public.policy_acceptances (policy_document_id);
alter table public.policy_acceptances enable row level security;
create policy "Acceptances visible to signer and admins" on public.policy_acceptances
  for select to authenticated
  using (user_id = (select auth.uid()) or private.has_merchant_role(merchant_id, 'admin'));
revoke insert, update, delete on public.policy_acceptances from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Audit log (append-only)
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  merchant_id uuid references public.merchants (id) on delete set null,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index audit_log_merchant_id_created_at_idx on public.audit_log (merchant_id, created_at desc);
create index audit_log_actor_id_idx on public.audit_log (actor_id);
alter table public.audit_log enable row level security;
create policy "Actors and admins read audit entries" on public.audit_log
  for select to authenticated
  using (
    actor_id = (select auth.uid())
    or (merchant_id is not null and private.has_merchant_role(merchant_id, 'admin'))
  );
revoke insert, update, delete on public.audit_log from anon, authenticated;

-- Request context forwarded by the Next.js server (x-kamy-client-ip / user-agent).
-- Values are self-reported by the caller and labelled as such in the UI.
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
  insert into public.audit_log (merchant_id, actor_id, action, entity_type, entity_id, metadata, ip, user_agent)
  values (
    p_merchant,
    (select auth.uid()),
    p_action,
    p_entity_type,
    p_entity_id,
    coalesce(p_metadata, '{}'::jsonb),
    left(coalesce(v_headers ->> 'x-kamy-client-ip', split_part(v_headers ->> 'x-forwarded-for', ',', 1)), 64),
    left(coalesce(v_headers ->> 'x-kamy-user-agent', v_headers ->> 'user-agent'), 300)
  );
end;
$$;
revoke all on function private.write_audit(uuid, text, text, text, jsonb) from public, anon, authenticated;

-- Audit storefront edits automatically.
create or replace function private.audit_merchant_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_changed text[];
begin
  select coalesce(array_agg(key order by key), '{}')
    into v_changed
  from jsonb_each(to_jsonb(new)) n
  where n.key not in ('updated_at')
    and n.value is distinct from (to_jsonb(old) -> n.key);
  if cardinality(v_changed) > 0 and (select auth.uid()) is not null then
    perform private.write_audit(new.id, 'merchant.updated', 'merchant', new.id::text,
      jsonb_build_object('fields', to_jsonb(v_changed)));
  end if;
  return new;
end;
$$;
create trigger merchants_audit_update after update on public.merchants
  for each row execute function private.audit_merchant_update();

-- ---------------------------------------------------------------------------
-- Onboarding state
-- ---------------------------------------------------------------------------
create or replace function private.refresh_onboarding(p_merchant uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.merchants m
     set onboarding_completed_at = now()
   where m.id = p_merchant
     and m.onboarding_completed_at is null
     and not exists (
       select 1 from public.policy_documents d
       where d.is_current
         and d.kind in ('seller_agreement', 'ownership_declaration')
         and not exists (
           select 1 from public.policy_acceptances a
           where a.merchant_id = m.id and a.policy_document_id = d.id and a.product_id is null
         )
     );
end;
$$;
revoke all on function private.refresh_onboarding(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public RPCs
-- ---------------------------------------------------------------------------
create or replace function public.is_slug_available(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$'
     and p_slug not like '%--%'
     and p_slug <> all (array[
       'studio','admin','api','auth','kamy','help','support','settings','sign-in','sign-up',
       'login','logout','register','c','creator','creators','marketplace','about','blog','docs',
       'policies','policy','www','app','static','assets','design-system','official','staff','moderator'
     ])
     and not exists (select 1 from public.merchants m where m.slug = p_slug);
$$;
grant execute on function public.is_slug_available(text) to anon, authenticated;

create or replace function public.create_merchant(
  p_type public.merchant_type,
  p_store_name text,
  p_slug text,
  p_tagline text default null,
  p_specialties text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
  v_slug text := lower(btrim(p_slug));
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if exists (select 1 from public.merchants where owner_user_id = v_uid and deleted_at is null) then
    raise exception 'merchant_exists' using errcode = '23505';
  end if;
  if not public.is_slug_available(v_slug) then
    raise exception 'slug_unavailable' using errcode = '23505';
  end if;

  insert into public.merchants (owner_user_id, type, store_name, slug, tagline, specialties)
  values (v_uid, p_type, btrim(p_store_name), v_slug, nullif(btrim(coalesce(p_tagline, '')), ''),
          coalesce(p_specialties, '{}'))
  returning id into v_id;

  insert into public.merchant_members (merchant_id, user_id, role, status)
  values (v_id, v_uid, 'owner', 'active');

  insert into public.merchant_payout_settings (merchant_id) values (v_id);

  perform private.write_audit(v_id, 'merchant.created', 'merchant', v_id::text,
    jsonb_build_object('slug', v_slug, 'type', p_type));
  return v_id;
end;
$$;
revoke all on function public.create_merchant(public.merchant_type, text, text, text, text[]) from public, anon;
grant execute on function public.create_merchant(public.merchant_type, text, text, text, text[]) to authenticated;

create or replace function public.accept_policy(
  p_merchant uuid,
  p_document uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_doc public.policy_documents;
  v_id uuid;
  v_headers json;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if not private.has_merchant_role(p_merchant, 'admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select * into v_doc from public.policy_documents where id = p_document;
  if not found or not v_doc.is_current then
    raise exception 'policy_not_current' using errcode = '22023';
  end if;

  begin
    v_headers := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_headers := null;
  end;

  insert into public.policy_acceptances (merchant_id, user_id, policy_document_id, user_agent)
  values (p_merchant, (select auth.uid()), p_document,
          left(coalesce(v_headers ->> 'x-kamy-user-agent', v_headers ->> 'user-agent'), 300))
  returning id into v_id;

  perform private.write_audit(p_merchant, 'policy.accepted', 'policy_document', p_document::text,
    jsonb_build_object('kind', v_doc.kind, 'version', v_doc.version));
  perform private.refresh_onboarding(p_merchant);
  return v_id;
end;
$$;
revoke all on function public.accept_policy(uuid, uuid) from public, anon;
grant execute on function public.accept_policy(uuid, uuid) to authenticated;
