/**
 * Catalogue access behind one interface, so pages and server actions do not care whether
 * products come from the staging file or from Supabase. Providers return the same
 * normalised `Product` shape the existing components already render.
 *
 * This module is pure (no server-only imports) so the normaliser can be unit tested.
 */
import { z } from "zod";
import {
  getProduct,
  HOMEPAGE,
  PRODUCTS,
  queryCatalog,
  type ArtHue,
  type ArtKind,
  type CatalogQuery,
  type LicenseId,
  type Product,
} from "./catalog.ts";

export type CatalogSource = "staging" | "supabase";

export type RepositoryResult<T> = { ok: true; data: T } | { ok: false; reason: "unavailable" };

export interface ProductRepository {
  readonly source: CatalogSource;
  getProducts(): Promise<RepositoryResult<Product[]>>;
  getProductBySlug(slug: string): Promise<RepositoryResult<Product | null>>;
  getProductsByCategory(categoryId: string): Promise<RepositoryResult<Product[]>>;
  searchProducts(query: CatalogQuery): Promise<RepositoryResult<Product[]>>;
  getFeaturedProducts(): Promise<RepositoryResult<Product[]>>;
}

export function resolveCatalogSource(value: string | undefined): CatalogSource {
  return value === "supabase" ? "supabase" : "staging";
}

const ok = <T>(data: T): RepositoryResult<T> => ({ ok: true, data });

/** Fictional catalogue from `catalog.ts`. Always available. */
export class StagingProductProvider implements ProductRepository {
  readonly source = "staging" as const;
  async getProducts() {
    return ok([...PRODUCTS]);
  }
  async getProductBySlug(slug: string) {
    return ok(getProduct(slug) ?? null);
  }
  async getProductsByCategory(categoryId: string) {
    return ok(PRODUCTS.filter((p) => p.category === categoryId || p.subcategory === categoryId));
  }
  async searchProducts(query: CatalogQuery) {
    return ok(queryCatalog(query));
  }
  async getFeaturedProducts() {
    return ok(HOMEPAGE.featured.map((slug) => getProduct(slug)).filter((p): p is Product => Boolean(p)));
  }
}

// ---------------------------------------------------------------------------
// Supabase rows -> Product
// ---------------------------------------------------------------------------
const one = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.array(schema)]).transform((value) => (Array.isArray(value) ? (value[0] ?? null) : value));

export const productRowSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().nullable(),
  description: z.string().nullable(),
  whats_included: z.array(z.string()),
  tags: z.array(z.string()),
  category_id: z.string().nullable(),
  subcategory_id: z.string().nullable(),
  delivery_method: z.enum(["instant_download", "access_link", "manual"]),
  created_at: z.string(),
  updated_at: z.string(),
  merchant: one(z.object({ slug: z.string() })),
  version: one(z.object({ version_label: z.string(), compatibility: z.unknown() }).nullable()).nullable().optional(),
  prices: z.array(
    z.object({
      currency: z.string(),
      amount: z.number().int().nonnegative(),
      sale_amount: z.number().int().nonnegative().nullable(),
      sale_starts_at: z.string().nullable(),
      sale_ends_at: z.string().nullable(),
    }),
  ),
  licenses: z.array(z.object({ license: one(z.object({ key: z.string() }).nullable()) })),
});
export type ProductRow = z.input<typeof productRowSchema>;

const KNOWN_LICENSES: readonly LicenseId[] = ["personal", "commercial", "extended", "service"];
const HUES: readonly ArtHue[] = ["amber", "coral", "sky", "violet", "rose", "emerald", "mint"];
const ART_BY_CATEGORY: Record<string, ArtKind> = {
  "3d-game": "cube",
  templates: "template",
  graphics: "graphic",
  "ui-ux": "ui",
  "audio-video": "audio",
  "tools-plugins": "plugin",
  "creative-services": "service",
};

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Turns one database row into the catalogue shape. Returns null when the row cannot be
 * shown safely: unparseable, no merchant, no IDR price. A sale price applies only inside
 * its window; `now` is a parameter so the rule is testable.
 */
export function normalizeProductRow(row: unknown, now: Date = new Date()): Product | null {
  const parsed = productRowSchema.safeParse(row);
  if (!parsed.success) return null;
  const r = parsed.data;
  const price = r.prices.find((p) => p.currency === "IDR");
  if (!r.merchant || !price || !r.category_id) return null;

  const saleLive =
    price.sale_amount != null &&
    price.sale_amount < price.amount &&
    (!price.sale_starts_at || new Date(price.sale_starts_at) <= now) &&
    (!price.sale_ends_at || new Date(price.sale_ends_at) > now);

  const licenseKeys = r.licenses
    .map((l) => l.license?.key)
    .filter((key): key is LicenseId => KNOWN_LICENSES.includes(key as LicenseId));
  const compatibility = Array.isArray(r.version?.compatibility)
    ? r.version.compatibility.filter((c): c is string => typeof c === "string")
    : [];
  const seed = hash(r.id);

  return {
    slug: r.slug,
    sku: `KMY-${r.id.slice(0, 8).toUpperCase()}`,
    title: r.title,
    creator: r.merchant.slug,
    category: r.category_id,
    subcategory: r.subcategory_id ?? r.category_id,
    price: price.amount,
    ...(saleLive && price.sale_amount != null ? { salePrice: price.sale_amount } : {}),
    licenses: licenseKeys.length ? licenseKeys : ["personal"],
    formats: [],
    compatibility,
    delivery: r.delivery_method === "manual" ? "manual" : "instant",
    tags: r.tags,
    summary: r.summary ?? "",
    description: (r.description ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    includes: r.whats_included,
    createdAt: r.created_at.slice(0, 10),
    updatedAt: r.updated_at.slice(0, 10),
    version: r.version?.version_label ?? "1.0",
    // Sales figures come from paid orders, which do not exist before Phase 2.
    sold: 0,
    available: true,
    art: { kind: ART_BY_CATEGORY[r.category_id] ?? "graphic", hue: HUES[seed % HUES.length], seed: seed % 97 },
  };
}

/** Applies the same filters and sorting the staging catalogue uses to any product list. */
export function filterProducts(products: readonly Product[], query: CatalogQuery): Product[] {
  const term = (query.q ?? "").trim().toLowerCase();
  const price = (p: Product) => p.salePrice ?? p.price;
  const matches = products.filter((p) => {
    if (term && !`${p.title} ${p.summary} ${p.tags.join(" ")} ${p.sku}`.toLowerCase().includes(term)) return false;
    if (query.category && p.category !== query.category) return false;
    if (query.sub && p.subcategory !== query.sub) return false;
    if (query.min != null && price(p) < query.min) return false;
    if (query.max != null && price(p) > query.max) return false;
    if (query.license && !p.licenses.includes(query.license)) return false;
    if (query.creator && p.creator !== query.creator) return false;
    if (query.discount && !p.salePrice) return false;
    if (query.delivery && p.delivery !== query.delivery) return false;
    return true;
  });
  const sort = query.sort ?? "newest";
  return matches.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return price(a) - price(b);
      case "price-desc":
        return price(b) - price(a);
      case "best-selling":
        return b.sold - a.sold;
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}
