import type { Metadata } from "next";
import { Icon } from "@/components/icons/icon";
import { PolicyBody } from "@/components/policy/policy-body";
import { PageHeader } from "@/components/studio/page-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Panel, PanelHeader } from "@/components/ui/misc";
import { formatDate } from "@/i18n/format";
import { getTranslator } from "@/i18n/server";
import { getStudioContext } from "@/lib/auth/studio-context";
import { getCurrentPolicies } from "@/lib/reference-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("policies.title") };
}

type HistoryRow = { id: string; accepted_at: string; user_id: string; policy: { kind: string; version: string; title_id: string; title_en: string } | null };

export default async function PoliciesPage() {
  const [ctx, { t, locale }, policies] = await Promise.all([getStudioContext(), getTranslator(), getCurrentPolicies()]);

  let history: HistoryRow[] = [];
  if (!ctx.demo && ctx.merchant) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("policy_acceptances")
      .select("id, accepted_at, user_id, policy:policy_documents(kind, version, title_id, title_en)")
      .eq("merchant_id", ctx.merchant.id)
      .order("accepted_at", { ascending: false })
      .limit(50);
    history = (data ?? []) as unknown as HistoryRow[];
  }

  const docs = [
    { doc: policies.seller, status: ctx.policies.seller, step: "agreement" },
    { doc: policies.ownership, status: ctx.policies.ownership, step: "ownership" },
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title={t("policies.title")} description={t("policies.body")} />
      <p className="flex items-start gap-2 rounded-[12px] border border-dashed border-silver/60 px-4 py-3 text-[13px] leading-relaxed text-silver">
        <Icon name="info" size={16} className="mt-0.5 shrink-0" />
        {t("policies.draftNotice")}
      </p>

      {docs.map(({ doc, status, step }) =>
        doc ? (
          <Panel key={doc.id}>
            <PanelHeader
              title={locale === "en" ? doc.title_en : doc.title_id}
              description={
                <span className="font-mono text-xs">
                  {t("policies.current")}: {doc.version}
                </span>
              }
              action={
                status.acceptedAt ? (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-mint">
                    <Icon name="success" size={16} />
                    {formatDate(status.acceptedAt, locale)}
                  </span>
                ) : ctx.merchant ? (
                  <ButtonLink href={`/studio/onboarding?step=${step}`} size="sm">
                    {t("policies.review")}
                  </ButtonLink>
                ) : (
                  <span className="text-[13px] text-silver">{t("policies.notAccepted")}</span>
                )
              }
            />
            <details className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-cloud">
                <Icon name="chevronDown" size={16} className="transition-transform group-open:rotate-180" />
                {t("common.readFull")}
              </summary>
              <div className="mt-4">
                <PolicyBody text={locale === "en" ? doc.body_en : doc.body_id} />
              </div>
            </details>
          </Panel>
        ) : null,
      )}

      <Panel aria-labelledby="history">
        <PanelHeader id="history" title={t("policies.history")} />
        {history.length ? (
          <ul className="divide-y divide-line">
            {history.map((row) => (
              <li key={row.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold">
                  {row.policy ? (locale === "en" ? row.policy.title_en : row.policy.title_id) : "—"}{" "}
                  <span className="font-mono text-xs font-normal text-silver">{row.policy?.version}</span>
                </span>
                <span className="tabular text-[13px] text-silver">
                  {t("policies.acceptedBy", {
                    name: row.user_id === ctx.user.id ? ctx.user.displayName : t("roles.admin"),
                    date: formatDate(row.accepted_at, locale, true),
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="history" title={t("policies.history")} body={t("policies.noHistory")} />
        )}
      </Panel>
    </div>
  );
}
