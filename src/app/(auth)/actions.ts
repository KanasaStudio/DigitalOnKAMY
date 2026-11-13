"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { MessageKey } from "@/i18n/core";
import { getLocale } from "@/i18n/server";
import { isDemoMode, SITE_URL } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/safe-next";

export type AuthState = {
  error?: MessageKey;
  fieldErrors?: Partial<Record<"email" | "password" | "displayName", MessageKey>>;
  checkEmail?: string;
};

const credentials = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(200),
});


function authErrorKey(code: string | undefined): MessageKey {
  switch (code) {
    case "invalid_credentials":
      return "auth.errors.invalidCredentials";
    case "email_not_confirmed":
      return "auth.errors.emailNotConfirmed";
    case "weak_password":
      return "auth.errors.weakPassword";
    case "user_already_exists":
    case "email_exists":
      return "auth.errors.alreadyRegistered";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "auth.errors.rateLimited";
    default:
      return "auth.errors.generic";
  }
}

function fieldErrors(email: unknown, password: unknown): AuthState["fieldErrors"] | null {
  const parsed = credentials.safeParse({ email, password });
  if (parsed.success) return null;
  const errors: AuthState["fieldErrors"] = {};
  for (const issue of parsed.error.issues) {
    if (issue.path[0] === "email") errors.email = "validation.email";
    if (issue.path[0] === "password") errors.password = "auth.passwordHint";
  }
  return errors;
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (isDemoMode()) return { error: "auth.errors.notConfigured" };
  const email = formData.get("email");
  const password = formData.get("password");
  const invalid = fieldErrors(email, password);
  if (invalid) return { fieldErrors: invalid };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password: String(password),
  });
  if (error) return { error: authErrorKey(error.code) };
  redirect(safeNext(formData.get("next")));
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (isDemoMode()) return { error: "auth.errors.notConfigured" };
  const email = formData.get("email");
  const password = formData.get("password");
  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 60);
  const invalid = fieldErrors(email, password);
  if (invalid) return { fieldErrors: invalid };

  const supabase = await createSupabaseServerClient();
  const normalizedEmail = String(email).trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: String(password),
    options: {
      emailRedirectTo: `${SITE_URL}/auth/confirm?next=/studio/onboarding`,
      data: { display_name: displayName || undefined, locale: await getLocale() },
    },
  });
  if (error) return { error: authErrorKey(error.code) };
  if (data.session) redirect("/studio/onboarding");
  return { checkEmail: normalizedEmail };
}
