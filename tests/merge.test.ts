import assert from "node:assert/strict";
import { test } from "node:test";
import { isProductRef, mergeCart, mergeWishlist, missingFrom, type CartEntry } from "../src/lib/market/merge.ts";

test("guest lines are appended to the account cart", () => {
  const server: CartEntry[] = [{ slug: "a-pack", license: "personal" }];
  const guest: CartEntry[] = [{ slug: "b-kit", license: "commercial" }];
  assert.deepEqual(mergeCart(server, guest), [...server, ...guest]);
});

test("the account's licence wins when both sides hold the same product", () => {
  const merged = mergeCart([{ slug: "a-pack", license: "extended" }], [{ slug: "a-pack", license: "personal" }]);
  assert.deepEqual(merged, [{ slug: "a-pack", license: "extended" }]);
});

test("the cart never grows past its cap", () => {
  const guest = Array.from({ length: 80 }, (_, i): CartEntry => ({ slug: `item-${i}`, license: "personal" }));
  assert.equal(mergeCart([], guest).length, 50);
  assert.equal(mergeCart([], guest, 3).length, 3);
});

test("malformed lines are dropped rather than stored", () => {
  const guest = [
    { slug: "../etc/passwd", license: "personal" },
    { slug: "ok-item", license: "free" },
    { slug: "ok-item-2", license: "personal" },
  ] as unknown as CartEntry[];
  assert.deepEqual(mergeCart([], guest), [{ slug: "ok-item-2", license: "personal" }]);
});

test("wishlist merge removes duplicates and keeps the account order first", () => {
  assert.deepEqual(mergeWishlist(["a", "b"], ["b", "c", "a"]), ["a", "b", "c"]);
});

test("missingFrom returns only rows the server lacks", () => {
  assert.deepEqual(missingFrom(["a", "b", "c"], ["b"], (s) => s), ["a", "c"]);
});

test("product refs are lowercase slugs only", () => {
  assert.ok(isProductRef("rumah-adat-lowpoly-pack"));
  assert.equal(isProductRef("Rumah Adat"), false);
  assert.equal(isProductRef("<script>"), false);
  assert.equal(isProductRef(""), false);
  assert.equal(isProductRef(42), false);
});
