# KAMY Merchant Studio

The seller side of **KAMY — Digital Products. One Destination.** A Kanasa Studio initiative.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Auth, Postgres + RLS, Storage).

## Run it

```bash
npm install
cp .env.example .env.local   # already points at the "Kamy Project" Supabase project
npm run dev                  # http://localhost:3000
```

**Demo mode** (`KAMY_DEMO_MODE=true`, or no Supabase variables) shows the Studio with clearly
labelled sample data. Every write is disabled and no verified badge is ever shown.

### Supabase Auth settings to check (dashboard → Authentication → URL Configuration)

- **Site URL**: your deployed URL (or `http://localhost:3000` for local work).
- **Redirect URLs**: add `<site>/auth/confirm`.
- The default email sender is rate-limited; configure custom SMTP before real sign-ups.

## Structure

```
src/
  app/
    (auth)/            sign-in, sign-up (server actions)
    auth/              email confirmation + sign-out route handlers
    studio/            the Merchant Studio (overview, onboarding, storefront, policies, settings,
                       [section] = honest placeholders for later phases)
    c/[slug]/          public creator page (same component as the editor preview)
    design-system/     every component in every state (noindex)
  components/
    icons/icon.tsx     KAMY Icon System v1.0 (24px grid, 2px stroke)
    ui/                component library
    studio/            shell (rail, top bar, mobile tab bar, More sheet, ⌘K palette)
    storefront/        creator profile + image cropper
  i18n/                Indonesian (default) + English, typed keys, IDR formatting
  lib/
    auth/              per-request Studio context, safe redirects
    demo/              demo-data layer (sample data only, always labelled)
    supabase/          server/browser/proxy clients + generated types
    validation/        zod schemas shared by client and server
supabase/migrations/   schema, RLS, storage, reference data (already applied to Kamy Project)
```

## Security model

- Authorization lives in the database: RLS on every table, role checks through
  `private.has_merchant_role()` (owner > admin > editor > support > viewer).
- Columns that must never be client-written (`verification_state`, `status`, `owner_user_id`,
  timestamps) are excluded with column-level grants.
- Store creation and policy acceptance go through `SECURITY DEFINER` RPCs that stamp actor,
  time and audit entries server-side.
- `product-files` storage bucket is private; buyers will only get expiring signed URLs.
- Uploaded images are verified by magic bytes on the server, never by extension or MIME type.
- All user text renders as text nodes; links are re-validated as `https://` at render time.

## Phase status

| Phase | Status |
|---|---|
| 1 · Audit | Done |
| 2 · Foundation | Done: tokens, fonts, icons, component library, shell, roles, i18n, demo layer, DB schema |
| 3 · Onboarding + storefront | Done |
| 4 · Listing wizard | Next. Tables, RLS and storage are already in place |
| 5–9 | Not started |


## Lihat website tanpa domain (GitHub Codespaces)

1. Buka repo di GitHub, pilih branch `feat/merchant-studio-foundation`.
2. Klik **Code → Codespaces → Create codespace on feat/merchant-studio-foundation**.
3. Tunggu instalasi selesai, lalu jalankan `npm run dev`. Tab browser untuk port 3000 akan terbuka.
4. Di Supabase Dashboard → Authentication → URL Configuration, tambahkan Redirect URL
   `https://*.app.github.dev/**` agar email konfirmasi kembali ke Codespace.
   Site URL boleh tetap sementara sampai domain siap.
