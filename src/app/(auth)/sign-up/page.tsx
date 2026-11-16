import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { isDemoMode } from "@/lib/env";
import { AuthForm } from "../auth-form";
import { safeNext } from "@/lib/auth/safe-next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("auth.signUpTitle") };
}

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const params = await searchParams;
  // Only carried when present, so sellers keep the default onboarding destination.
  const next = typeof params.next === "string" ? safeNext(params.next, "/studio/onboarding") : undefined;
  return <AuthForm mode="sign-up" next={next} demo={isDemoMode()} />;
}
