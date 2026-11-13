import Link from "next/link";
import { Icon, type IconName } from "@/components/icons/icon";
import { Container } from "@/components/market/section";
import { getTranslator } from "@/i18n/server";
import { categoryHref, countInCategory, subcategoriesOf, topCategories } from "@/lib/market/catalog";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("market.categoriesPage.title") };
}

export default async function CategoriesPage() {
  const { t, locale } = await getTranslator();
  const name = (c: { name: { id: string; en: string } }) => (locale === "en" ? c.name.en : c.name.id);
  return (
    <Container className="pt-8">
      <h1 className="type-page text-cloud">{t("market.categoriesPage.title")}</h1>
      <p className="mt-2 text-[15px] text-silver">{t("market.categoriesPage.body")}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topCategories().map((c) => (
          <section key={c.id} className="flex flex-col rounded-[18px] border border-line bg-surface p-6">
            <Link href={categoryHref(c)} className="group flex items-start gap-4">
              <Icon name={c.icon as IconName} size={40} className="shrink-0 text-mint" />
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-silver">
                  {c.code} · {t("market.home.productsCount", { count: countInCategory(c.id) })}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-cloud group-hover:underline">{name(c)}</h2>
                <p className="mt-1 text-sm text-silver">{c.description ? (locale === "en" ? c.description.en : c.description.id) : null}</p>
              </div>
            </Link>
            <ul className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
              {subcategoriesOf(c.id).map((s) => (
                <li key={s.id}>
                  <Link href={categoryHref(s)} className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-3 text-sm text-cloud hover:border-cloud">
                    {name(s)}
                    <span className="tabular text-xs text-silver">{countInCategory(s.id)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
