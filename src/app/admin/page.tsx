import type { Metadata } from "next";
import { z } from "zod";
import { PageHeader } from "@/components/studio/page-header";
import { Panel, PanelHeader } from "@/components/ui/misc";
import { formatMoney, formatNumber } from "@/i18n/format";
import { getTranslator } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/account-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("admin.overview.title") };
}

const count = z.coerce.number().int().nonnegative();
const overviewSchema = z.object({
  orders_total: count,
  orders_paid: count,
  gmv: count,
  products_published: count,
  products_awaiting_review: count,
  merchants_active: count,
  customers_total: count,
  customers_new_30d: count,
});

async function loadOverview() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_overview");
  if (error) return null;
  const parsed = overviewSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

function Stat({ label, value, hint, muted }: { label: string; value: string; hint?: string; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[16px] border border-line bg-surface p-5">
      <dt className="label-mono !text-[10px]">{label}</dt>
      <dd className={muted ? "text-[15px] font-semibold text-silver" : "tabular font-display text-[28px] font-semibold leading-none text-cloud"}>{value}</dd>
      {hint ? <dd className="text-[13px] leading-snug text-silver">{hint}</dd> : null}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [viewer, { t, locale }] = await Promise.all([requireAdmin("/admin"), getTranslator()]);
  const overview = viewer.demo ? null : await loadOverview();
  const n = (value: number | undefined) => (value === undefined ? "—" : formatNumber(value, locale));
  const upcoming = ["moderation", "cms", "finance", "sound"] as const;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("admin.overview.title")} description={t("admin.overview.body")} />
      {!viewer.demo && !overview ? (
        <p role="alert" className="rounded-[12px] bg-graphite px-4 py-3 text-sm text-cloud shadow-[inset_3px_0_0_#f4f5f7]">
          {t("admin.overview.loadFailed")}
        </p>
      ) : null}
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("admin.overview.ordersTotal")} value={n(overview?.orders_total)} />
        <Stat label={t("admin.overview.ordersPaid")} value={n(overview?.orders_paid)} />
        <Stat label={t("admin.overview.gmv")} value={overview ? formatMoney(overview.gmv, "IDR", locale) : "—"} hint={t("admin.overview.gmvHint")} />
        <Stat label={t("admin.overview.commission")} value={t("admin.overview.notAvailable")} hint={t("admin.overview.commissionHint")} muted />
        <Stat label={t("admin.overview.productsPublished")} value={n(overview?.products_published)} />
        <Stat label={t("admin.overview.productsAwaiting")} value={n(overview?.products_awaiting_review)} />
        <Stat label={t("admin.overview.merchants")} value={n(overview?.merchants_active)} />
        <Stat
          label={t("admin.overview.customers")}
          value={n(overview?.customers_total)}
          hint={overview ? t("admin.overview.customersNew", { count: formatNumber(overview.customers_new_30d, locale) }) : undefined}
        />
      </dl>

      <Panel aria-labelledby="upcoming-heading">
        <PanelHeader id="upcoming-heading" title={t("admin.upcoming.title")} description={t("admin.upcoming.body")} />
        <ul className="grid gap-px bg-line sm:grid-cols-2">
          {upcoming.map((key) => (
            <li key={key} className="flex items-center justify-between gap-3 bg-surface px-5 py-4 text-sm text-silver">
              {t(`admin.upcoming.${key}`)}
              <span className="label-mono !text-[10px]">{t("admin.overview.notAvailable")}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
