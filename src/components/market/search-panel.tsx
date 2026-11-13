"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/i18n/client";
import { formatMoney } from "@/i18n/format";
import { categoryHref, HOMEPAGE, suggest } from "@/lib/market/catalog";
import { ProductArt } from "./product-art";
import { market, useMarket } from "./store";

type Option = { key: string; href: string; node: React.ReactNode; group: string };

/** Search-first header input with a suggestions panel (combobox + listbox pattern). */
export function SearchPanel({ initialQuery = "", className, autoFocus, compact }: { initialQuery?: string; className?: string; autoFocus?: boolean; compact?: boolean }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { recent } = useMarket();
  const [q, setQ] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const options = useMemo<Option[]>(() => {
    const term = q.trim();
    if (!term) {
      return [
        ...recent.map((r) => ({ key: `r-${r}`, group: t("market.search.recent"), href: `/search?q=${encodeURIComponent(r)}`, node: <><Icon name="history" size={18} className="text-silver" />{r}</> })),
        ...HOMEPAGE.trendingSearches.map((s) => ({ key: `p-${s}`, group: t("market.search.popular"), href: `/search?q=${encodeURIComponent(s)}`, node: <><Icon name="trending" size={18} className="text-silver" />{s}</> })),
      ];
    }
    const list: Option[] = suggest(term).map((s) => {
      if (s.type === "category") {
        return { key: `c-${s.id}`, group: t("market.search.categories"), href: categoryHref(s), node: <><Icon name="folder" size={18} className="text-silver" />{locale === "en" ? s.name.en : s.name.id}</> };
      }
      if (s.type === "creator") {
        return { key: `m-${s.slug}`, group: t("market.search.creators"), href: `/c/${s.slug}`, node: <><Icon name="store" size={18} className="text-silver" />{s.name}</> };
      }
      return {
        key: `p-${s.slug}`,
        group: t("market.search.products"),
        href: `/product/${s.slug}`,
        node: (
          <>
            <ProductArt {...s.art} className="h-9 w-12 shrink-0 rounded-md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-cloud">{s.title}</span>
              <span className="block truncate text-xs text-silver">{s.creator}</span>
            </span>
            <span className="tabular shrink-0 text-[13px] font-semibold text-cloud">{formatMoney(s.price)}</span>
          </>
        ),
      };
    });
    list.push({ key: "all", group: "", href: `/search?q=${encodeURIComponent(term)}`, node: <><Icon name="search" size={18} className="text-mint" /><span className="text-mint">{t("market.search.viewAll", { q: term })}</span></> });
    return list;
  }, [q, recent, t, locale]);

  const go = (href: string, term?: string) => {
    if (term) market.rememberSearch(term);
    setOpen(false);
    setActive(-1);
    input.current?.blur();
    router.push(href);
  };

  const submit = () => {
    const term = q.trim();
    if (!term) return;
    go(`/search?q=${encodeURIComponent(term)}`, term);
  };

  const headerAt = options.map((o, i) => (o.group && o.group !== options[i - 1]?.group ? o.group : null));
  return (
    <div
      ref={wrap}
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && options[active]) go(options[active].href, options[active].key === "all" ? q : undefined);
          else submit();
        }}
        className={cn(
          "flex h-12 items-center gap-2 rounded-[12px] border border-line-strong bg-surface pl-4 pr-1.5 transition-colors",
          "focus-within:border-mint-line focus-within:bg-graphite",
        )}
      >
        <Icon name="search" size={22} className="text-silver" />
        <label htmlFor={`${listId}-input`} className="sr-only">
          {t("market.search.label")}
        </label>
        <input
          ref={input}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          enterKeyHint="search"
          value={q}
          maxLength={100}
          placeholder={compact ? t("market.search.placeholderShort") : t("market.search.placeholder")}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(options.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(-1, i - 1));
            } else if (e.key === "Escape") {
              setOpen(false);
              setActive(-1);
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-cloud outline-none placeholder:text-silver [&::-webkit-search-cancel-button]:hidden"
        />
        {q ? (
          <button type="button" aria-label={t("market.search.clear")} onClick={() => { setQ(""); input.current?.focus(); }} className="grid size-9 place-items-center rounded-lg text-silver hover:bg-cloud-hover hover:text-cloud">
            <Icon name="close" size={18} />
          </button>
        ) : null}
        <button type="submit" className="hidden h-9 items-center rounded-[9px] bg-mint px-4 text-sm font-semibold text-obsidian hover:bg-[color-mix(in_srgb,#65e5d0_82%,#f4f5f7)] sm:inline-flex">
          {t("market.search.submit")}
        </button>
      </form>

      {open && options.length > 0 ? (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-[min(70vh,520px)] overflow-y-auto rounded-[14px] border border-line-strong bg-graphite p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] scrollbar-quiet">
          {!q.trim() && recent.length > 0 ? (
            <div className="flex justify-end px-2 pt-1">
              <button type="button" onClick={() => market.clearRecent()} className="text-xs text-silver underline-offset-2 hover:text-cloud hover:underline">
                {t("market.search.clearRecent")}
              </button>
            </div>
          ) : null}
          <ul id={listId} role="listbox" aria-label={t("market.search.label")}>
            {options.map((o, i) => {
              const header = headerAt[i];
              return (
                <li key={o.key} role="presentation">
                  {header ? <p className="px-2.5 pb-1 pt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-silver first:pt-1">{header}</p> : null}
                  <Link
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={active === i}
                    href={o.href}
                    tabIndex={-1}
                    onMouseEnter={() => setActive(i)}
                    onClick={(e) => {
                      e.preventDefault();
                      go(o.href, o.key === "all" ? q : o.key.startsWith("p-") && !q.trim() ? o.key.slice(2) : undefined);
                    }}
                    className={cn("flex min-h-11 items-center gap-3 rounded-[10px] px-2.5 py-1.5 text-sm text-cloud", active === i && "bg-cloud-hover")}
                  >
                    {o.node}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
