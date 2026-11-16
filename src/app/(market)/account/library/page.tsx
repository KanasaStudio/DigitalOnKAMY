import type { Metadata } from "next";
import { DownloadButton } from "@/components/account/download-button";
import { EmptyState, Panel, PanelHeader } from "@/components/ui/misc";
import { formatBytes } from "@/i18n/format";
import { getTranslator } from "@/i18n/server";
import { requireViewer } from "@/lib/auth/account-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("account.library.title") };
}

async function loadLibrary() {
  const supabase = await createSupabaseServerClient();
  return supabase.rpc("my_library");
}

export default async function AccountLibraryPage() {
  const [viewer, { t, locale }] = await Promise.all([requireViewer("/account/library"), getTranslator()]);
  const result = viewer.demo ? null : await loadLibrary();
  const files = result?.data ?? [];

  return (
    <Panel aria-labelledby="library-heading">
      <PanelHeader id="library-heading" title={t("account.library.title")} description={t("account.library.body")} />
      {result?.error ? (
        <p role="alert" className="px-5 py-6 text-sm text-cloud">
          {t("account.library.loadFailed")}
        </p>
      ) : files.length === 0 ? (
        <EmptyState icon="download" title={t("account.library.empty")} body={viewer.demo ? t("account.demoNote") : t("account.library.emptyBody")} />
      ) : (
        <ul className="divide-y divide-line">
          {files.map((file) => (
            <li key={`${file.order_item_id}:${file.file_id}`} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-semibold text-cloud">{file.title}</p>
                <p className="break-all font-mono text-[12px] text-silver">{file.filename}</p>
                <p className="text-[13px] text-silver">
                  {t("account.library.version", { version: file.version_label })}
                  {" · "}
                  <span className="tabular">{formatBytes(file.size_bytes, locale)}</span>
                  {" · "}
                  {t("account.library.fromOrder", { number: file.order_number })}
                </p>
              </div>
              <DownloadButton fileId={file.file_id} filename={file.filename} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
