"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/client";
import { formatMoney } from "@/i18n/format";
import { licensePrice, type LicenseId, type Product } from "@/lib/market/catalog";
import { ProductArt } from "./product-art";
import { market, useMarket } from "./store";
import { WishlistButton } from "./product-card";

export function ProductGallery({ product }: { product: Product }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const variants = [0, 1, 2, 3];
  return (
    <section aria-label={t("market.product.gallery")}>
      <div className="relative overflow-hidden rounded-[18px] border border-line bg-graphite">
        <ProductArt {...product.art} variant={variants[index]} className="aspect-[4/3] w-full" label={t("market.product.previewOf", { n: index + 1 })} />
        <span className="absolute bottom-3 left-3 rounded border border-dashed border-silver/60 bg-obsidian/70 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-silver backdrop-blur">
          {t("market.staging.short")}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 md:gap-3">
        {variants.map((v, i) => (
          <button
            key={v}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={t("market.product.previewOf", { n: i + 1 })}
            aria-pressed={i === index}
            className={cn("overflow-hidden rounded-[10px] border-2 transition-colors", i === index ? "border-mint" : "border-transparent opacity-70 hover:opacity-100")}
          >
            <ProductArt {...product.art} variant={v} className="aspect-[4/3] w-full" />
          </button>
        ))}
      </div>
    </section>
  );
}

export function PurchasePanel({ product }: { product: Product }) {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const { cart } = useMarket();
  const [license, setLicense] = useState<LicenseId>(product.licenses[0]);
  const inCart = cart.some((l) => l.slug === product.slug && l.license === license);
  const price = licensePrice(product, license);
  const full = product.price * (licensePrice(product, license) / (product.salePrice ?? product.price));

  return (
    <div className="rounded-[18px] border border-line bg-surface p-5 md:p-6">
      <fieldset>
        <legend className="mb-3 font-display text-[15px] font-semibold text-cloud">{t("market.product.license")}</legend>
        <div className="grid gap-2">
          {product.licenses.map((l) => (
            <label
              key={l}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-[12px] border p-3.5 transition-colors",
                license === l ? "border-mint bg-mint-tint" : "border-line-strong hover:border-cloud/50",
              )}
            >
              <input type="radio" name="license" value={l} checked={license === l} onChange={() => setLicense(l)} className="mt-1 size-[18px] shrink-0 accent-[#65e5d0]" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-cloud">{t(`market.product.licenses.${l}`)}</span>
                  <span className="tabular font-semibold text-cloud">{formatMoney(licensePrice(product, l))}</span>
                </span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-silver">{t(`market.product.licenses.${l}Body`)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="tabular font-display text-[34px] font-semibold leading-none tracking-[-0.02em] text-cloud">{formatMoney(price)}</span>
        {product.salePrice ? <s className="tabular text-silver">{formatMoney(full)}</s> : null}
      </div>

      <div className="mt-5 grid gap-2.5">
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => {
              market.addToCart(product.slug, license);
              toast.show(t("market.product.added", { title: product.title }), { tone: "success" });
            }}
            className={cn(
              "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] border text-[15px] font-semibold transition-colors",
              inCart ? "border-mint-line bg-mint-tint text-mint" : "border-line-strong text-cloud hover:border-cloud",
            )}
          >
            <Icon name={inCart ? "check" : "cart"} size={22} />
            {inCart ? t("market.product.inCart") : t("market.product.addToCart")}
          </button>
          <WishlistButton slug={product.slug} className="size-12 rounded-[10px] bg-transparent" size={22} />
        </div>
        <button
          type="button"
          onClick={() => {
            market.addToCart(product.slug, license);
            router.push("/checkout");
          }}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-mint text-[15px] font-semibold text-obsidian hover:bg-[color-mix(in_srgb,#65e5d0_82%,#f4f5f7)]"
        >
          {t("market.product.buyNow")}
          <Icon name="arrowRight" size={20} />
        </button>
      </div>

      <p className="mt-4 flex gap-2.5 text-[13px] leading-relaxed text-silver">
        <Icon name="lock" size={18} className="mt-0.5 shrink-0 text-mint" />
        {t("market.product.secureFiles")}
      </p>
    </div>
  );
}
