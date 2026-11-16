import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import type { Translate } from "@/i18n/core";
import { ORDER_STATUS_KEY, type OrderStatus } from "@/lib/commerce/order-status";

/** Icon plus text for every status, so none is told apart by colour alone. */
const TREATMENT: Record<OrderStatus, { icon: IconName; className: string }> = {
  pending_payment: { icon: "pending", className: "bg-graphite text-cloud" },
  pending_delivery: { icon: "processing", className: "bg-graphite text-cloud" },
  delivered: { icon: "download", className: "bg-mint-tint text-mint" },
  completed: { icon: "success", className: "bg-mint-tint text-mint" },
  cancelled: { icon: "close", className: "border border-dashed border-silver/70 text-silver" },
  refunded: { icon: "refund", className: "bg-graphite text-cloud shadow-[inset_3px_0_0_#f4f5f7]" },
};

export function OrderStatusBadge({ status, t }: { status: OrderStatus; t: Translate }) {
  const treatment = TREATMENT[status];
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md pl-2 pr-2.5 text-xs font-semibold", treatment.className)}>
      <Icon name={treatment.icon} size={14} />
      {t(ORDER_STATUS_KEY[status])}
    </span>
  );
}
