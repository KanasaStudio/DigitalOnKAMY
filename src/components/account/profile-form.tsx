"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type ProfileState } from "@/app/(market)/account/actions";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";

export function ProfileForm({ email, displayName, demo }: { email: string; displayName: string; demo: boolean }) {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(updateProfileAction, {});
  const [name, setName] = useState(displayName);

  return (
    <form action={formAction} className="flex flex-col gap-5 p-5" noValidate>
      {state.error ? (
        <p role="alert" className="flex items-start gap-2 rounded-[10px] bg-graphite px-3 py-2.5 text-sm text-cloud shadow-[inset_3px_0_0_#f4f5f7]">
          <Icon name="error" size={16} className="mt-0.5 shrink-0" />
          {t(state.error)}
        </p>
      ) : null}
      <Field label={t("account.profile.email")} hint={t("account.profile.emailHint")}>
        {(control) => <Input {...control} type="email" value={email} readOnly autoComplete="email" />}
      </Field>
      <Field
        label={t("account.profile.displayName")}
        hint={t("account.profile.displayNameHint")}
        error={state.fieldError ? t(state.fieldError) : undefined}
        counter={{ count: name.length, max: 60 }}
      >
        {(control) => (
          <Input {...control} name="displayName" autoComplete="nickname" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        )}
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending} disabled={demo || name.trim() === displayName}>
          {t("common.saveChanges")}
        </Button>
        <p role="status" className="text-sm text-mint">
          {state.saved && !pending && name.trim() === displayName ? t("account.profile.saved") : ""}
        </p>
      </div>
    </form>
  );
}
