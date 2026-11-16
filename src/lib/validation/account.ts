import { z } from "zod";
import { CART_CAP, LICENSE_IDS, WISHLIST_CAP } from "@/lib/market/merge";

export const productRef = z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/);
export const licenseKey = z.enum(LICENSE_IDS);
export const cartLine = z.object({ slug: productRef, license: licenseKey });

/** What the browser may send when a guest signs in. Anything malformed is rejected whole. */
export const marketSnapshot = z.object({
  cart: z.array(cartLine).max(CART_CAP),
  wishlist: z.array(productRef).max(WISHLIST_CAP),
});
export type MarketSnapshot = z.infer<typeof marketSnapshot>;

export const profileInput = z.object({
  displayName: z
    .string()
    .trim()
    .max(60)
    // Control characters and angle brackets have no place in a name shown across the site.
    .regex(/^[^\u0000-\u001f\u007f<>]*$/),
});
