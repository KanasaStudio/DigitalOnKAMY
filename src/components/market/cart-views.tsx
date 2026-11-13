"use client";

import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { useI18n } from "@/i18n/client";
import { formatMoney } from "@/i18n/format";
import { getCreator, getProduct, LICENSE_MULTIPLIER, licensePrice, type LicenseId, type Product } from "@/lib/market/catalog";
import { ProductArt } from "./product-art";
import { ProductCard } from "./product-card";
import { market, useMarket } from "./store";

function useLines() {
  const { cart } = useMarket();
  return cart.map((l) => ({ ...l, product: getProduct(l.slug) })).filter((l): l is { slug: string; license: LicenseId; product: Product } => Boolean(l.product));
}

function totals(lines: ReturnType<typeof useLines>) {
  const total = lines.reduce((s, l) => s + licensePrice(l.product, l.license), 0);
  const full = lines.reduce((s, l) => s + l.product.price * LICENSE_MULTIPLIER[l.license], 0);
  return { total, full, saved: full - total };
}

function Empty({ icon, title, body }: { icon: "cart" | "heart"; title: string; body: string }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center rounded-[18px] border border-dashed border-line-strong px-6 py-16 text-center">
      <Icon name={icon} size={44} className="text-silver" />
      <h2 className="mt-4 font-display text-xl font-semibold text-cloud">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-silver">{body}</p>
      <Link href="/products" className="mt-6 inline-flex h-11 items-center gap-2 rounded-[10px] bg-mint px-5 text-sm font-semibold text-obsidian">
        {t("market.cart.browse")}
        <Icon name="arrowRight" size={18} />
      </Link>
    </div>
  );
}

