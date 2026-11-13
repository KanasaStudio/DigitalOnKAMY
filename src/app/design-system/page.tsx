import type { Metadata } from "next";
import Link from "next/link";
import { KamyWordmark } from "@/components/brand/logo";
import { getTranslator } from "@/i18n/server";
import { Gallery } from "./gallery";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

export default async function DesignSystemPage() {
  const { t } = await getTranslator();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <Link href="/studio/overview" aria-label="KAMY">
        <KamyWordmark height={15} />
      </Link>
      <div className="mb-10 mt-8 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">{t("designSystem.title")}</h1>
        <p className="text-silver">{t("designSystem.body")}</p>
      </div>
      <Gallery />
    </main>
  );
}
