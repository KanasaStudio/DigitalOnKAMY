/**
 * Demo data layer. Everything in this file is sample data and must only be rendered
 * through components that show the "Demo data" label. It is never written anywhere.
 */
import type { StudioContext } from "@/lib/auth/studio-context";

const DEMO_SELLER_DOC = {
  id: "demo-seller-agreement",
  kind: "seller_agreement" as const,
  version: "1.0-draft",
};
const DEMO_OWNERSHIP_DOC = {
  id: "demo-ownership",
  kind: "ownership_declaration" as const,
  version: "1.0-draft",
};

export function demoStudioContext(): StudioContext {
  return {
    demo: true,
    user: { id: "demo-user", email: "demo@kamy.example", displayName: "Raka" },
    merchant: {
      id: "00000000-0000-4000-8000-000000000001",
      type: "individual",
      store_name: "Nusantara Lowpoly",
      slug: "nusantara-lowpoly",
      tagline: "Aset low-poly siap pakai untuk game Roblox dan Unity.",
      bio: "Saya membuat aset 3D low-poly bertema arsitektur dan alam Indonesia.\nSetiap paket dilengkapi tekstur, dokumentasi, dan contoh scene.",
      avatar_path: null,
      banner_path: null,
      specialties: ["3d-game", "graphics"],
      social_links: { website: "https://example.com", instagram: "https://instagram.com/example" },
      pinned_announcement: null,
      verification_state: "unverified",
      onboarding_completed_at: null,
      created_at: "2026-11-01T03:00:00.000Z",
    },
    role: "owner",
    payoutState: "not_connected",
    policies: {
      seller: { document: DEMO_SELLER_DOC, acceptedAt: "2026-11-01T03:05:00.000Z" },
      ownership: { document: DEMO_OWNERSHIP_DOC, acceptedAt: null },
    },
    productCount: 3,
  };
}

/** Sample figures for the Overview, rendered only with a "Demo data" label. */
export const DEMO_METRICS = {
  revenue: { value: 1245000, previous: 980000 },
  orders: { value: 27, previous: 22 },
  views: { value: 3412, previous: 3650 },
  conversion: { value: 0.0079, previous: 0.006 },
  trend: [4, 6, 3, 8, 7, 9, 5, 11, 8, 12, 10, 14, 9, 13],
  recentOrders: [
    { id: "KMY-10482", product: "Rumah Joglo Low-Poly Pack", amount: 79000, at: "2026-11-12T09:12:00.000Z" },
    { id: "KMY-10477", product: "Candi & Pura Modular Kit", amount: 129000, at: "2026-11-11T14:40:00.000Z" },
    { id: "KMY-10469", product: "Tropical Foliage Textures", amount: 49000, at: "2026-11-10T02:05:00.000Z" },
  ],
  topProducts: [
    { title: "Candi & Pura Modular Kit", sales: 12 },
    { title: "Rumah Joglo Low-Poly Pack", sales: 9 },
    { title: "Tropical Foliage Textures", sales: 6 },
  ],
};
