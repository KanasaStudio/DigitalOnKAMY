"use server";

import { isDemoMode } from "@/lib/env";
import { getProductRepository } from "@/lib/market/get-repository";
import { mergeCart, mergeWishlist, missingFrom, isLicenseKey, type CartEntry } from "@/lib/market/merge";
import type { Product } from "@/lib/market/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cartLine, marketSnapshot, productRef } from "@/lib/validation/account";

/**
 * Cart and wishlist persistence for signed-in customers.
 *
 * Every action re-reads the session on the server: the browser never says whose list it is
 * writing to (the database fills `user_id` from the session and RLS checks it again), and
 * a product only enters a list if the catalogue confirms it exists, is available and
 * offers the requested licence. Prices are never taken from the browser here; totals are
 * recomputed from the catalogue wherever they are shown, and again at checkout.
 */
export type MarketFailure = "guest" | "invalid" | "unavailable" | "full";
export type MarketSyncResult =
  | { ok: true; cart: CartEntry[]; wishlist: string[] }
  | { ok: false; reason: MarketFailure };
export type MarketWriteResult = { ok: true } | { ok: false; reason: MarketFailure };

async function session() {
  if (isDemoMode()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

const sellable = (product: Product | null | undefined, license?: string): product is Product =>
  Boolean(product && product.available && (license === undefined || product.licenses.some((l) => l === license)));

const failureFor = (error: { message?: string } | null): MarketFailure =>
  error?.message?.includes("list_full") ? "full" : "unavailable";

/** Called once after sign-in: folds the guest's browser lists into the account's lists. */
export async function syncMarketAction(input: unknown): Promise<MarketSyncResult> {
  const parsed = marketSnapshot.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const ctx = await session();
  if (!ctx) return { ok: false, reason: "guest" };

  const [catalogue, cartRows, wishRows] = await Promise.all([
    getProductRepository().getProducts(),
    ctx.supabase.from("cart_items").select("product_ref, license").order("created_at", { ascending: true }),
    ctx.supabase.from("wishlist_items").select("product_ref").order("created_at", { ascending: false }),
  ]);
  if (!catalogue.ok || cartRows.error || wishRows.error) return { ok: false, reason: "unavailable" };

  const bySlug = new Map(catalogue.data.map((p) => [p.slug, p]));
  const serverCart: CartEntry[] = (cartRows.data ?? []).flatMap((row) =>
    isLicenseKey(row.license) ? [{ slug: row.product_ref, license: row.license }] : [],
  );
  const serverWishlist = (wishRows.data ?? []).map((row) => row.product_ref);

  const guestCart = parsed.data.cart.filter((line) => sellable(bySlug.get(line.slug), line.license));
  const guestWishlist = parsed.data.wishlist.filter((slug) => bySlug.has(slug));

  const cart = mergeCart(serverCart, guestCart);
  const wishlist = mergeWishlist(serverWishlist, guestWishlist);

  const newCart = missingFrom(cart, serverCart, (line) => line.slug);
  const newWishlist = missingFrom(wishlist, serverWishlist, (slug) => slug);
  const [cartInsert, wishInsert] = await Promise.all([
    newCart.length
      ? ctx.supabase.from("cart_items").insert(newCart.map((line) => ({ product_ref: line.slug, license: line.license })))
      : Promise.resolve({ error: null }),
    newWishlist.length
      ? ctx.supabase.from("wishlist_items").insert(newWishlist.map((slug) => ({ product_ref: slug })))
      : Promise.resolve({ error: null }),
  ]);
  if (cartInsert.error || wishInsert.error) return { ok: false, reason: failureFor(cartInsert.error ?? wishInsert.error) };

  // Lines whose product has since left the catalogue stay stored but are not shown.
  return {
    ok: true,
    cart: cart.filter((line) => bySlug.has(line.slug)),
    wishlist: wishlist.filter((slug) => bySlug.has(slug)),
  };
}

export async function setCartLineAction(input: unknown): Promise<MarketWriteResult> {
  const parsed = cartLine.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const ctx = await session();
  if (!ctx) return { ok: false, reason: "guest" };

  const found = await getProductRepository().getProductBySlug(parsed.data.slug);
  if (!found.ok) return { ok: false, reason: "unavailable" };
  if (!sellable(found.data, parsed.data.license)) return { ok: false, reason: "invalid" };

  const updated = await ctx.supabase
    .from("cart_items")
    .update({ license: parsed.data.license })
    .eq("product_ref", parsed.data.slug)
    .select("product_ref");
  if (updated.error) return { ok: false, reason: "unavailable" };
  if (updated.data.length > 0) return { ok: true };

  const inserted = await ctx.supabase
    .from("cart_items")
    .insert({ product_ref: parsed.data.slug, license: parsed.data.license });
  // 23505: another tab added the same product a moment ago. The line exists, which is the goal.
  if (inserted.error && inserted.error.code !== "23505") return { ok: false, reason: failureFor(inserted.error) };
  return { ok: true };
}

export async function removeCartLineAction(input: unknown): Promise<MarketWriteResult> {
  const parsed = productRef.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const ctx = await session();
  if (!ctx) return { ok: false, reason: "guest" };
  const { error } = await ctx.supabase.from("cart_items").delete().eq("product_ref", parsed.data);
  return error ? { ok: false, reason: "unavailable" } : { ok: true };
}

export async function setWishlistAction(slugInput: unknown, wanted: boolean): Promise<MarketWriteResult> {
  const parsed = productRef.safeParse(slugInput);
  if (!parsed.success || typeof wanted !== "boolean") return { ok: false, reason: "invalid" };
  const ctx = await session();
  if (!ctx) return { ok: false, reason: "guest" };

  if (!wanted) {
    const { error } = await ctx.supabase.from("wishlist_items").delete().eq("product_ref", parsed.data);
    return error ? { ok: false, reason: "unavailable" } : { ok: true };
  }
  const found = await getProductRepository().getProductBySlug(parsed.data);
  if (!found.ok) return { ok: false, reason: "unavailable" };
  if (!found.data) return { ok: false, reason: "invalid" };
  const { error } = await ctx.supabase.from("wishlist_items").insert({ product_ref: parsed.data });
  if (error && error.code !== "23505") return { ok: false, reason: failureFor(error) };
  return { ok: true };
}
