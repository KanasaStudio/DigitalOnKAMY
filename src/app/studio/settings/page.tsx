import type { Metadata } from "next";
import { Icon } from "@/components/icons/icon";
import { PageHeader } from "@/components/studio/page-header";
import { EmptyState, Panel, PanelHeader } from "@/components/ui/misc";
import type { MessageKey } from "@/i18n/core";
import { formatDate } from "@/i18n/format";
import { getTranslator } from "@/i18n/server";
import { getStudioContext } from "@/lib/auth/studio-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LanguageSelect } from "./language-select";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("settings.title") };
}

const AUDIT_LABELS = new Set(["merchant.created", "merchant.updated", "policy.accepted", "product.status_changed", "media.uploaded"]);

export default async function SettingsPage() {
  const [ctx, { t, locale }] = await Promise.all([getStudioContext(), getTranslator()]);

  let activity: { id: number; action: string; created_at: string; ip: string | null; user_agent: string | null }[] = [];
  if (!ctx.demo) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("audit_log")
      .select("id, action, created_at, ip, user_agent")
      .eq("actor_id", ctx.user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    activity = data ?? [];
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title={t("settings.title")} description={t("settings.body")} />

      <Panel>
        <PanelHeader title={t("settings.account")} />
        <dl className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="label-mono !text-[10px]">{t("settings.email")}</dt>
            <dd className="text-sm font-semibold">{ctx.user.email}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="label-mono !text-[10px]">{t("settings.displayName")}</dt>
            <dd className="text-sm font-semibold">{ctx.user.displayName}</dd>
          </div>
        </dl>
        <div className="border-t border-line p-5">
          <LanguageSelect />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title={t("settings.twoFactor")} />
        <p className="flex items-start gap-2 px-5 py-4 text-sm text-silver">
          <Icon name="shield" size={18} className="mt-px shrink-0" />
          {t("settings.twoFactorBody")}
        </p>
      </Panel>

      <Panel aria-labelledby="security-activity">
        <PanelHeader id="security-activity" title={t("settings.security")} description={t("settings.securityNote")} />
        {activity.length ? (
          <ul className="divide-y divide-line">
            {activity.map((row) => (
              <li key={row.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold">
                  {AUDIT_LABELS.has(row.action) ? t(`settings.audit.${row.action}` as MessageKey) : row.action}
                </span>
                <span className="flex flex-col text-[13px] text-silver sm:items-end">
                  <span className="tabular">{formatDate(row.created_at, locale, true)}</span>
                  {row.ip ? <span className="font-mono text-[11px]">{row.ip}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="history" title={t("settings.security")} body={ctx.demo ? t("demo.writesDisabled") : t("settings.securityEmpty")} />
        )}
      </Panel>
    </div>
  );
}
