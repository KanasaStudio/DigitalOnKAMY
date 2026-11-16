import assert from "node:assert/strict";
import { test } from "node:test";
import { canTransition, isOrderStatus, isPaid, isTerminal, nextStatuses, ORDER_STATUSES } from "../src/lib/commerce/order-status.ts";

test("the happy path moves one step at a time", () => {
  assert.ok(canTransition("pending_payment", "pending_delivery"));
  assert.ok(canTransition("pending_delivery", "delivered"));
  assert.ok(canTransition("delivered", "completed"));
});

test("steps cannot be skipped or reversed", () => {
  assert.equal(canTransition("pending_payment", "delivered"), false);
  assert.equal(canTransition("pending_payment", "completed"), false);
  assert.equal(canTransition("delivered", "pending_payment"), false);
  assert.equal(canTransition("completed", "delivered"), false);
});

test("an unpaid order can be cancelled but never refunded", () => {
  assert.ok(canTransition("pending_payment", "cancelled"));
  assert.equal(canTransition("pending_payment", "refunded"), false);
});

test("a paid order is refunded, not cancelled", () => {
  for (const status of ["pending_delivery", "delivered", "completed"] as const) {
    assert.ok(canTransition(status, "refunded"), status);
    assert.equal(canTransition(status, "cancelled"), false, status);
    assert.ok(isPaid(status), status);
  }
});

test("cancelled and refunded are terminal", () => {
  for (const status of ["cancelled", "refunded"] as const) {
    assert.ok(isTerminal(status));
    assert.deepEqual(nextStatuses(status), []);
    for (const to of ORDER_STATUSES) assert.equal(canTransition(status, to), false);
  }
});

test("no status transitions to itself", () => {
  for (const status of ORDER_STATUSES) assert.equal(canTransition(status, status), false);
});

test("isOrderStatus rejects unknown values", () => {
  assert.ok(isOrderStatus("completed"));
  assert.equal(isOrderStatus("COMPLETED"), false);
  assert.equal(isOrderStatus(null), false);
});
