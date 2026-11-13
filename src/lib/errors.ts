import type { MessageKey, Vars } from "@/i18n/core";

export type FieldError = { key: MessageKey; vars?: Vars };

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: MessageKey; vars?: Vars; fieldErrors?: Record<string, FieldError> };

type PgLikeError = { code?: string; message?: string } | null | undefined;

/** Map database errors to explainable, translated messages. */
export function messageForDbError(error: PgLikeError): { error: MessageKey; vars?: Vars } {
  const message = error?.message ?? "";
  if (message.includes("merchant_exists")) return { error: "errors.merchantExists" };
  if (message.includes("slug_unavailable") || message.includes("merchants_slug_key")) {
    return { error: "validation.slugTaken" };
  }
  if (message.includes("not_authenticated") || error?.code === "28000") return { error: "errors.notAuthenticated" };
  if (message.includes("forbidden") || error?.code === "42501") {
    return { error: "errors.forbidden", vars: { role: "Admin" } };
  }
  return { error: "errors.generic" };
}
