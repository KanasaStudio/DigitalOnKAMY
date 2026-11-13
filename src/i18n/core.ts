import id, { type Messages } from "./messages/id";
import en from "./messages/en";

export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "kamy_locale";

export const dictionaries: Record<Locale, Messages> = { id, en };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = T extends string
  ? never
  : T extends readonly unknown[]
    ? never
    : { [K in keyof T & string]: T[K] extends string ? K : Join<K, Paths<T[K]>> }[keyof T & string];

export type MessageKey = Paths<Messages>;
export type Vars = Record<string, string | number>;
export type Translate = (key: MessageKey, vars?: Vars) => string;

function lookup(messages: Messages, key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function createTranslator(locale: Locale): Translate {
  const messages = dictionaries[locale];
  return (key, vars) => {
    const value = lookup(messages, key);
    if (typeof value !== "string") {
      if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing "${key}" (${locale})`);
      return key;
    }
    return interpolate(value, vars);
  };
}

/** For list-shaped messages (arrays) and nested groups. */
export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}
