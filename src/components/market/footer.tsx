import Link from "next/link";
import { KamyWordmark } from "@/components/brand/logo";
import type { Translate } from "@/i18n/core";

export function MarketFooter({ t }: { t: Translate }) {
  const cols: { title: string; links: { label: string; href?: string }[] }[] = [
    {
      title: t("market.footer.marketplace"),
      links: [
        { label: t("market.footer.allProducts"), href: "/products" },
        { label: t("market.footer.categories"), href: "/categories" },
        { label: t("market.footer.newProducts"), href: "/collections/new" },
        { label: t("market.footer.discounts"), href: "/collections/discounts" },
      ],
    },
    {
      title: t("market.footer.creators"),
      links: [
        { label: t("market.footer.becomeCreator"), href: "/studio/onboarding" },
        { label: t("market.footer.studio"), href: "/studio/overview" },
        { label: t("market.footer.directory"), href: "/creators" },
        { label: t("market.footer.sellerAgreement"), href: "/studio/policies" },
      ],
    },
    {
      title: t("market.footer.help"),
      links: [{ label: t("market.footer.helpCenter") }, { label: t("market.footer.refunds") }, { label: t("market.footer.reportIp") }],
    },
    {
      title: t("market.footer.policies"),
      links: [{ label: t("market.footer.terms") }, { label: t("market.footer.privacy") }, { label: t("market.footer.prohibited") }],
    },
  ];
  return (
    <footer className="mt-20 border-t border-line bg-surface pb-24 md:pb-0">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-12 md:grid-cols-[1.3fr_repeat(4,1fr)] md:px-6">
        <div className="max-w-xs">
          <KamyWordmark height={22} />
          <p className="mt-4 font-display text-lg font-medium text-cloud">{t("common.brandTagline")}</p>
          <p className="mt-2 text-sm leading-relaxed text-silver">{t("market.footer.about")}</p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h2 className="font-display text-[15px] font-semibold text-cloud">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <Link href={l.href} className="text-silver hover:text-cloud">
                      {l.label}
                    </Link>
                  ) : (
                    <span className="text-silver/70">
                      {l.label} <span className="font-mono text-[10px] uppercase tracking-wider">· {t("market.footer.soon")}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-4 py-5 text-xs text-silver sm:flex-row sm:items-center sm:justify-between md:px-6">
          <span>{t("market.footer.rights")}</span>
          <span className="font-mono uppercase tracking-[0.12em]">{t("common.initiative")}</span>
        </div>
      </div>
    </footer>
  );
}
