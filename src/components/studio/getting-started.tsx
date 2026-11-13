import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import { Panel, PanelHeader, Progress } from "@/components/ui/misc";
import type { Translate } from "@/i18n/core";
import type { getChecklist } from "@/lib/auth/studio-context";

type Checklist = ReturnType<typeof getChecklist>;

/** Persistent "Getting started" list. Rendered only while something is still open. */
export function GettingStarted({ checklist, t }: { checklist: Checklist; t: Translate }) {
  if (checklist.done === checklist.total) return null;
  return (
    <Panel aria-labelledby="getting-started">
      <PanelHeader
        id="getting-started"
        title={t("checklist.title")}
        action={<span className="tabular text-sm font-semibold text-silver">{t("checklist.progress", { done: checklist.done, total: checklist.total })}</span>}
      />
      <div className="px-5 pt-4">
        <Progress value={checklist.done} max={checklist.total} label={t("checklist.progress", { done: checklist.done, total: checklist.total })} />
      </div>
      <ol className="flex flex-col divide-y divide-line px-2 py-2">
        {checklist.items.map((item) => {
          const title = t(`checklist.${item.id}`);
          const hint = t(`checklist.${item.id}Hint`);
          const content = (
            <>
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
                  item.done ? "border-mint bg-mint-tint text-mint" : "border-line-strong text-silver",
                )}
              >
                {item.done ? <Icon name="check" size={13} strokeWidth={2.5} /> : null}
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className={cn("text-sm font-semibold", item.done ? "text-silver line-through decoration-line-strong" : "text-cloud")}>
                  {title}
                  <span className="sr-only">{item.done ? " ✓" : ""}</span>
                </span>
                {!item.done ? <span className="text-[13px] leading-snug text-silver">{hint}</span> : null}
              </span>
              {!item.done ? (
                item.available ? (
                  <span className="flex items-center gap-1 text-[13px] font-semibold text-cloud">
                    {t("checklist.open")}
                    <Icon name="chevronRight" size={16} />
                  </span>
                ) : (
                  <span className="label-mono !text-[10px]">{t("checklist.unavailable")}</span>
                )
              ) : null}
            </>
          );
          return (
            <li key={item.id}>
              {item.available && !item.done ? (
                <Link href={item.href} className="flex items-start gap-3 rounded-[10px] px-3 py-3 transition-colors hover:bg-cloud-hover">
                  {content}
                </Link>
              ) : (
                <div className="flex items-start gap-3 px-3 py-3">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
