import { Icon } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";

/** Rating in the brand palette (mint, not gold). Only rendered when real reviews exist. */
export function RatingDisplay({ average, count, label, countLabel, className, size = 15 }: { average: number; count: number; label: string; countLabel: string; className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] text-silver", className)} aria-label={`${label}, ${countLabel}`}>
      <Icon name="star" size={size} className="fill-mint text-mint" />
      <span className="tabular font-semibold text-cloud" aria-hidden>
        {average.toFixed(1).replace(".", ",")}
      </span>
      <span aria-hidden>({count})</span>
    </span>
  );
}
