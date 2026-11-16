import "server-only";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogQuery, Product } from "./catalog";
import {
  filterProducts,
  normalizeProductRow,
  resolveCatalogSource,
  StagingProductProvider,
  type ProductRepository,
  type RepositoryResult,
} from "./repository";

const SELECT = `
  id, slug, title, summary, description, whats_included, tags, category_id, subcategory_id,
  delivery_method, created_at, updated_at,
  merchant:merchants!products_merchant_id_fkey(slug),
  version:product_versions!products_current_version_fk(version_label, compatibility),
  prices:product_prices(currency, amount, sale_amount, sale_starts_at, sale_ends_at),
  licenses:product_licenses(license:licenses(key))
`;

const LIMIT = 500;

/**
 * Published products from Supabase, read as the current visitor. Row Level Security
 * already limits anonymous readers to published, non-deleted products.
 *
 * Known limit: product slugs are unique per merchant, not globally. Until a global slug
 * rule ships with the listing wizard, a duplicate slug resolves to the earliest listing.
 */
class SupabaseProductProvider implements ProductRepository {
  readonly source = "supabase" as const;

  private async load(filter?: { slug?: string; category?: string }): Promise<RepositoryResult<Product[]>> {
    try {
      const supabase = await createSupabaseServerClient();
      let query = supabase
        .from("products")
        .select(SELECT)
        .eq("status", "published")
        .is("deleted_at", null)
        .not("slug", "is", null)
        .order("published_at", { ascending: true })
        .limit(LIMIT);
      if (filter?.slug) query = query.eq("slug", filter.slug);
      if (filter?.category) query = query.or(`category_id.eq.${filter.category},subcategory_id.eq.${filter.category}`);
      const { data, error } = await query;
      if (error) return { ok: false, reason: "unavailable" };
      const now = new Date();
      const rows: unknown[] = data ?? [];
      return { ok: true, data: rows.map((row) => normalizeProductRow(row, now)).filter((p): p is Product => p !== null) };
    } catch {
      return { ok: false, reason: "unavailable" };
    }
  }

  getProducts() {
    return this.load();
  }
  async getProductBySlug(slug: string): Promise<RepositoryResult<Product | null>> {
    if (!/^[a-z0-9-]{1,80}$/.test(slug)) return { ok: true, data: null };
    const result = await this.load({ slug });
    return result.ok ? { ok: true, data: result.data[0] ?? null } : result;
  }
  getProductsByCategory(categoryId: string) {
    if (!/^[a-z0-9-]{2,40}$/.test(categoryId)) return Promise.resolve<RepositoryResult<Product[]>>({ ok: true, data: [] });
    return this.load({ category: categoryId });
  }
  async searchProducts(query: CatalogQuery): Promise<RepositoryResult<Product[]>> {
    const result = await this.load();
    return result.ok ? { ok: true, data: filterProducts(result.data, query) } : result;
  }
  async getFeaturedProducts(): Promise<RepositoryResult<Product[]>> {
    // Featured picks move to the admin CMS; until then, the newest listings.
    const result = await this.load();
    return result.ok ? { ok: true, data: filterProducts(result.data, { sort: "newest" }).slice(0, 8) } : result;
  }
}

/**
 * `KAMY_CATALOG_SOURCE=supabase` switches the catalogue to the database. Demo mode always
 * uses staging data, because it must run with no backend at all.
 */
export function getProductRepository(): ProductRepository {
  if (isDemoMode()) return new StagingProductProvider();
  return resolveCatalogSource(process.env.KAMY_CATALOG_SOURCE) === "supabase"
    ? new SupabaseProductProvider()
    : new StagingProductProvider();
}
