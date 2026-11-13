import Link from "next/link";
import { Icon, type IconName } from "@/components/icons/icon";
import { getCategory, productsByCreator, type Creator } from "@/lib/market/catalog";
import type { Locale, Translate } from "@/i18n/core";
import { ProductArt } from "./product-art";

export function CreatorCard({ creator, t, locale }: { creator: Creator; t: Translate; locale: Locale }) {
  const products = productsByCreator(creator.slug);
  const cover = products[0];
  const initials = creator.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <article className="group relative overflow-hidden rounded-[14px] border border-line bg-surface transition-colors hover:border-line-strong">
      <div className="h-24 overflow-hidden">{cover ? <ProductArt {...cover.art} variant={2} className="size-full opacity-80" /> : null}</div>
      <div className="px-4 pb-4">
        <span className="-mt-7 grid size-14 place-items-center rounded-full border-4 border-surface bg-graphite font-display text-lg font-semibold text-cloud">{initials}</span>
        <h3 className="mt-2 font-display text-lg font-semibold text-cloud">
          <Link href={`/c/${creator.slug}`} className="after:absolute after:inset-0">
            {creator.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-silver">{creator.tagline}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {creator.specialties.map((s) => {
            const c = getCategory(s);
            return c ? (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-md bg-graphite px-2 py-1 text-xs text-cloud">
                <Icon name={c.icon as IconName} size={16} className="text-mint" />
                {locale === "en" ? c.name.en : c.name.id}
              </span>
            ) : null;
          })}
        </div>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-silver">
          {t("market.creators.products", { count: products.length })} · {creator.location}
        </p>
      </div>
    </article>
  );
}
