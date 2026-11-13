"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/app/actions/locale";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import { LOCALES } from "@/i18n/core";

export function LanguageSelect() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Field label={t("settings.language")} hint={t("settings.languageHint")}>
      {(control) => (
        <Select
          {...control}
          value={locale}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value;
            startTransition(async () => {
              await setLocaleAction(next);
              router.refresh();
            });
          }}
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {t(`common.languages.${l}`)}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}
