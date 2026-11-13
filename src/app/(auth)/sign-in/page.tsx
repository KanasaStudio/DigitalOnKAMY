import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { isDemoMode } from "@/lib/env";
import { AuthForm } from "../auth-form";
import { safeNext } from "@/lib/auth/safe-next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("auth.signInTitle") };
}

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);
  const { t } = await getTranslator();
  return (
    <>
      {params.error === "confirm" ? (
        <p role="alert" className="mb-6 rounded-[10px] bg-graphite px-3 py-2.5 text-sm text-cloud shadow-[inset_3px_0_0_#f4f5f7]">
          {t("auth.confirmFailed")}
        </p>
      ) : null}
      <AuthForm mode="sign-in" next={next} demo={isDemoMode()} />
    </>
  );
}
