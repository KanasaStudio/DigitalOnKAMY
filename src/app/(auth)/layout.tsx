import Link from "next/link";
import { KamyWordmark } from "@/components/brand/logo";
import { getTranslator } from "@/i18n/server";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const { t } = await getTranslator();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-8">
      <Link href="/" className="self-start" aria-label="KAMY">
        <KamyWordmark height={16} />
      </Link>
      <div className="flex flex-1 flex-col justify-center py-12">{children}</div>
      <p className="label-mono">{t("common.initiative")}</p>
    </main>
  );
}
