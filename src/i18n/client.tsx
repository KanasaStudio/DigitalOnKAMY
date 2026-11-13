"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTranslator, getMessages, type Locale, type Translate } from "./core";

type I18nValue = { locale: Locale; t: Translate };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: createTranslator(locale) }), [locale]);
  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}

export function useMessages() {
  return getMessages(useI18n().locale);
}
