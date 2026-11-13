import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { MarketFooter } from "@/components/market/footer";
import { MarketHeader, MobileTabBar } from "@/components/market/header";
import { getTranslator } from "@/i18n/server";
import { HOMEPAGE } from "@/lib/market/catalog";

export default async function MarketLayout({ children }: LayoutProps<"/">) {
  const { t } = await getTranslator();
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-mint focus:px-4 focus:py-2 focus:text-obsidian">
        {t("common.skipToContent")}
      </a>
      {/* Utility announcement bar (content will come from the admin CMS). */}
      <div className="border-b border-line bg-graphite">
        <div className="mx-auto flex min-h-9 max-w-[1320px] items-center justify-between gap-4 px-4 py-1.5 text-xs md:px-6">
          <p className="flex items-center gap-2 text-cloud">
            <span className="rounded border border-dashed border-silver/60 px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.12em] text-silver">{t("market.staging.label")}</span>
            <span className="hidden sm:inline">{HOMEPAGE.announcement}</span>
          </p>
          <div className="flex shrink-0 items-center gap-4 text-silver">
            <span className="hidden items-center gap-1.5 md:inline-flex">
              <Icon name="globe" size={16} /> Indonesia · IDR
            </span>
            <Link href="/studio/overview" className="hover:text-cloud">
              {t("market.header.sell")}
            </Link>
          </div>
        </div>
      </div>
      <MarketHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <MarketFooter t={t} />
      <MobileTabBar />
    </div>
  );
}
