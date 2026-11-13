/** Only allow same-site relative redirects (blocks //evil.com and /\evil.com). */
export function safeNext(value: FormDataEntryValue | string | null | undefined, fallback = "/studio/overview"): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
