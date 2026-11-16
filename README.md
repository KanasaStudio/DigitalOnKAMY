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

## Pratinjau statis di GitHub Pages

`node scripts/build-pages.mjs` membuat salinan statis mode demo di `./out` (data contoh, tanpa daftar/masuk asli,
karena GitHub Pages tidak punya server). Workflow `.github/workflows/pages.yml` men-deploy-nya ke
`https://kanasastudio.github.io/DigitalOnKAMY/`. Aplikasi sungguhan tetap `npm run dev` / Vercel.

## Marketplace (redesign November 2026)

Marketplace pelanggan dibangun mengikuti *KAMY Complete Digital Marketplace System* prompt:

- Tipografi: Space Grotesk (display), Plus Jakarta Sans (teks), IBM Plex Mono (kode/metadata). Ikon diperbesar (22–40px).
- Rute: `/` (homepage), `/products`, `/search`, `/categories`, `/category/[slug]`, `/category/[slug]/[sub]`,
  `/collections/[featured|new|popular|discounts]`, `/product/[slug]`, `/creators`, `/c/[slug]`, `/cart`, `/wishlist`, `/checkout`.
- Data katalog: `src/lib/market/catalog.ts`, **STAGING / TEST DATA** (7 kreator dan 26 produk fiktif, ulasan uji).
  Taksonomi kategori sama dengan tabel `categories` di Supabase (7 kategori utama).
- Keranjang dan wishlist disimpan di browser selama pratinjau; checkout menolak pembayaran secara eksplisit.
- Semua halaman `noindex, nofollow` dan `robots.txt` menolak semua crawler.

## Fase 1: akun pelanggan, keranjang tersinkron, fondasi admin (November 2026)

Migrasi `20261116160000_customer_accounts_admin_foundation.sql` sudah diterapkan ke Kamy Project.

- **Akun pelanggan**: `/account` (profil), `/account/orders`, `/account/library`. Semua butuh sesi; proxy
  mengalihkan tamu ke `/sign-in?next=...` dan setiap halaman memverifikasi sesi lagi di server.
- **Keranjang dan wishlist**: tamu tetap memakai `localStorage`. Setelah masuk, `MarketSync` menggabungkan
  isi browser ke `cart_items` dan `wishlist_items`, lalu setiap perubahan ditulis lewat server action
  (`src/app/(market)/market-actions.ts`). Server memeriksa ulang produk dan lisensi ke katalog; harga dari
  browser tidak pernah dipakai.
- **Pesanan**: tabel `orders`, `order_items`, `order_status_history`. Klien hanya bisa membaca. Perpindahan
  status dijaga trigger database (`pending_payment → pending_delivery → delivered → completed`, plus
  `cancelled` dan `refunded`); cerminnya untuk UI ada di `src/lib/commerce/order-status.ts`.
  Belum ada yang membuat pesanan: itu tugas checkout di Fase 2.
- **Perpustakaan unduhan**: `request_download()` memeriksa kepemilikan dan pembayaran, membatasi 60 unduhan
  per jam, dan mencatat unduhan. Server lalu membuat signed URL berumur 60 detik dari bucket privat
  `product-files`. Tidak memakai service-role key.
- **Admin**: `/admin` (ringkasan) dan `/admin/audit`. Pengguna tanpa peran mendapat 404. Tidak ada
  pendaftaran admin; beri peran lewat SQL Editor:

  ```sql
  insert into public.platform_admins (user_id, role, note)
  select id, 'superadmin', 'admin pertama' from auth.users where email = 'EMAIL_KAMU';
  ```

  Peran: `support` < `moderator` < `finance` < `superadmin`. Pemberian dan pencabutan peran tercatat di
  `audit_log`.
- **Katalog**: `getProductRepository()` (`src/lib/market/get-repository.ts`) memilih penyedia data lewat
  `KAMY_CATALOG_SOURCE` (`staging` bawaan, atau `supabase`). Kode server baru sudah memakainya. Komponen
  marketplace lama masih mengimpor `catalog.ts` langsung dan belum dipindah.
- **Tes**: `npm test` (node:test, 22 tes logika murni), `npm run typecheck`, `npm run lint`.

Belum dibangun: checkout dan KanasaToken, voucher, ulasan, tiket, pembayaran sandbox, modul admin
(moderasi, CMS, keuangan, suara), unggah avatar pelanggan, dan pemindahan komponen marketplace ke repository katalog.
