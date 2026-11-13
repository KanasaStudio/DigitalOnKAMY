"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Dialog } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/client";
import type { MessageKey } from "@/i18n/core";
import {
  categoryHref,
  CREATORS,
  FORMAT_GROUPS,
  getCategory,
  queryCatalog,
  SORT_KEYS,
  subcategoriesOf,
  topCategories,
  type CatalogQuery,
  type LicenseId,
  type SortKey,
} from "@/lib/market/catalog";
import { ProductCard } from "./product-card";

const PAGE_SIZE = 12;
const SORT_LABEL: Record<SortKey, MessageKey> = {
  relevance: "market.catalog.sorts.relevance",
  newest: "market.catalog.sorts.newest",
  "price-asc": "market.catalog.sorts.priceAsc",
  "price-desc": "market.catalog.sorts.priceDesc",
  "best-selling": "market.catalog.sorts.bestSelling",
  rating: "market.catalog.sorts.rating",
};

export type CatalogPreset = {
  title?: string;
  eyebrow?: string;
  description?: string;
  category?: string;
  sub?: string;
  discount?: boolean;
  newOnly?: boolean;
  sort?: SortKey;
  search?: boolean;
  icon?: IconName;
};

const int = (v: string | null) => (v && /^\d{1,9}$/.test(v) ? Number(v) : undefined);