function Summary({ lines, action }: { lines: ReturnType<typeof useLines>; action: React.ReactNode }) {
  const { t } = useI18n();
  const { total, full, saved } = totals(lines);
  return (
    <aside className="h-fit rounded-[18px] border border-line bg-surface p-5 lg:sticky lg:top-[150px]">
      <h2 className="font-display text-xl font-semibold text-cloud">{t("market.cart.summary")}</h2>
      <dl className="mt-4 space-y-2.5 text-[15px]">
        <div className="flex justify-between text-silver">
          <dt>{t("market.cart.subtotal")} · {t("market.cart.items", { count: lines.length })}</dt>
          <dd className="tabular">{formatMoney(full)}</dd>
        </div>
        {saved > 0 ? (
          <div className="flex justify-between text-mint">
            <dt>{t("market.cart.discount")}</dt>
            <dd className="tabular">−{formatMoney(saved)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-line pt-3 font-semibold text-cloud">
          <dt>{t("market.cart.total")}</dt>
          <dd className="tabular font-display text-2xl">{formatMoney(total)}</dd>
        </div>
      </dl>
      <div className="mt-5">{action}</div>
      <p className="mt-4 text-xs leading-relaxed text-silver">{t("market.cart.note")}</p>
    </aside>
  );
}

function Line({ line, editable }: { line: ReturnType<typeof useLines>[number]; editable: boolean }) {
  const { t } = useI18n();
  const p = line.product;
  return (
    <li className="flex gap-4 py-5">
      <Link href={`/product/${p.slug}`} className="shrink-0">
        <ProductArt {...p.art} className="h-20 w-[106px] rounded-[10px] md:h-24 md:w-32" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/product/${p.slug}`} className="line-clamp-2 font-semibold text-cloud hover:underline">{p.title}</Link>
            <p className="text-[13px] text-silver">{getCreator(p.creator)?.name}</p>
          </div>
          <p className="tabular shrink-0 font-semibold text-cloud">{formatMoney(licensePrice(p, line.license))}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {editable && p.licenses.length > 1 ? (
            <label className="relative">
              <span className="sr-only">{t("market.cart.license")}</span>
              <select value={line.license} onChange={(e) => market.setLicense(p.slug, e.target.value as LicenseId)} className="h-9 appearance-none rounded-lg border border-line-strong bg-obsidian pl-3 pr-8 text-[13px] text-cloud">
                {p.licenses.map((l) => <option key={l} value={l}>{t("market.cart.license")}: {t(`market.product.licenses.${l}`)}</option>)}
              </select>
              <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-silver" />
            </label>
          ) : (
            <span className="text-[13px] text-silver">{t("market.cart.license")}: {t(`market.product.licenses.${line.license}`)}</span>
          )}
          {editable ? (
            <button type="button" onClick={() => market.removeFromCart(p.slug)} aria-label={t("market.cart.remove", { title: p.title })} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-[13px] text-silver hover:bg-cloud-hover hover:text-cloud">
              <Icon name="delete" size={18} />
              {t("common.remove")}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function CartView() {
  const { t } = useI18n();
  const lines = useLines();
  return (
    <>
      <h1 className="type-page text-cloud">{t("market.cart.title")}</h1>
      <div className="mt-8">
        {lines.length === 0 ? (
          <Empty icon="cart" title={t("market.cart.empty")} body={t("market.cart.emptyBody")} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <ul className="divide-y divide-line border-y border-line">{lines.map((l) => <Line key={l.slug} line={l} editable />)}</ul>
            <Summary
              lines={lines}
              action={
                <Link href="/checkout" className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-mint text-[15px] font-semibold text-obsidian">
                  {t("market.cart.checkout")}
                  <Icon name="arrowRight" size={20} />
                </Link>
              }
            />
          </div>
        )}
      </div>
    </>
  );
}

export function WishlistView() {
  const { t } = useI18n();
  const { wishlist } = useMarket();
  const products = wishlist.map(getProduct).filter((p): p is Product => Boolean(p));
  return (
    <>
      <h1 className="type-page text-cloud">{t("market.wishlist.title")}</h1>
      <div className="mt-8">
        {products.length === 0 ? (
          <Empty icon="heart" title={t("market.wishlist.empty")} body={t("market.wishlist.emptyBody")} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
        )}
      </div>
    </>
  );
}

export function CheckoutView() {
  const { t } = useI18n();
  const lines = useLines();
  const { total } = totals(lines);
  return (
    <>
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-silver hover:text-cloud">
        <Icon name="arrowLeft" size={18} />
        {t("market.checkout.backToCart")}
      </Link>
      <h1 className="mt-3 type-page text-cloud">{t("market.checkout.title")}</h1>
      <div className="mt-8">
        {lines.length === 0 ? (
          <Empty icon="cart" title={t("market.cart.empty")} body={t("market.cart.emptyBody")} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-[18px] border border-line p-5">
                <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-cloud">
                  <Icon name="user" size={24} className="text-mint" />
                  {t("market.checkout.account")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-silver">{t("market.checkout.accountBody")}</p>
              </section>
              <section className="rounded-[18px] border border-line p-5">
                <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-cloud">
                  <Icon name="card" size={24} className="text-mint" />
                  {t("market.checkout.paymentTitle")}
                </h2>
                <div role="status" className="mt-4 flex gap-3 rounded-[12px] bg-graphite p-4 shadow-[inset_3px_0_0_#65e5d0]">
                  <Icon name="info" size={22} className="mt-0.5 shrink-0 text-mint" />
                  <div>
                    <p className="font-semibold text-cloud">{t("market.checkout.paymentDisabled")}</p>
                    <p className="mt-1 text-sm leading-relaxed text-silver">{t("market.checkout.paymentDisabledBody")}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-silver">{t("market.checkout.delivery")}</p>
              </section>
              <ul className="divide-y divide-line border-y border-line">{lines.map((l) => <Line key={l.slug} line={l} editable={false} />)}</ul>
            </div>
            <Summary
              lines={lines}
              action={
                <button type="button" disabled aria-describedby="pay-disabled" className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[10px] bg-mint text-[15px] font-semibold text-obsidian opacity-45">
                  <Icon name="lock" size={20} />
                  {t("market.checkout.pay", { amount: formatMoney(total) })}
                </button>
              }
            />
            <span id="pay-disabled" className="sr-only">{t("market.checkout.paymentDisabled")}</span>
          </div>
        )}
      </div>
    </>
  );
}
