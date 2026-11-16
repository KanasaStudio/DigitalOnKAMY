"use client";

import { useTransition } from "react";
import { requestDownloadAction } from "@/app/(market)/account/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/client";

export function DownloadButton({ fileId, filename }: { fileId: string; filename: string }) {
  const { t } = useI18n();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      icon="download"
      loading={pending}
      aria-label={t("account.library.downloadLabel", { name: filename })}
      onClick={() =>
        startTransition(async () => {
          const result = await requestDownloadAction(fileId);
          if (result.ok) window.location.assign(result.url);
          else toast.show(t(result.error), { tone: "error" });
        })
      }
    >
      {t("account.library.download")}
    </Button>
  );
}
