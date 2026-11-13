"use client";

import { useSyncExternalStore } from "react";
import type { LicenseId } from "@/lib/market/catalog";

/**
 * Cart and wishlist for the private preview. Kept in this browser only and clearly labelled
 * as such; real carts move to the database (`carts`, `cart_items`) together with checkout.
 * Nothing security-relevant (auth, orders, payments, download rights) is ever stored here.
 */
export type CartLine = { slug: string; license: LicenseId };

type State = { cart: CartLine[]; wishlist: string[]; recent: string[] };
const KEY = "kamy:market:v1";
const EMPTY: State = { cart: [], wishlist: [], recent: [] };
const listeners = new Set<() => void>();
let state: State = EMPTY;
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      state = {
        cart: Array.isArray(parsed.cart) ? parsed.cart.filter((l) => typeof l?.slug === "string").slice(0, 50) : [],
        wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist.filter((s) => typeof s === "string").slice(0, 200) : [],
        recent: Array.isArray(parsed.recent) ? parsed.recent.filter((s) => typeof s === "string").slice(0, 6) : [],
      };
    }
  } catch {
    state = EMPTY;
  }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      listeners.forEach((l) => l());
    }
  });
}

function set(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode): keep in memory for this tab.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMarket(): State {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => EMPTY,
  );
}

export const market = {
  addToCart(slug: string, license: LicenseId) {
    load();
    const rest = state.cart.filter((l) => l.slug !== slug);
    set({ ...state, cart: [...rest, { slug, license }] });
  },
  setLicense(slug: string, license: LicenseId) {
    load();
    set({ ...state, cart: state.cart.map((l) => (l.slug === slug ? { ...l, license } : l)) });
  },
  removeFromCart(slug: string) {
    load();
    set({ ...state, cart: state.cart.filter((l) => l.slug !== slug) });
  },
  toggleWishlist(slug: string): boolean {
    load();
    const has = state.wishlist.includes(slug);
    set({ ...state, wishlist: has ? state.wishlist.filter((s) => s !== slug) : [slug, ...state.wishlist] });
    return !has;
  },
  rememberSearch(q: string) {
    load();
    const term = q.trim().slice(0, 80);
    if (!term) return;
    set({ ...state, recent: [term, ...state.recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 6) });
  },
  clearRecent() {
    load();
    set({ ...state, recent: [] });
  },
};
