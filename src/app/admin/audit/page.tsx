import type { Metadata } from "next";
import { PageHeader } from "@/components/studio/page-header";
import { EmptyState, Panel } from "@/components/ui/misc";
import { formatDate } from "@/i18n/format";
import { getTranslator } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/account-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("admin.audit.title") };
}

async function loadAudit() {
  const supabase = await createSupabaseServerClient();
  return supabase
    .from("audit_log")
    .select("id, action, entity_type, entity_id, actor_id, request_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
}

export default async function AdminAuditPage() {
  const [viewer, { t, locale }] = await Promise.all([requireAdmin("/admin/audit"), getTranslator()]);
  const result = viewer.demo ? null : await loadAudit();
  const rows = result?.data ?? [];

  return (
    <div className="flex flex-col">
      <PageHeader title={t("admin.audit.title")} description={t("admin.audit.body")} />
      <Panel>
        {result?.error ? (
          <p role="alert" className="px-5 py-6 text-sm text-cloud">
            {t("admin.audit.loadFailed")}
          </p>
        ) : rows.length === 0 ? (
          <EmptyState icon="history" title={t("admin.audit.empty")} body={viewer.demo ? t("admin.demoNote") : t("admin.audit.emptyBody")} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  {(["time", "action", "target", "actor", "request"] as const).map((key) => (
                    <th key={key} scope="col" className="label-mono px-5 py-3 !text-[10px] font-medium">
                      {t(`admin.audit.${key}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="tabular whitespace-nowrap px-5 py-3 text-silver">{formatDate(row.created_at, locale, true)}</td>
                    <td className="px-5 py-3 font-mono text-[13px] text-cloud">{row.action}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-silver">
                      {row.entity_type ? `${row.entity_type}:${row.entity_id?.slice(0, 8) ?? ""}` : "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-silver">{row.actor_id ? row.actor_id.slice(0, 8) : t("admin.audit.system")}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-silver">{row.request_id ? row.request_id.slice(0, 12) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
