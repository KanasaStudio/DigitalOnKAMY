"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/i18n/client";
import { formatMoney } from "@/i18n/format";
import { effectivePrice, getCreator, getProduct, HOMEPAGE } from "@/lib/market/catalog";
import { ProductArt } from "./product-art";

/** Admin-managed campaign banner (HOMEPAGE.campaigns stands in for the CMS). Manual navigation only, no autoplay. */
export function PromoBanner() {
  const { t } = useI18n();
  const slides = HOMEPAGE.campaigns;
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const product = getProduct(slide.productSlug);
  const go = (d: number) => setIndex((i) => (i + d + slides.length) % slides.length);

  return (
    <section aria-roledescription="carousel" aria-label={t("market.home.slide", { n: index + 1, total: slides.length })} className="relative overflow-hidden rounded-[20px] border border-line bg-surface">
      <div key={slide.id} className="grid min-h-[340px] animate-fade-in md:grid-cols-[1.05fr_1fr] lg:min-h-[380px]">
        <div className="relative z-10 flex flex-col justify-center gap-4 p-6 pb-20 md:p-10 md:pb-20 lg:p-12 lg:pb-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mint">
            {slide.code}
            {slide.period ? <span className="text-silver"> · {slide.period}</span> : null}
          </p>
          <h1 className="max-w-[19ch] font-display text-[clamp(30px,1.3rem+2.2vw,52px)] font-bold leading-[1.02] tracking-[-0.035em] text-cloud">{slide.title}</h1>
          <p className="max-w-[44ch] text-[15px] leading-relaxed text-silver md:text-base">{slide.body}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href={slide.href} className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-mint px-5 text-[15px] font-semibold text-obsidian hover:bg-[color-mix(in_srgb,#65e5d0_82%,#f4f5f7)]">
              {slide.cta}
              <Icon name="arrowRight" size={20} />
            </Link>
          </div>
        </div>
        <div className="relative hidden min-h-[260px] md:block" aria-hidden>
          <div className="absolute inset-y-8 right-8 left-4">
            <div className="absolute right-16 top-0 w-[58%] rotate-[-6deg] overflow-hidden rounded-[14px] border border-line-strong opacity-60 shadow-2xl">
              <ProductArt kind={slide.kind} hue={slide.hue} seed={index * 13 + 5} variant={1} className="aspect-[4/3] w-full" />
            </div>
            <div className="absolute bottom-6 left-0 w-[72%] rotate-[3deg] overflow-hidden rounded-[16px] border border-line-strong shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
              {product ? <ProductArt {...product.art} className="aspect-[4/3] w-full" /> : null}
            </div>
            {product ? (
              <div className="absolute bottom-0 right-0 w-56 rounded-[14px] border border-line-strong bg-graphite/95 p-4 backdrop-blur">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-silver">{product.sku}</p>
                <p className="mt-1 line-clamp-2 font-semibold leading-snug text-cloud">{product.title}</p>
                <p className="mt-0.5 text-xs text-silver">{t("market.product.by", { name: getCreator(product.creator)?.name ?? "" })}</p>
                <p className="tabular mt-3 font-display text-xl font-semibold text-mint">{formatMoney(effectivePrice(product))}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 left-6 flex items-center gap-3 md:left-10 lg:left-12">
        <button type="button" onClick={() => go(-1)} aria-label={t("market.home.prevSlide")} className="grid size-10 place-items-center rounded-full border border-line-strong text-cloud hover:border-cloud">
          <Icon name="chevronLeft" size={20} />
        </button>
        <div className="flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("market.home.slide", { n: i + 1, total: slides.length })}
              aria-current={i === index}
              className={cn("h-1.5 rounded-full transition-all", i === index ? "w-8 bg-mint" : "w-3 bg-cloud/30 hover:bg-cloud/60")}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label={t("market.home.nextSlide")} className="grid size-10 place-items-center rounded-full border border-line-strong text-cloud hover:border-cloud">
          <Icon name="chevronRight" size={20} />
        </button>
      </div>
    </section>
  );
}