export function Catalog({ preset }: { preset: CatalogPreset }) {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = (params.get("q") ?? "").slice(0, 100);
  const sortParam = params.get("sort") as SortKey | null;
  const query: CatalogQuery = {
    q,
    category: preset.category ?? (params.get("cat") || undefined),
    sub: preset.sub ?? (params.get("sub") || undefined),
    min: int(params.get("min")),
    max: int(params.get("max")),
    formats: params.get("fmt")?.split(",").filter((f) => (FORMAT_GROUPS as readonly string[]).includes(f)),
    license: (["personal", "commercial", "extended", "service"] as const).find((l) => l === params.get("lic")),
    creator: params.get("creator") || undefined,
    rating: int(params.get("rating")),
    discount: preset.discount || params.get("deal") === "1",
    newOnly: preset.newOnly || params.get("new") === "1",
    delivery: params.get("type") === "manual" ? "manual" : params.get("type") === "instant" ? "instant" : undefined,
    sort: sortParam && SORT_KEYS.includes(sortParam) ? sortParam : (preset.sort ?? (q ? "relevance" : "best-selling")),
  };
  const results = queryCatalog(query); // small staging catalogue; cheap to recompute
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, int(params.get("page")) ?? 1));
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const update = (patch: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!keepPage) next.delete("page");
    const s = next.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const name = (c: { name: { id: string; en: string } }) => (locale === "en" ? c.name.en : c.name.id);
  const chips: { label: string; clear: Record<string, string | null> }[] = [];
  if (!preset.category && query.category) chips.push({ label: name(getCategory(query.category)!), clear: { cat: null, sub: null } });
  if (!preset.sub && query.sub && getCategory(query.sub)) chips.push({ label: name(getCategory(query.sub)!), clear: { sub: null } });
  if (query.min != null || query.max != null) chips.push({ label: `Rp ${query.min ?? 0} – ${query.max ?? "∞"}`, clear: { min: null, max: null } });
  query.formats?.forEach((f) => chips.push({ label: f, clear: { fmt: query.formats!.filter((x) => x !== f).join(",") || null } }));
  if (query.license) chips.push({ label: t(`market.product.licenses.${query.license}`), clear: { lic: null } });
  if (query.creator) chips.push({ label: CREATORS.find((c) => c.slug === query.creator)?.name ?? query.creator, clear: { creator: null } });
  if (query.rating) chips.push({ label: `★ ${t("market.catalog.ratingAtLeast", { n: query.rating })}`, clear: { rating: null } });
  if (!preset.discount && query.discount) chips.push({ label: t("market.catalog.discountOnly"), clear: { deal: null } });
  if (!preset.newOnly && query.newOnly) chips.push({ label: t("market.catalog.newOnly"), clear: { new: null } });
  if (query.delivery) chips.push({ label: query.delivery === "manual" ? t("market.catalog.deliveryManual") : t("market.catalog.deliveryInstant"), clear: { type: null } });
  const clearAll = () => router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false });

  const title = preset.search ? (q ? t("market.catalog.searchTitle", { q }) : t("market.nav.search")) : (preset.title ?? t("market.catalog.allTitle"));
  const filters = <Filters key={`${query.min ?? ""}-${query.max ?? ""}`} preset={preset} query={query} update={update} />;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-6 pt-6 md:px-6 md:pt-8">
      <header className="mb-6">
        {preset.eyebrow ? <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-silver">{preset.eyebrow}</p> : null}
        <div className="flex items-start gap-4">
          {preset.icon ? <Icon name={preset.icon} size={40} className="mt-1 shrink-0 text-mint" /> : null}
          <div className="min-w-0">
            <h1 className="type-page break-words text-cloud">{title}</h1>
            {preset.description ? <p className="mt-2 max-w-[60ch] text-[15px] text-silver">{preset.description}</p> : null}
          </div>
        </div>
        {preset.category && !preset.search ? (
          <nav className="mt-5 flex gap-2 overflow-x-auto no-scrollbar" aria-label={t("market.catalog.subcategory")}>
            <SubLink href={categoryHref({ id: preset.category, parentId: null })} active={!preset.sub}>
              {t("market.catalog.allInCategory")}
            </SubLink>
            {subcategoriesOf(preset.category).map((s) => (
              <SubLink key={s.id} href={categoryHref(s)} active={preset.sub === s.id}>
                {name(s)}
              </SubLink>
            ))}
          </nav>
        ) : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label={t("market.catalog.filters")}>
          <div className="sticky top-[150px] max-h-[calc(100dvh-170px)] overflow-y-auto pr-2 scrollbar-quiet">{filters}</div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="tabular text-sm text-silver" aria-live="polite">
              {t("market.catalog.results", { count: results.length })}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-line-strong px-3.5 text-sm font-semibold text-cloud lg:hidden">
                <Icon name="filter" size={20} />
                {t("market.catalog.filters")}
                {chips.length ? <span className="grid size-5 place-items-center rounded-full bg-mint text-[11px] font-bold text-obsidian">{chips.length}</span> : null}
              </button>
              <label className="flex items-center gap-2 text-sm text-silver">
                <span className="hidden sm:inline">{t("market.catalog.sort")}</span>
                <span className="relative">
                  <select
                    value={query.sort}
                    onChange={(e) => update({ sort: e.target.value })}
                    className="h-11 appearance-none rounded-[10px] border border-line-strong bg-surface pl-3.5 pr-10 text-sm font-semibold text-cloud outline-none focus-visible:border-mint-line"
                  >
                    {SORT_KEYS.filter((k) => k !== "relevance" || q).map((k) => (
                      <option key={k} value={k}>
                        {t(SORT_LABEL[k])}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevronDown" size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                </span>
              </label>
            </div>
          </div>

          {chips.length ? (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button key={c.label} type="button" onClick={() => update(c.clear)} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-mint-line bg-mint-tint pl-3 pr-2 text-[13px] text-cloud hover:border-mint">
                  {c.label}
                  <Icon name="close" size={14} />
                </button>
              ))}
              <button type="button" onClick={clearAll} className="px-2 text-[13px] font-semibold text-silver underline-offset-2 hover:text-cloud hover:underline">
                {t("market.catalog.clearAll")}
              </button>
            </div>
          ) : null}

          {visible.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {visible.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-[18px] border border-dashed border-line-strong px-6 py-16 text-center">
              <Icon name="search" size={40} className="text-silver" />
              <h2 className="mt-4 font-display text-xl font-semibold text-cloud">{preset.search && !q ? t("market.catalog.searchEmpty") : t("market.catalog.emptyTitle")}</h2>
              {preset.search && !q ? null : <p className="mt-2 max-w-sm text-sm text-silver">{t("market.catalog.emptyBody")}</p>}
              {chips.length ? (
                <Button variant="secondary" className="mt-5" onClick={clearAll}>
                  {t("market.catalog.clearAll")}
                </Button>
              ) : null}
            </div>
          )}

          {pages > 1 ? (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label={t("market.catalog.pagination")}>
              <Button variant="secondary" icon="chevronLeft" disabled={page <= 1} onClick={() => update({ page: String(page - 1) }, true)}>
                {t("market.catalog.prev")}
              </Button>
              <span className="tabular px-3 text-sm text-silver">{t("market.catalog.pageOf", { n: page, total: pages })}</span>
              <Button variant="secondary" iconRight="chevronRight" disabled={page >= pages} onClick={() => update({ page: String(page + 1) }, true)}>
                {t("market.catalog.next")}
              </Button>
            </nav>
          ) : null}
        </div>
      </div>

      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t("market.catalog.filters")}
        variant="bottom-sheet"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={clearAll}>
              {t("market.catalog.clearAll")}
            </Button>
            <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
              {t("market.catalog.showResults", { count: results.length })}
            </Button>
          </div>
        }
      >
        {filters}
      </Dialog>
    </div>
  );
}

function SubLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors", active ? "border-mint bg-mint text-obsidian" : "border-line-strong text-cloud hover:border-cloud")}>
      {children}
    </Link>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0">
      <legend className="mb-3 font-display text-[15px] font-semibold text-cloud">{title}</legend>
      {children}
    </fieldset>
  );
}

function Option({ checked, onChange, children, type = "checkbox", name }: { checked: boolean; onChange: () => void; children: ReactNode; type?: "checkbox" | "radio"; name?: string }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-1 text-sm text-cloud hover:bg-cloud-hover">
      <input type={type} name={name} checked={checked} onChange={onChange} className="size-[18px] shrink-0 accent-[#65e5d0]" />
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

function Filters({ preset, query, update }: { preset: CatalogPreset; query: CatalogQuery; update: (p: Record<string, string | null>) => void }) {
  const { t, locale } = useI18n();
  const name = (c: { name: { id: string; en: string } }) => (locale === "en" ? c.name.en : c.name.id);
  const [min, setMin] = useState(query.min?.toString() ?? "");
  const [max, setMax] = useState(query.max?.toString() ?? "");
  const licenses: LicenseId[] = ["personal", "commercial", "extended", "service"];

  return (
    <div>
      {!preset.category ? (
        <Group title={t("market.catalog.category")}>
          <Option type="radio" name="cat" checked={!query.category} onChange={() => update({ cat: null, sub: null })}>
            {t("market.catalog.allInCategory")}
          </Option>
          {topCategories().map((c) => (
            <div key={c.id}>
              <Option type="radio" name="cat" checked={query.category === c.id} onChange={() => update({ cat: c.id, sub: null })}>
                <span className="flex items-center gap-2">
                  <Icon name={c.icon as IconName} size={20} className="text-silver" />
                  {name(c)}
                </span>
              </Option>
              {query.category === c.id ? (
                <div className="ml-7 border-l border-line pl-2">
                  {subcategoriesOf(c.id).map((s) => (
                    <Option key={s.id} type="radio" name="sub" checked={query.sub === s.id} onChange={() => update({ sub: query.sub === s.id ? null : s.id })}>
                      {name(s)}
                    </Option>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </Group>
      ) : null}

      <Group title={t("market.catalog.price")}>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ min: min.replace(/\D/g, "") || null, max: max.replace(/\D/g, "") || null });
          }}
        >
          {[
            [t("market.catalog.min"), min, setMin],
            [t("market.catalog.max"), max, setMax],
          ].map(([label, value, set]) => (
            <label key={label as string} className="min-w-0 flex-1 text-xs text-silver">
              {label as string}
              <input
                inputMode="numeric"
                value={value as string}
                onChange={(e) => (set as (v: string) => void)(e.target.value.replace(/\D/g, "").slice(0, 9))}
                className="mt-1 h-10 w-full rounded-[10px] border border-line-strong bg-surface px-3 text-sm text-cloud outline-none focus-visible:border-mint-line"
              />
            </label>
          ))}
          <button type="submit" aria-label={t("market.search.submit")} className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-graphite text-cloud hover:bg-surface-raised">
            <Icon name="arrowRight" size={18} />
          </button>
        </form>
      </Group>

      <Group title={t("market.catalog.offers")}>
        <Option checked={Boolean(query.discount)} onChange={() => update({ deal: query.discount ? null : "1" })}>
          {t("market.catalog.discountOnly")}
        </Option>
        <Option checked={Boolean(query.newOnly)} onChange={() => update({ new: query.newOnly ? null : "1" })}>
          {t("market.catalog.newOnly")}
        </Option>
      </Group>

      <Group title={t("market.catalog.delivery")}>
        {([null, "instant", "manual"] as const).map((v) => (
          <Option key={v ?? "any"} type="radio" name="type" checked={(query.delivery ?? null) === v} onChange={() => update({ type: v })}>
            {v === null ? t("market.catalog.deliveryAny") : v === "instant" ? t("market.catalog.deliveryInstant") : t("market.catalog.deliveryManual")}
          </Option>
        ))}
      </Group>

      <Group title={t("market.catalog.formats")}>
        <div className="flex flex-wrap gap-2">
          {FORMAT_GROUPS.map((f) => {
            const on = query.formats?.includes(f) ?? false;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  const set = new Set(query.formats ?? []);
                  if (on) set.delete(f);
                  else set.add(f);
                  update({ fmt: [...set].join(",") || null });
                }}
                className={cn("h-9 rounded-lg border px-3 font-mono text-xs transition-colors", on ? "border-mint bg-mint-tint text-mint" : "border-line-strong text-cloud hover:border-cloud")}
              >
                {f}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title={t("market.catalog.license")}>
        <Option type="radio" name="lic" checked={!query.license} onChange={() => update({ lic: null })}>
          {t("market.catalog.anyLicense")}
        </Option>
        {licenses.map((l) => (
          <Option key={l} type="radio" name="lic" checked={query.license === l} onChange={() => update({ lic: l })}>
            {t(`market.product.licenses.${l}`)}
          </Option>
        ))}
      </Group>

      <Group title={t("market.catalog.rating")}>
        {[null, 4, 5].map((r) => (
          <Option key={r ?? "any"} type="radio" name="rating" checked={(query.rating ?? null) === r} onChange={() => update({ rating: r ? String(r) : null })}>
            {r ? (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="star" size={16} className="fill-mint text-mint" />
                {t("market.catalog.ratingAtLeast", { n: r })}
              </span>
            ) : (
              t("market.catalog.anyRating")
            )}
          </Option>
        ))}
      </Group>

      <Group title={t("market.catalog.creator")}>
        <label className="relative block">
          <span className="sr-only">{t("market.catalog.creator")}</span>
          <select
            value={query.creator ?? ""}
            onChange={(e) => update({ creator: e.target.value || null })}
            className="h-10 w-full appearance-none rounded-[10px] border border-line-strong bg-surface pl-3 pr-9 text-sm text-cloud outline-none focus-visible:border-mint-line"
          >
            <option value="">{t("market.catalog.anyCreator")}</option>
            {CREATORS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-silver" />
        </label>
      </Group>
    </div>
  );
}
