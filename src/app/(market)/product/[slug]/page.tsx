import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, type IconName } from "@/components/icons/icon";
import { ProductCarousel } from "@/components/market/carousel";
import { ProductCard } from "@/components/market/product-card";
import { ProductGallery, PurchasePanel } from "@/components/market/product-detail";
import { RatingDisplay } from "@/components/market/rating";
import { Container, SectionHeader } from "@/components/market/section";
import { StagingTag } from "@/components/market/staging";
import { formatDate, formatNumber } from "@/i18n/format";
import { getTranslator } from "@/i18n/server";
import {
  categoryHref,
  getCategory,
  getCreator,
  getProduct,
  isNew,
  PRODUCTS,
  productsByCreator,
  ratingFor,
  relatedProducts,
  reviewsFor,
} from "@/lib/market/catalog";

export const dynamicParams = false;
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const { t, locale } = await getTranslator();
  const creator = getCreator(product.creator)!;
  const cat = getCategory(product.category)!;
  const sub = getCategory(product.subcategory)!;
  const rating = ratingFor(product.slug);
  const reviews = reviewsFor(product.slug);
  const related = relatedProducts(product);
  const more = productsByCreator(creator.slug).filter((p) => p.slug !== product.slug).slice(0, 4);
  const name = (c: { name: { id: string; en: string } }) => (locale === "en" ? c.name.en : c.name.id);
  const initials = creator.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  const specs: { label: string; value: string; icon: IconName }[] = [
    { label: t("market.product.formats"), value: product.formats.join(", "), icon: "file" },
    { label: t("market.product.compatibility"), value: product.compatibility.join(", "), icon: "check" },
    {
      label: t("market.product.delivery"),
      value: product.delivery === "instant" ? t("market.product.deliveryInstant") : t("market.product.deliveryManual", { days: product.deliveryDays ?? 7 }),
      icon: product.delivery === "instant" ? "download" : "calendar",
    },
    ...(product.fileSize ? [{ label: t("market.product.fileSize"), value: product.fileSize, icon: "archive" as IconName }] : []),
    { label: t("market.product.version"), value: `${product.version} · ${t("market.product.updated")} ${formatDate(product.updatedAt, locale)}`, icon: "history" },
    { label: t("market.product.availability"), value: t("market.product.available"), icon: "success" },
  ];

  return (
    <>
      <Container className="pt-5">
        <nav aria-label={t("market.product.breadcrumb")} className="flex flex-wrap items-center gap-1.5 text-[13px] text-silver">
          <Link href="/" className="hover:text-cloud">{t("market.nav.home")}</Link>
          <Icon name="chevronRight" size={14} />
          <Link href={categoryHref(cat)} className="hover:text-cloud">{name(cat)}</Link>
          <Icon name="chevronRight" size={14} />
          <Link href={categoryHref(sub)} className="hover:text-cloud">{name(sub)}</Link>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
          <ProductGallery product={product} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StagingTag>{t("market.staging.label")}</StagingTag>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-silver">{product.sku}</span>
              {isNew(product) ? <span className="rounded-md border border-cloud/40 px-2 py-0.5 text-xs font-semibold text-cloud">{t("market.product.new")}</span> : null}
            </div>
            <h1 className="mt-3 font-display text-[clamp(28px,1.3rem+1.6vw,44px)] font-semibold leading-[1.06] tracking-[-0.03em] text-cloud">{product.title}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-silver">{product.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              {rating ? (
                <a href="#reviews" className="hover:underline">
                  <RatingDisplay average={rating.average} count={rating.count} size={18} label={t("market.product.rating", { rating: rating.average.toFixed(1) })} countLabel={t("market.product.reviews", { count: rating.count })} />
                </a>
              ) : (
                <span className="text-[13px] text-silver">{t("market.product.noReviews")}</span>
              )}
              <span className="text-[13px] text-silver">{t("market.product.sold", { count: formatNumber(product.sold, locale) })}</span>
            </div>

            <Link href={`/c/${creator.slug}`} className="group mt-5 flex items-center gap-3 rounded-[14px] border border-line p-3 hover:border-line-strong">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-graphite font-display font-semibold text-cloud">{initials}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-cloud group-hover:underline">{creator.name}</span>
                <span className="block truncate text-[13px] text-silver">{creator.tagline}</span>
              </span>
              <span className="hidden shrink-0 text-sm font-semibold text-mint sm:inline">{t("market.product.visitStore")}</span>
              <Icon name="chevronRight" size={20} className="text-silver" />
            </Link>

            <div className="mt-5">
              <PurchasePanel product={product} />
            </div>
            <p className="mt-3 text-[13px] text-silver">{t("market.staging.productNote")}</p>
          </div>
        </div>
      </Container>

      <Container className="mt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
          <div className="space-y-10">
            <section>
              <h2 className="type-section text-cloud">{t("market.product.description")}</h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-cloud/90">
                {product.description.map((para) => <p key={para}>{para}</p>)}
              </div>
              <h3 className="mt-8 font-display text-lg font-semibold text-cloud">{t("market.product.includes")}</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[15px] text-cloud">
                    <Icon name="check" size={20} className="text-mint" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="rounded-full border border-line-strong px-3 py-1 text-[13px] text-silver hover:border-cloud hover:text-cloud">
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>

            <section id="reviews" className="scroll-mt-40">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="type-section text-cloud">{t("market.product.reviewsTitle")}</h2>
                {rating ? <RatingDisplay average={rating.average} count={rating.count} size={20} label={t("market.product.rating", { rating: rating.average.toFixed(1) })} countLabel={t("market.product.reviews", { count: rating.count })} /> : null}
              </div>
              <p className="mt-2 text-[13px] text-silver">
                {reviews.length ? `${t("market.product.reviewsStaging")} ` : null}
                {t("market.product.reviewEligibility")}
              </p>
              {reviews.length ? (
                <ul className="mt-5 divide-y divide-line border-y border-line">
                  {reviews.map((r) => (
                    <li key={r.author + r.createdAt} className="py-5">
                      <div className="flex items-center gap-3">
                        <span className="flex gap-0.5" aria-label={t("market.product.rating", { rating: r.rating })}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Icon key={n} name="star" size={16} className={n <= r.rating ? "fill-mint text-mint" : "text-silver/40"} />
                          ))}
                        </span>
                        <span className="text-sm font-semibold text-cloud">{r.author}</span>
                        <span className="text-[13px] text-silver">{formatDate(r.createdAt, locale)}</span>
                      </div>
                      <p className="mt-2 text-[15px] leading-relaxed text-cloud/90">{r.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-[14px] border border-dashed border-line-strong p-6 text-center text-sm text-silver">{t("market.product.noReviews")}</p>
              )}
            </section>
          </div>

          <aside>
            <section className="rounded-[18px] border border-line bg-surface p-5 md:p-6">
              <h2 className="font-display text-xl font-semibold text-cloud">{t("market.product.specs")}</h2>
              <dl className="mt-4 divide-y divide-line">
                <div className="flex gap-3 py-3">
                  <Icon name="folder" size={22} className="mt-0.5 shrink-0 text-silver" />
                  <div className="min-w-0">
                    <dt className="text-[13px] text-silver">{t("market.product.category")}</dt>
                    <dd className="mt-0.5 text-[15px] text-cloud">{name(cat)} / {name(sub)}</dd>
                  </div>
                </div>
                {specs.map((s) => (
                  <div key={s.label} className="flex gap-3 py-3">
                    <Icon name={s.icon} size={22} className="mt-0.5 shrink-0 text-silver" />
                    <div className="min-w-0">
                      <dt className="text-[13px] text-silver">{s.label}</dt>
                      <dd className="mt-0.5 text-[15px] text-cloud">{s.value}</dd>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 py-3">
                  <Icon name="tag" size={22} className="mt-0.5 shrink-0 text-silver" />
                  <div>
                    <dt className="text-[13px] text-silver">{t("market.product.sku")}</dt>
                    <dd className="mt-0.5 font-mono text-sm text-cloud">{product.sku}</dd>
                  </div>
                </div>
              </dl>
              <p className="mt-4 flex items-center gap-2 text-[13px] text-silver">
                <Icon name="warning" size={18} />
                {t("market.product.report")} · <span className="font-mono text-[10px] uppercase tracking-wider">{t("market.footer.soon")}</span>
              </p>
            </section>
          </aside>
        </div>
      </Container>

      {more.length ? (
        <Container className="mt-16">
          <SectionHeader title={t("market.product.moreFromCreator", { name: creator.name })} href={`/c/${creator.slug}`} linkLabel={t("market.product.visitStore")} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {more.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </Container>
      ) : null}

      {related.length ? (
        <Container className="mt-16">
          <SectionHeader title={t("market.product.related")} className="md:pr-28" />
          <ProductCarousel label={t("market.product.related")}>
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-[31%] lg:w-[23.6%]" />
            ))}
          </ProductCarousel>
        </Container>
      ) : null}
    </>
  );
}
