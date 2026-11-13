"use client";

import { Icon, type IconName } from "@/components/icons/icon";
import { useI18n } from "@/i18n/client";
import type { Enums } from "@/lib/supabase/database.types";
import { cn } from "./cn";

export type ProductStatus = Enums<"product_status">;

/**
 * Status language using only the KAMY palette. Every status pairs an icon with a
 * text label, so none is distinguished by color alone.
 */
const TREATMENT: Record<ProductStatus, { icon: IconName; className: string; pulse?: boolean }> = {
  published: { icon: "success", className: "bg-mint-tint text-mint border border-transparent" },
  approved: { icon: "success", className: "bg-mint-tint text-mint border border-transparent" },
  submitted: { icon: "pending", className: "bg-graphite text-cloud border border-transparent", pulse: true },
  in_review: { icon: "pending", className: "bg-graphite text-cloud border border-transparent", pulse: true },
  changes_requested: { icon: "edit", className: "bg-transparent text-cloud border border-mint" },
  draft: { icon: "file", className: "bg-transparent text-silver border border-dashed border-silver/70" },
  unpublished: { icon: "offline", className: "bg-graphite text-silver border border-transparent" },
  rejected: { icon: "error", className: "bg-graphite text-cloud border border-transparent shadow-[inset_3px_0_0_#f4f5f7]" },
  suspended: { icon: "lock", className: "bg-graphite text-cloud border border-transparent shadow-[inset_3px_0_0_#f4f5f7]" },
};

export function StatusBadge({ status, className }: { status: ProductStatus; className?: string }) {
  const { t } = useI18n();
  const treatment = TREATMENT[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md pl-2 pr-2.5 text-xs font-semibold whitespace-nowrap",
        treatment.className,
        className,
      )}
    >
      <Icon name={treatment.icon} size={14} className={treatment.pulse ? "motion-safe:animate-slow-pulse" : undefined} />
      {t(`status.${status}`)}
    </span>
  );
}

export type VerificationState = Enums<"verification_state">;

/**
 * The verified mark appears only for a truly verified state reached through a real
 * process, and never in demo mode.
 */
export function VerificationBadge({ state, demo, className }: { state: VerificationState; demo: boolean; className?: string }) {
  const { t } = useI18n();
  const verified = state === "verified" && !demo;
  if (!verified && state === "unverified") return null;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-semibold",
        verified ? "bg-mint-tint text-mint" : "bg-graphite text-silver",
        className,
      )}
    >
      <Icon name={verified ? "verified" : "shield"} size={14} />
      {t(`verification.${verified ? "verified" : state === "verified" ? "unverified" : state}`)}
    </span>
  );
}
