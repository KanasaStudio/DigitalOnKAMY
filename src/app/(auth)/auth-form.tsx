"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import { signInAction, signUpAction, type AuthState } from "./actions";

export function AuthForm({ mode, next, demo }: { mode: "sign-in" | "sign-up"; next?: string; demo: boolean }) {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "sign-in" ? signInAction : signUpAction,
    {},
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (state.checkEmail) {
    return (
      <div className="flex flex-col gap-4">
        <span className="flex size-11 items-center justify-center rounded-[12px] border border-mint-line bg-mint-tint text-mint">
          <Icon name="mail" size={22} />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">{t("auth.checkEmailTitle")}</h1>
        <p className="leading-relaxed text-silver">{t("auth.checkEmailBody", { email: state.checkEmail })}</p>
        <Link href="/sign-in" className="font-semibold text-mint hover:underline">
          {t("auth.submitSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">{mode === "sign-in" ? t("auth.signInTitle") : t("auth.signUpTitle")}</h1>
        <p className="leading-relaxed text-silver">{mode === "sign-in" ? t("auth.signInBody") : t("auth.signUpBody")}</p>
      </div>

      {demo ? (
        <p className="rounded-[10px] border border-dashed border-silver/60 px-3 py-2.5 text-sm text-cloud">{t("auth.errors.notConfigured")}</p>
      ) : null}
      {state.error ? (
        <p role="alert" className="flex items-start gap-2 rounded-[10px] bg-graphite px-3 py-2.5 text-sm text-cloud shadow-[inset_3px_0_0_#f4f5f7]">
          <Icon name="error" size={16} className="mt-0.5" />
          {t(state.error)}
        </p>
      ) : null}

      {next ? <input type="hidden" name="next" value={next} /> : null}

      {mode === "sign-up" ? (
        <Field label={t("auth.displayName")} hint={t("auth.displayNameHint")} optional>
          {(control) => (
            <Input {...control} name="displayName" autoComplete="nickname" maxLength={60} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          )}
        </Field>
      ) : null}

      <Field label={t("auth.email")} required error={state.fieldErrors?.email ? t(state.fieldErrors.email) : undefined}>
        {(control) => (
          <Input {...control} name="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        )}
      </Field>

      <Field
        label={t("auth.password")}
        required
        hint={mode === "sign-up" ? t("auth.passwordHint") : undefined}
        error={state.fieldErrors?.password ? t(state.fieldErrors.password) : undefined}
      >
        {(control) => (
          <Input
            {...control}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                aria-label={t("common.preview")}
                className="rounded p-1 text-silver hover:text-cloud"
              >
                <Icon name={showPassword ? "offline" : "eye"} size={18} />
              </button>
            }
          />
        )}
      </Field>

      <Button type="submit" size="lg" loading={pending} disabled={demo}>
        {mode === "sign-in" ? t("auth.submitSignIn") : t("auth.submitSignUp")}
      </Button>

      <p className="text-sm text-silver">
        {mode === "sign-in" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
        <Link href={mode === "sign-in" ? "/sign-up" : "/sign-in"} className="font-semibold text-cloud underline decoration-line-strong underline-offset-4 hover:decoration-mint">
          {mode === "sign-in" ? t("auth.submitSignUp") : t("auth.submitSignIn")}
        </Link>
      </p>
    </form>
  );
}
