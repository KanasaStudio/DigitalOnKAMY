/**
 * Order lifecycle. The database is the authority: `private.order_transition_allowed` and
 * the `orders_guard_status` trigger reject anything not listed here. This mirror exists so
 * the interface can explain a status and never offer a move the database would refuse.
 */
export const ORDER_STATUSES = [
  "pending_payment",
  "pending_delivery",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DELIVERY_STATUSES = ["pending", "available", "delivered", "revoked"] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending_payment: ["pending_delivery", "cancelled"],
  pending_delivery: ["delivered", "refunded"],
  delivered: ["completed", "refunded"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

export function nextStatuses(from: OrderStatus): readonly OrderStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isTerminal(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

/** Paid orders are the only ones that count towards GMV or unlock downloads. */
export function isPaid(status: OrderStatus): boolean {
  return status === "pending_delivery" || status === "delivered" || status === "completed";
}

/** Translation keys, kept in one place so every surface labels a status the same way. */
export const ORDER_STATUS_KEY = {
  pending_payment: "orderStatus.pending_payment",
  pending_delivery: "orderStatus.pending_delivery",
  delivered: "orderStatus.delivered",
  completed: "orderStatus.completed",
  cancelled: "orderStatus.cancelled",
  refunded: "orderStatus.refunded",
} as const satisfies Record<OrderStatus, string>;

export const DELIVERY_STATUS_KEY = {
  pending: "deliveryStatus.pending",
  available: "deliveryStatus.available",
  delivered: "deliveryStatus.delivered",
  revoked: "deliveryStatus.revoked",
} as const satisfies Record<DeliveryStatus, string>;
