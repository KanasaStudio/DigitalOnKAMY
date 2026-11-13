import Link from "next/link";
import { Icon, type IconName } from "@/components/icons/icon";
import { ProductCarousel } from "@/components/market/carousel";
import { CreatorCard } from "@/components/market/creator-card";
import { PriceDisplay } from "@/components/market/price";
import { ProductArt } from "@/components/market/product-art";
import { ProductCard } from "@/components/market/product-card";
import { PromoBanner } from "@/components/market/promo-banner";
import { Container, SectionHeader } from "@/components/market/section";
import { getTranslator } from "@/i18n/server";
import { formatNumber } from "@/i18n/format";
import { getMessages } from "@/i18n/core";
import {
  bestSellers,
  categoryHref,
  countInCategory,
  CREATORS,
  discounted,
  getCreator,
  getProduct,
  HOMEPAGE,
  newest,
  PRODUCTS,
  topCategories,
  type Product,
} from "@/lib/market/catalog";

export default async function HomePage() {
  const { t, locale } = await getTranslator();
  const messages = getMessages(locale);
  const featured = HOMEPAGE.featured.map(getProduct).filter((p): p is Product => Boolean(p));
  const best = bestSellers().slice(0, 6);
  const fresh = newest().slice(0, 8);
  const tops = topCategories();
  const spotlight = HOMEPAGE.spotlight.map((s) => CREATORS.find((c) => c.slug === s)!).filter(Boolean);
  const name = (c: { name: { id: string; en: string } }) => (locale === "en" ? c.name.en : c.name.id);
  const lead = tops[0];
  const leadProduct = PRODUCTS.find((p) => p.category === lead.id)!;

  const trust: { icon: IconName; title: string; body: string }[] = [
    { icon: "docs", title: t("market.home.trust.licenseTitle"), body: t("market.home.trust.licenseBody") },
    { icon: "price", title: t("market.home.trust.priceTitle"), body: t("market.home.trust.priceBody") },
    { icon: "store", title: t("market.home.trust.creatorTitle"), body: t("market.home.trust.creatorBody") },
    { icon: "lock", title: t("market.home.trust.filesTitle"), body: t("market.home.trust.filesBody") },
  ];

  return (
    <>
      <Container className="pt-4 md:pt-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          <span className="flex shrink-0 items-center gap-1.5 pr-1 text-sm font-semibold text-silver">
            <Icon name="trending" size={20} className="text-mint" />
            {t("market.home.trending")}
          </span>
          {HOMEPAGE.trendingSearches.map((s) => (
            <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="shrink-0 rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-cloud transition-colors hover:border-mint-line hover:text-mint">
              {s}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2.15fr)_minmax(0,1fr)]">
          <PromoBanner />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/studio/onboarding" className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-mint-line bg-[linear-gradient(140deg,color-mix(in_srgb,#65e5d0_16%,#202631),#090b0f_75%)] p-6">
              <div>
                <Icon name="store" size={36} className="text-mint" />
                <h2 className="mt-4 font-display text-[26px] font-semibold leading-tight text-cloud">{t("market.home.sellTitle")}</h2>
                <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-silver">{t("market.home.sellBody")}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-mint group-hover:underline">
                {t("market.home.sellCta")}
                <Icon name="arrowRight" size={20} />
              </span>
            </Link>
            <Link href="/collections/discounts" className="group flex items-center gap-4 rounded-[20px] border border-line bg-surface p-5 transition-colors hover:border-line-strong">
              <div className="grid size-16 shrink-0 place-items-center rounded-[14px] bg-mint text-obsidian">
                <Icon name="tag" size={32} />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold text-cloud">{t("market.home.dealsTitle")}</h2>
                <p className="mt-0.5 text-sm text-silver">{t("market.home.dealsBody", { count: discounted().length })}</p>
              </div>
              <Icon name="chevronRight" size={22} className="ml-auto text-silver group-hover:text-cloud" />
            </Link>
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-line lg:grid-cols-4">
          {trust.map((item) => (
            <li key={item.title} className="flex items-start gap-3 bg-obsidian p-4 md:p-5">
              <Icon name={item.icon} size={28} className="mt-0.5 text-mint" />
              <div>
                <p className="text-sm font-semibold text-cloud md:text-[15px]">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-silver md:text-[13px]">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="mt-16">
        <SectionHeader title={t("market.home.categoriesTitle")} body={t("market.home.categoriesBody")} href="/categories" linkLabel={t("market.home.viewAll")} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Link href={categoryHref(lead)} className="group relative col-span-2 row-span-2 flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[18px] border border-line">
            <ProductArt {...leadProduct.art} variant={3} className="absolute inset-0 size-full transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-transparent" />
            <div className="relative p-6">
              <Icon name={lead.icon as IconName} size={40} className="text-mint" />
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-silver">
                {lead.code} · {t("market.home.productsCount", { count: countInCategory(lead.id) })}
              </p>
              <h3 className="mt-1 font-display text-[30px] font-semibold leading-tight text-cloud">{name(lead)}</h3>
              <p className="mt-1 max-w-[40ch] text-sm text-silver">{lead.description ? (locale === "en" ? lead.description.en : lead.description.id) : null}</p>
            </div>
          </Link>
          {tops.slice(1).map((c, i) => (
            <Link key={c.id} href={categoryHref(c)} className={`${i >= 4 ? "md:col-span-2 " : ""}group flex min-h-[124px] flex-col justify-between gap-4 rounded-[18px] border border-line bg-surface p-4 transition-colors hover:border-mint-line md:p-5`}>
              <div className="flex items-start justify-between">
                <Icon name={c.icon as IconName} size={36} className="text-cloud transition-colors group-hover:text-mint" />
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-silver">{c.code}</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold leading-tight text-cloud">{name(c)}</h3>
                <p className="mt-1 text-xs text-silver">{t("market.home.productsCount", { count: countInCategory(c.id) })}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="mt-16">
        <SectionHeader title={t("market.home.featuredTitle")} body={t("market.home.featuredBody")} href="/collections/featured" linkLabel={t("market.home.viewAll")} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </Container>

      <Container className="mt-16">
        <SectionHeader title={t("market.home.bestTitle")} body={t("market.home.bestBody")} href="/collections/popular" linkLabel={t("market.home.viewAll")} />
        <ol className="grid grid-cols-[minmax(0,1fr)] gap-x-8 md:grid-cols-2 xl:grid-cols-3">
          {best.map((p, i) => (
            <li key={p.slug} className="group relative flex items-center gap-4 border-t border-line py-4">
              <span className="tabular w-12 shrink-0 font-display text-[40px] font-bold leading-none tracking-[-0.04em] text-silver/50 group-hover:text-mint">{String(i + 1).padStart(2, "0")}</span>
              <ProductArt {...p.art} className="h-[68px] w-[90px] shrink-0 rounded-[10px]" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-cloud">
                  <Link href={`/product/${p.slug}`} className="after:absolute after:inset-0">
                    {p.title}
                  </Link>
                </h3>
                <p className="truncate text-[13px] text-silver">
                  {getCreator(p.creator)?.name} · {t("market.product.sold", { count: formatNumber(p.sold, locale) })}
                </p>
                <PriceDisplay price={p.price} salePrice={p.salePrice} size="sm" className="mt-1" />
              </div>
            </li>
          ))}
        </ol>
      </Container>

      <Container className="mt-16">
        <SectionHeader title={t("market.home.newTitle")} body={t("market.home.newBody")} href="/collections/new" linkLabel={t("market.home.viewAll")} className="pr-0 md:pr-28" />
        <ProductCarousel label={t("market.home.newTitle")}>
          {fresh.map((p) => (
            <ProductCard key={p.slug} product={p} className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-[31%] lg:w-[23.6%]" />
          ))}
        </ProductCarousel>
      </Container>

      <Container className="mt-16">
        <SectionHeader title={t("market.home.creatorsTitle")} body={t("market.home.creatorsBody")} href="/creators" linkLabel={t("market.home.viewAll")} />
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {spotlight.map((c) => (
            <CreatorCard key={c.slug} creator={c} t={t} locale={locale} />
          ))}
        </div>
      </Container>

      <Container className="mt-16">
        <section className="relative overflow-hidden rounded-[22px] border border-line bg-surface">
          <div className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,#65e5d0_22%,transparent),transparent_65%)]" aria-hidden />
          <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:p-12">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mint">{t("market.home.joinEyebrow")}</p>
              <h2 className="mt-3 max-w-[18ch] type-page text-cloud">{t("market.home.joinTitle")}</h2>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-silver">{t("market.home.joinBody")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/studio/onboarding" className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-mint px-5 text-[15px] font-semibold text-obsidian hover:bg-[color-mix(in_srgb,#65e5d0_82%,#f4f5f7)]">
                  {t("market.home.joinCta")}
                  <Icon name="arrowRight" size={20} />
                </Link>
                <Link href="/creators" className="inline-flex h-12 items-center gap-2 rounded-[10px] border border-line-strong px-5 text-[15px] font-semibold text-cloud hover:border-cloud">
                  {t("market.home.joinSecondary")}
                </Link>
              </div>
            </div>
            <ol className="grid gap-3">
              {messages.market.home.joinSteps.map((step, i) => (
                <li key={step} className="flex items-center gap-4 rounded-[14px] border border-line bg-obsidian/60 p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-mint-line font-display text-lg font-semibold text-mint">{i + 1}</span>
                  <span className="text-[15px] text-cloud">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Container>
    </>
  );
}
