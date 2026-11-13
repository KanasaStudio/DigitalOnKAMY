import type { Locale } from "./core";

const BCP47: Record<Locale, string> = { id: "id-ID", en: "en-GB" };

/**
 * Money is stored as integers in the smallest sensible unit. For IDR that is whole rupiah.
 * IDR is always formatted the Indonesian way (Rp 49.000) regardless of interface language.
 */
export function formatMoney(amount: number, currency = "IDR", locale: Locale = "id"): string {
  const formatLocale = currency === "IDR" ? "id-ID" : BCP47[locale];
  return new Intl.NumberFormat(formatLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  })
    .format(amount)
    .replace(/ /g, " ");
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(BCP47[locale]).format(value);
}

export function formatDate(value: string | Date, locale: Locale, withTime = false): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(BCP47[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", timeZoneName: "short" } : {}),
  }).format(date);
}

export function formatBytes(bytes: number, locale: Locale): string {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${new Intl.NumberFormat(BCP47[locale], { maximumFractionDigits: 1 }).format(value)} ${units[unit]}`;
}
