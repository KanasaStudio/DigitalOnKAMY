/**
 * Pure rules for combining a guest's browser cart and wishlist with the lists stored for
 * their account. Kept free of I/O so the same rules run in tests and in the server action.
 */
export const LICENSE_IDS = ["personal", "commercial", "extended", "service"] as const;
export type LicenseKey = (typeof LICENSE_IDS)[number];
export type CartEntry = { slug: string; license: LicenseKey };

export const CART_CAP = 50;
export const WISHLIST_CAP = 200;

const REF = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export function isProductRef(value: unknown): value is string {
  return typeof value === "string" && REF.test(value);
}

export function isLicenseKey(value: unknown): value is LicenseKey {
  return typeof value === "string" && (LICENSE_IDS as readonly string[]).includes(value);
}

/**
 * The account's saved cart wins when both sides hold the same product: it was chosen while
 * signed in. Guest-only lines are appended in the order they were added, up to the cap.
 */
export function mergeCart(server: readonly CartEntry[], guest: readonly CartEntry[], cap = CART_CAP): CartEntry[] {
  const merged: CartEntry[] = [];
  const seen = new Set<string>();
  for (const line of [...server, ...guest]) {
    if (merged.length >= cap) break;
    if (!isProductRef(line.slug) || !isLicenseKey(line.license) || seen.has(line.slug)) continue;
    seen.add(line.slug);
    merged.push({ slug: line.slug, license: line.license });
  }
  return merged;
}

export function mergeWishlist(server: readonly string[], guest: readonly string[], cap = WISHLIST_CAP): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const slug of [...server, ...guest]) {
    if (merged.length >= cap) break;
    if (!isProductRef(slug) || seen.has(slug)) continue;
    seen.add(slug);
    merged.push(slug);
  }
  return merged;
}

/** Rows the server does not hold yet. */
export function missingFrom<T>(target: readonly T[], present: readonly T[], key: (item: T) => string): T[] {
  const have = new Set(present.map(key));
  return target.filter((item) => !have.has(key(item)));
}
