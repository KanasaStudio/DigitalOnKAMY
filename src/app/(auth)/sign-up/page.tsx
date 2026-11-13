import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { isDemoMode } from "@/lib/env";
import { AuthForm } from "../auth-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("auth.signUpTitle") };
}

export default function SignUpPage() {
  return <AuthForm mode="sign-up" demo={isDemoMode()} />;
}
