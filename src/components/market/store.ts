"use client";

import { useSyncExternalStore } from "react";
import type { LicenseId } from "@/lib/market/catalog";

/**
 * Cart and wishlist. Guests keep them in this browser. Once someone signs in, `MarketSync`
 * connects a remote: the lists are merged into their account (`cart_items`,
 * `wishlist_items`) and every later change is also written there by a server action.
 * This store is only ever a convenience copy: the server re-validates each product and
 * recomputes every price, and nothing security-relevant (auth, orders, payments, download
 * rights) is stored here.
 */
export type CartLine = { slug: string; license: LicenseId };

type State = { cart: CartLine[]; wishlist: string[]; recent: string[] };
const KEY = "kamy:market:v1";
const EMPTY: State = { cart: [], wishlist: [], recent: [] };
const listeners = new Set<() => void>();

type RemoteResult = Promise<{ ok: boolean }>;
export type MarketRemote = {
  setCartLine: (line: CartLine) => RemoteResult;
  removeCartLine: (slug: string) => RemoteResult;
  setWishlist: (slug: string, wanted: boolean) => RemoteResult;
  /** Called when a change was kept in this browser but could not be saved to the account. */
  onError: () => void;
};
let remote: MarketRemote | null = null;

function push(write: (r: MarketRemote) => RemoteResult) {
  const target = remote;
  if (!target) return;
  write(target).then(
    (result) => {
      if (!result.ok) target.onError();
    },
    () => target.onError(),
  );
}
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
  /** Current lists, for handing to the server when a guest signs in. */
  snapshot(): Pick<State, "cart" | "wishlist"> {
    load();
    return { cart: state.cart, wishlist: state.wishlist };
  },
  connect(next: MarketRemote) {
    remote = next;
  },
  disconnect() {
    remote = null;
  },
  /** Replaces the lists with the account's merged lists. Search history stays local. */
  hydrate(cart: CartLine[], wishlist: string[]) {
    load();
    set({ ...state, cart, wishlist });
  },
  addToCart(slug: string, license: LicenseId) {
    load();
    const rest = state.cart.filter((l) => l.slug !== slug);
    set({ ...state, cart: [...rest, { slug, license }] });
    push((r) => r.setCartLine({ slug, license }));
  },
  setLicense(slug: string, license: LicenseId) {
    load();
    set({ ...state, cart: state.cart.map((l) => (l.slug === slug ? { ...l, license } : l)) });
    push((r) => r.setCartLine({ slug, license }));
  },
  removeFromCart(slug: string) {
    load();
    set({ ...state, cart: state.cart.filter((l) => l.slug !== slug) });
    push((r) => r.removeCartLine(slug));
  },
  toggleWishlist(slug: string): boolean {
    load();
    const has = state.wishlist.includes(slug);
    set({ ...state, wishlist: has ? state.wishlist.filter((s) => s !== slug) : [slug, ...state.wishlist] });
    push((r) => r.setWishlist(slug, !has));
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
