import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterProducts,
  normalizeProductRow,
  resolveCatalogSource,
  StagingProductProvider,
  type ProductRow,
} from "../src/lib/market/repository.ts";

const NOW = new Date("2026-11-16T00:00:00Z");
const row = (over: Partial<ProductRow> = {}): ProductRow => ({
  id: "3f0e1c52-8a1b-4c6e-9a55-0a4f6d2b7c11",
  slug: "kit-contoh",
  title: "Kit Contoh",
  summary: "Ringkasan",
  description: "Paragraf satu.\n\nParagraf dua.",
  whats_included: ["Satu file"],
  tags: ["contoh"],
  category_id: "ui-ux",
  subcategory_id: "ui-kits",
  delivery_method: "instant_download",
  created_at: "2026-11-01T10:00:00Z",
  updated_at: "2026-11-10T10:00:00Z",
  merchant: { slug: "toko-contoh" },
  version: { version_label: "2.0", compatibility: ["Figma", 7] },
  prices: [{ currency: "IDR", amount: 200000, sale_amount: 150000, sale_starts_at: "2026-11-10T00:00:00Z", sale_ends_at: "2026-11-20T00:00:00Z" }],
  licenses: [{ license: { key: "personal" } }, { license: { key: "commercial" } }, { license: { key: "made-up" } }],
  ...over,
});

test("a database row becomes the shape the catalogue components render", () => {
  const product = normalizeProductRow(row(), NOW);
  assert.ok(product);
  assert.equal(product.slug, "kit-contoh");
  assert.equal(product.creator, "toko-contoh");
  assert.equal(product.price, 200000);
  assert.equal(product.salePrice, 150000);
  assert.deepEqual(product.licenses, ["personal", "commercial"]);
  assert.deepEqual(product.description, ["Paragraf satu.", "Paragraf dua."]);
  assert.deepEqual(product.compatibility, ["Figma"]);
  assert.equal(product.version, "2.0");
  assert.equal(product.art.kind, "ui");
});

test("a sale price outside its window is ignored", () => {
  assert.equal(normalizeProductRow(row(), new Date("2026-11-21T00:00:00Z"))?.salePrice, undefined);
  assert.equal(normalizeProductRow(row(), new Date("2026-11-09T00:00:00Z"))?.salePrice, undefined);
});

test("rows that cannot be shown safely are dropped", () => {
  assert.equal(normalizeProductRow(row({ prices: [] }), NOW), null);
  assert.equal(normalizeProductRow(row({ prices: [{ currency: "USD", amount: 10, sale_amount: null, sale_starts_at: null, sale_ends_at: null }] }), NOW), null);
  assert.equal(normalizeProductRow(row({ category_id: null }), NOW), null);
  assert.equal(normalizeProductRow({ nonsense: true }, NOW), null);
  assert.equal(normalizeProductRow(row({ prices: [{ currency: "IDR", amount: -5, sale_amount: null, sale_starts_at: null, sale_ends_at: null }] }), NOW), null);
});

test("PostgREST may return an embedded row as an array; both forms normalise", () => {
  const product = normalizeProductRow({ ...row(), merchant: [{ slug: "toko-array" }] }, NOW);
  assert.equal(product?.creator, "toko-array");
});

test("the same id always yields the same placeholder art", () => {
  assert.deepEqual(normalizeProductRow(row(), NOW)?.art, normalizeProductRow(row(), NOW)?.art);
});

test("filterProducts applies price, category and sort", () => {
  const a = normalizeProductRow(row({ slug: "a", prices: [{ currency: "IDR", amount: 50000, sale_amount: null, sale_starts_at: null, sale_ends_at: null }] }), NOW);
  const b = normalizeProductRow(row({ slug: "b", category_id: "graphics" }), NOW);
  assert.ok(a && b);
  assert.deepEqual(filterProducts([a, b], { category: "ui-ux" }).map((p) => p.slug), ["a"]);
  assert.deepEqual(filterProducts([a, b], { min: 100000 }).map((p) => p.slug), ["b"]);
  assert.deepEqual(filterProducts([a, b], { sort: "price-desc" }).map((p) => p.slug), ["b", "a"]);
  assert.deepEqual(filterProducts([a, b], { discount: true }).map((p) => p.slug), ["b"]);
});

test("the catalogue source defaults to staging", () => {
  assert.equal(resolveCatalogSource(undefined), "staging");
  assert.equal(resolveCatalogSource("anything"), "staging");
  assert.equal(resolveCatalogSource("supabase"), "supabase");
});

test("the staging provider answers through the same interface", async () => {
  const repo = new StagingProductProvider();
  const all = await repo.getProducts();
  assert.ok(all.ok && all.data.length > 0);
  const one = await repo.getProductBySlug("rumah-adat-lowpoly-pack");
  assert.ok(one.ok && one.data?.slug === "rumah-adat-lowpoly-pack");
  const none = await repo.getProductBySlug("tidak-ada");
  assert.ok(none.ok && none.data === null);
  const featured = await repo.getFeaturedProducts();
  assert.ok(featured.ok && featured.data.length > 0);
});
