import type { Metadata } from "next";
import { Icon } from "@/components/icons/icon";
import { GettingStarted } from "@/components/studio/getting-started";
import { PageHeader } from "@/components/studio/page-header";
import { RangeTabs } from "@/components/studio/range-tabs";
import { RANGES, type Range } from "@/components/studio/ranges";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { DemoLabel, EmptyState, Panel, PanelHeader } from "@/components/ui/misc";
import type { Translate } from "@/i18n/core";
import { formatDate, formatMoney, formatNumber } from "@/i18n/format";
import { getTranslator } from "@/i18n/server";
import { getChecklist, getStudioContext } from "@/lib/auth/studio-context";
import { DEMO_METRICS } from "@/lib/demo/fixtures";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("nav.overview") };
}

function greetingKey(): "overview.greetingMorning" | "overview.greetingAfternoon" | "overview.greetingEvening" {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(new Date()));
  if (hour >= 4 && hour < 11) return "overview.greetingMorning";
  if (hour >= 11 && hour < 18) return "overview.greetingAfternoon";
  return "overview.greetingEvening";
}

function Delta({ value, previous, t }: { value: number; previous: number; t: Translate }) {
  if (!previous) return null;
  const change = (value - previous) / previous;
  const up = change >= 0;
  return (
    <span className="tabular inline-flex items-center gap-1 text-[13px] font-semibold text-silver">
      <Icon name={up ? "trending" : "collapse"} size={14} className={up ? "text-cloud" : undefined} />
      <span className="sr-only">{up ? "+" : "−"}</span>
      {up ? "+" : "−"}
      {Math.abs(change * 100).toFixed(1)}%
      <span className="sr-only"> {t("overview.rangeLabel")}</span>
    </span>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const w = 280;
  const h = 56;
  const coords = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - (p / max) * (h - 6) - 3}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={coords} fill="none" stroke="var(--color-mint)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default async function OverviewPage({ searchParams }: PageProps<"/studio/overview">) {
  const [{ t, locale }, ctx, params] = await Promise.all([getTranslator(), getStudioContext(), searchParams]);
  const range: Range = RANGES.includes(params.range as Range) ? (params.range as Range) : "30";
  const checklist = getChecklist(ctx);
  const merchant = ctx.merchant;
  const name = ctx.user.displayName || merchant?.store_name || "";
  const today = formatDate(new Date(), locale);

  const attention: { key: string; label: string; href: string; icon: "warning" | "docs" }[] = [];
  if (merchant && !merchant.onboarding_completed_at) {
    attention.push({ key: "setup", label: t("overview.attention.finishSetup"), href: "/studio/onboarding", icon: "warning" });
  } else if (merchant && ctx.policies.seller.document && !ctx.policies.seller.acceptedAt) {
    attention.push({
      key: "policy",
      label: t("overview.attention.reacceptPolicy", { version: ctx.policies.seller.document.version }),
      href: "/studio/onboarding?step=agreement",
      icon: "docs",
    });
  }

  const metrics = [
    { id: "revenue", label: t("overview.metrics.revenue"), demo: DEMO_METRICS.revenue, format: (v: number) => formatMoney(v, "IDR", locale) },
    { id: "orders", label: t("overview.metrics.orders"), demo: DEMO_METRICS.orders, format: (v: number) => formatNumber(v, locale) },
    { id: "views", label: t("overview.metrics.views"), demo: DEMO_METRICS.views, format: (v: number) => formatNumber(v, locale) },
    {
      id: "conversion",
      label: t("overview.metrics.conversion"),
      demo: DEMO_METRICS.conversion,
      format: (v: number) => `${new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-GB", { maximumFractionDigits: 2 }).format(v * 100)}%`,
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title={t(greetingKey(), { name })}
        description={today}
        actions={
          <>
            {ctx.demo ? <DemoLabel>{t("demo.label")}</DemoLabel> : null}
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-xs font-semibold text-silver">
              <Icon name="offline" size={14} />
              {t("overview.paymentsNotConnected")}
            </span>
          </>
        }
      />

      {!merchant ? (
        <Panel className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-xl flex-col gap-1.5">
            <p className="text-lg font-bold tracking-tight">{t("onboarding.title")}</p>
            <p className="text-sm leading-relaxed text-silver">{t("onboarding.intro")}</p>
          </div>
          <ButtonLink href="/studio/onboarding" iconRight="arrowRight">
            {t("common.continue")}
          </ButtonLink>
        </Panel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel aria-labelledby="metrics-title">
            <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 id="metrics-title" className="text-[15px] font-bold tracking-tight">
                {t("overview.range." + range as "overview.range.30")}
              </h2>
              <RangeTabs value={range} />
            </div>
            <dl className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x [&>div:nth-child(-n+2)]:border-b [&>div:nth-child(-n+2)]:border-line lg:[&>div:nth-child(-n+2)]:border-b-0 [&>div:nth-child(odd)]:border-r [&>div:nth-child(odd)]:border-line lg:[&>div:nth-child(odd)]:border-r-0">
              {metrics.map((metric) => (
                <div key={metric.id} className="flex flex-col gap-2 px-5 py-5">
                  <dt className="label-mono !text-[10px]">{metric.label}</dt>
                  {ctx.demo ? (
                    <dd className="flex flex-col gap-1">
                      <span className="tabular whitespace-nowrap text-xl font-extrabold tracking-tight xl:text-2xl">{metric.format(metric.demo.value)}</span>
                      <Delta value={metric.demo.value} previous={metric.demo.previous} t={t} />
                    </dd>
                  ) : (
                    <dd className="text-sm font-semibold text-silver">{t("overview.notEnoughData")}</dd>
                  )}
                </div>
              ))}
            </dl>
            {ctx.demo ? (
              <div className="border-t border-line px-5 pb-4 pt-3">
                <Sparkline points={DEMO_METRICS.trend} />
              </div>
            ) : (
              <p className="border-t border-line px-5 py-4 text-[13px] leading-relaxed text-silver">{t("overview.metricsEmpty")}</p>
            )}
          </Panel>

          <div className="grid gap-6 md:grid-cols-2">
            <Panel aria-labelledby="recent-orders">
              <PanelHeader id="recent-orders" title={t("overview.recentOrders")} action={ctx.demo ? <DemoLabel>{t("demo.label")}</DemoLabel> : undefined} />
              {ctx.demo ? (
                <ul className="divide-y divide-line">
                  {DEMO_METRICS.recentOrders.map((order) => (
                    <li key={order.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold">{order.product}</span>
                        <span className="font-mono text-[11px] text-silver">{order.id}</span>
                      </div>
                      <span className="tabular shrink-0 text-sm font-semibold">{formatMoney(order.amount, "IDR", locale)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon="receipt" title={t("overview.recentOrders")} body={t("overview.noOrders")} />
              )}
            </Panel>
            <Panel aria-labelledby="top-products">
              <PanelHeader id="top-products" title={t("overview.topProducts")} action={ctx.demo ? <DemoLabel>{t("demo.label")}</DemoLabel> : undefined} />
              {ctx.demo ? (
                <ol className="divide-y divide-line">
                  {DEMO_METRICS.topProducts.map((product, index) => (
                    <li key={product.title} className="flex items-center gap-3 px-5 py-3">
                      <span className="w-5 font-mono text-xs text-silver">{index + 1}</span>
                      <span className="flex-1 truncate text-sm font-semibold">{product.title}</span>
                      <span className="tabular text-sm text-silver">{formatNumber(product.sales, locale)}×</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState icon="award" title={t("overview.topProducts")} body={t("overview.noProducts")} />
              )}
            </Panel>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Panel aria-labelledby="attention">
            <PanelHeader id="attention" title={t("overview.needsAttention")} />
            {attention.length ? (
              <ul className="p-2">
                {attention.map((item) => (
                  <li key={item.key}>
                    <a href={item.href} className="flex items-start gap-3 rounded-[10px] px-3 py-3 text-sm font-semibold leading-snug transition-colors hover:bg-cloud-hover">
                      <Icon name={item.icon} size={18} className="mt-px text-cloud" />
                      <span className="flex-1">{item.label}</span>
                      <Icon name="chevronRight" size={16} className="mt-px text-silver" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={cn("flex items-center gap-2 px-5 py-4 text-sm text-silver")}>
                <Icon name="success" size={16} />
                {t("overview.nothingNeedsAttention")}
              </p>
            )}
          </Panel>
          {merchant ? <GettingStarted checklist={checklist} t={t} /> : null}
        </div>
      </div>
    </div>
  );
}
