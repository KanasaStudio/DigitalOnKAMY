import { formatMoney } from "@/i18n/format";
import { cn } from "@/components/ui/cn";

export function PriceDisplay({
  price,
  salePrice,
  size = "md",
  from,
  className,
}: {
  price: number;
  salePrice?: number;
  size?: "sm" | "md" | "lg";
  from?: string;
  className?: string;
}) {
  const current = salePrice ?? price;
  const pct = salePrice ? Math.round((1 - salePrice / price) * 100) : 0;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      {from ? <span className="text-xs text-silver">{from}</span> : null}
      <span
        className={cn(
          "tabular font-bold text-cloud",
          size === "sm" && "text-[15px]",
          size === "md" && "text-[17px]",
          size === "lg" && "font-display text-[32px] leading-none tracking-[-0.02em]",
        )}
      >
        {formatMoney(current)}
      </span>
      {salePrice ? (
        <>
          <s className={cn("tabular text-silver", size === "lg" ? "text-base" : "text-xs")}>{formatMoney(price)}</s>
          <span className="rounded bg-mint-tint px-1.5 py-0.5 font-mono text-[11px] font-medium text-mint">-{pct}%</span>
        </>
      ) : null}
    </div>
  );
}
