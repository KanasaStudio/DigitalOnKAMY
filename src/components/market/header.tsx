"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound/sound-manager";
import { KamyWordmark } from "@/components/brand/logo";
import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/i18n/client";
import { categoryHref, countInCategory, subcategoriesOf, topCategories } from "@/lib/market/catalog";
import { SearchPanel } from "./search-panel";
import { useMarket } from "./store";

function HeaderAction({ href, icon, label, count }: { href: string; icon: IconName; label: string; count?: number }) {
  return (
    <Link href={href} data-sfx-hover aria-label={count ? `${label} (${count})` : label} className="group/ha relative grid size-11 place-items-center rounded-full text-cloud transition-colors duration-[var(--duration-micro)] hover:bg-cloud-hover active:scale-95">
      <Icon name={icon} size={26} className="transition-transform duration-[var(--duration-micro)] group-hover/ha:-translate-y-px" />
      {count ? (
        <span key={count} className="tabular absolute right-0.5 top-0.5 grid h-5 min-w-5 animate-count-bump place-items-center rounded-full bg-mint px-1 text-[11px] font-bold text-obsidian" aria-hidden>
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function MarketHeader() {
  const { t } = useI18n();
  const { cart, wishlist } = useMarket();
  const ref = useRef<HTMLElement>(null);

  // Header keeps its height; only its surface firms up once the page scrolls.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      ref.current?.toggleAttribute("data-scrolled", window.scrollY > 8);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      ref={ref}
      className="sticky top-0 z-40 border-b border-transparent bg-obsidian/70 backdrop-blur-sm transition-[background-color,border-color,box-shadow,backdrop-filter] duration-[var(--duration-panel)] ease-[var(--ease-standard)] data-[scrolled]:border-line data-[scrolled]:bg-obsidian/92 data-[scrolled]:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.9)] data-[scrolled]:backdrop-blur-md"
    >
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center gap-3 px-4 md:gap-6 md:px-6">
        <Link href="/" aria-label={t("market.header.home")} className="shrink-0">
          <KamyWordmark height={22} />
        </Link>
        <SearchPanel className="hidden flex-1 md:block" />
        <nav className="ml-auto flex items-center gap-1 md:ml-0" aria-label="KAMY">
          <Link href="/studio/overview" data-sfx="transition" data-sfx-hover className="mr-2 hidden h-11 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold text-silver hover:bg-cloud-hover hover:text-cloud xl:inline-flex">
            <Icon name="store" size={22} />
            {t("market.header.sell")}
          </Link>
          <HeaderAction href="/wishlist" icon="heart" label={t("market.header.wishlist")} count={wishlist.length} />
          <HeaderAction href="/cart" icon="cart" label={t("market.header.cart")} count={cart.length} />
          <Link href="/sign-in" data-sfx="click-primary" data-sfx-hover className="cta cta-primary ml-2 hidden h-11 items-center gap-2 rounded-[10px] bg-mint px-4 text-sm font-semibold text-obsidian sm:inline-flex">
            {t("market.header.signIn")}
            <Icon name="arrowRight" size={18} />
          </Link>
        </nav>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <SearchPanel compact />
      </div>
      <CategoryNav />
    </header>
  );
}

function CategoryNav() {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const wrap = useRef<HTMLDivElement>(null);
  const tops = topCategories();
  const name = (c: { name: { id: string; en: string } }) => (locale === "en" ? c.name.en : c.name.id);

  // Close the mega menu when navigating.
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative border-t border-line">
      <div className="mx-auto flex max-w-[1320px] items-center gap-1 overflow-x-auto px-2 no-scrollbar md:px-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="kamy-mega"
          data-sfx-hover
          onClick={() => {
            if (!open) sound.play("panel-open");
            setOpen((v) => !v);
            setOpenedAt(pathname);
          }}
          className={cn("hidden h-12 shrink-0 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition-colors md:inline-flex", open ? "text-mint" : "text-cloud hover:bg-cloud-hover")}
        >
          <Icon name="menu" size={22} />
          {t("market.header.allCategories")}
          <Icon name="chevronDown" size={18} className={cn("transition-transform", open && "rotate-180")} />
        </button>
        <Link href="/categories" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold text-cloud hover:bg-cloud-hover md:hidden">
          <Icon name="grid" size={22} />
          {t("market.nav.categories")}
        </Link>
        <span className="mx-1 hidden h-6 w-px bg-line md:block" aria-hidden />
        {tops.map((c) => {
          const active = pathname?.startsWith(`/category/${c.id}`);
          return (
            <Link
              key={c.id}
              href={categoryHref(c)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group/cat relative inline-flex h-12 shrink-0 items-center gap-2 rounded-[10px] px-3 text-sm font-medium transition-colors duration-[var(--duration-micro)]",
                "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:rounded-full after:transition-transform after:duration-[var(--duration-dropdown)] after:ease-[var(--ease-out-quiet)]",
                active ? "text-mint after:scale-x-100 after:bg-mint" : "text-silver after:scale-x-0 after:bg-cloud/50 hover:text-cloud hover:after:scale-x-100",
              )}
            >
              <Icon name={c.icon as IconName} size={22} className="transition-transform duration-[var(--duration-micro)] group-hover/cat:-translate-y-px" />
              {name(c)}
            </Link>
          );
        })}
      </div>
      {open ? (
        <div id="kamy-mega" className="absolute inset-x-0 top-full z-50 animate-panel-in border-b border-line-strong bg-graphite shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-x-6 gap-y-8 px-6 py-8 lg:grid-cols-4 xl:grid-cols-7">
            {tops.map((c) => (
              <div key={c.id}>
                <Link href={categoryHref(c)} className="group flex flex-col gap-3">
                  <Icon name={c.icon as IconName} size={34} className="text-mint transition-transform duration-[var(--duration-product)] ease-[var(--ease-out-quiet)] group-hover:-translate-y-0.5" />
                  <span className="font-display text-[17px] font-semibold leading-tight text-cloud group-hover:underline">{name(c)}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-silver">{t("market.home.productsCount", { count: countInCategory(c.id) })}</span>
                </Link>
                <ul className="mt-4 space-y-1">
                  {subcategoriesOf(c.id).map((s) => (
                    <li key={s.id}>
                      <Link href={categoryHref(s)} className="block py-1 text-sm text-silver hover:text-cloud">
                        {name(s)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MobileTabBar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { cart } = useMarket();
  const items: { href: string; icon: IconName; label: string; match: (p: string) => boolean; count?: number }[] = [
    { href: "/", icon: "home", label: t("market.nav.home"), match: (p) => p === "/" },
    { href: "/categories", icon: "grid", label: t("market.nav.categories"), match: (p) => p.startsWith("/categor") },
    { href: "/search", icon: "search", label: t("market.nav.search"), match: (p) => p.startsWith("/search") || p.startsWith("/products") },
    { href: "/cart", icon: "cart", label: t("market.nav.cart"), match: (p) => p.startsWith("/cart") || p.startsWith("/checkout"), count: cart.length },
    { href: "/sign-in", icon: "user", label: t("market.nav.account"), match: (p) => p.startsWith("/sign") },
  ];
  return (
    <nav aria-label={t("market.header.home")} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-obsidian/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.match(pathname ?? "/");
          return (
            <li key={it.href}>
              <Link href={it.href} aria-current={active ? "page" : undefined} className={cn("relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-[color,transform] duration-[var(--duration-micro)] active:scale-95", active ? "text-mint" : "text-silver")}>
                <Icon name={it.icon} size={25} />
                {it.label}
                {it.count ? <span key={it.count} className="animate-count-bump tabular absolute left-[calc(50%+6px)] top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-mint px-1 text-[10px] font-bold text-obsidian">{it.count}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
