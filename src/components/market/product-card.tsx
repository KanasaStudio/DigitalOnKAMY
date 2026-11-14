"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/client";
import { formatNumber } from "@/i18n/format";
import { getCategory, getCreator, isNew, ratingFor, type Product } from "@/lib/market/catalog";
import { PriceDisplay } from "./price";
import { ProductArt } from "./product-art";
import { RatingDisplay } from "./rating";
import { sound } from "@/lib/sound/sound-manager";
import { market, useMarket } from "./store";

export function WishlistButton({ slug, className, size = 20 }: { slug: string; className?: string; size?: number }) {
  const { t } = useI18n();
  const toast = useToast();
  const { wishlist } = useMarket();
  const saved = wishlist.includes(slug);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t("market.product.wishlistRemove") : t("market.product.wishlistAdd")}
      onClick={() => {
        if (market.toggleWishlist(slug)) {
          sound.play("click-secondary");
          toast.show(t("market.product.wishlistAdded"), { tone: "success" });
        }
      }}
      className={cn(
        "grid size-10 place-items-center rounded-full border border-line-strong bg-obsidian/70 text-cloud backdrop-blur transition-[border-color,color,background-color,transform] duration-[var(--duration-micro)] hover:border-cloud active:scale-90",
        saved && "border-mint-line text-mint",
        className,
      )}
    >
      <Icon key={saved ? "on" : "off"} name="heart" size={size} className={cn("transition-[fill] duration-[var(--duration-button)]", saved ? "animate-heart-pop fill-mint" : "fill-transparent")} />
    </button>
  );
}

export function ProductCard({ product, className, priority, style }: { product: Product; className?: string; priority?: "dense" | "roomy"; style?: CSSProperties }) {
  const { t, locale } = useI18n();
  const toast = useToast();
  const { cart } = useMarket();
  const creator = getCreator(product.creator);
  const sub = getCategory(product.subcategory);
  const rating = ratingFor(product.slug);
  const inCart = cart.some((l) => l.slug === product.slug);
  const service = product.delivery === "manual";

  return (
    <article style={style} className={cn("group relative flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface transition-[border-color,background-color,transform] duration-[var(--duration-product)] ease-[var(--ease-out-quiet)] hover:border-line-strong hover:bg-[color-mix(in_srgb,#202631_62%,#090b0f)] pointer-coarse:active:scale-[0.985]", className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-graphite">
        <ProductArt {...product.art} className="size-full transition-transform duration-[var(--duration-reveal)] ease-[var(--ease-out-quiet)] group-hover:scale-[1.035]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.salePrice ? <span className="rounded-md bg-mint px-2 py-1 text-xs font-bold text-obsidian">-{Math.round((1 - product.salePrice / product.price) * 100)}%</span> : null}
          {isNew(product) ? <span className="rounded-md border border-cloud/40 bg-obsidian/75 px-2 py-1 text-xs font-semibold text-cloud backdrop-blur">{t("market.product.new")}</span> : null}
          {service ? <span className="rounded-md border border-cloud/40 bg-obsidian/75 px-2 py-1 text-xs font-semibold text-cloud backdrop-blur">{t("market.product.service")}</span> : null}
        </div>
        <WishlistButton slug={product.slug} className="absolute right-3 top-3 z-10 pointer-fine:opacity-80 pointer-fine:group-hover:opacity-100 focus-visible:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-silver">{sub ? (locale === "en" ? sub.name.en : sub.name.id) : null}</p>
        <h3 className={cn("line-clamp-2 font-semibold leading-snug text-cloud", priority === "roomy" ? "text-[18px]" : "text-[15px] sm:text-base")}>
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[a:focus-visible]:underline">
            {product.title}
          </Link>
        </h3>
        <p className="truncate text-[13px] text-silver">{creator ? t("market.product.by", { name: creator.name }) : null}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {rating ? <RatingDisplay average={rating.average} count={rating.count} label={t("market.product.rating", { rating: rating.average.toFixed(1) })} countLabel={t("market.product.reviews", { count: rating.count })} /> : null}
          <span className="text-[13px] text-silver">{t("market.product.sold", { count: formatNumber(product.sold, locale) })}</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <PriceDisplay price={product.price} salePrice={product.salePrice} from={service ? t("market.product.startingFrom") : undefined} />
          <button
            type="button"
            onClick={() => {
              market.addToCart(product.slug, product.licenses[0]);
              sound.play("add-to-cart");
              toast.show(t("market.product.added", { title: product.title }), { tone: "success" });
            }}
            aria-label={inCart ? t("market.product.inCart") : `${t("market.product.addToCart")}: ${product.title}`}
            className={cn(
              "relative z-10 grid size-10 shrink-0 place-items-center rounded-[10px] border transition-[border-color,color,background-color,transform] duration-[var(--duration-button)] active:scale-90",
              inCart ? "border-mint-line bg-mint-tint text-mint" : "border-line-strong text-cloud hover:border-mint-line hover:text-mint pointer-fine:group-hover:border-cloud/40",
            )}
          >
            <Icon key={inCart ? "in" : "out"} name={inCart ? "check" : "cart"} size={22} className="animate-fade-in" />
          </button>
        </div>
      </div>
    </article>
  );
}
