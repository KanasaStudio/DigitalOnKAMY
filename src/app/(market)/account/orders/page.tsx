import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Panel, PanelHeader } from "@/components/ui/misc";
import { formatDate, formatMoney } from "@/i18n/format";
import { getTranslator } from "@/i18n/server";
import { requireViewer } from "@/lib/auth/account-context";
import { DELIVERY_STATUS_KEY } from "@/lib/commerce/order-status";
import { isLicenseKey } from "@/lib/market/merge";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("account.orders.title") };
}

async function loadOrders(userId: string) {
  const supabase = await createSupabaseServerClient();
  // Filtered by customer explicitly: an admin's own order history is still only their own.
  return supabase
    .from("orders")
    .select(
      "id, order_number, status, total, currency, payment_method, placed_at, items:order_items(id, title, license, line_total, delivery_status, product_ref)",
    )
    .eq("customer_id", userId)
    .order("placed_at", { ascending: false })
    .limit(50);
}

export default async function AccountOrdersPage() {
  const [viewer, { t, locale }] = await Promise.all([requireViewer("/account/orders"), getTranslator()]);
  const result = viewer.demo ? null : await loadOrders(viewer.id);
  const orders = result?.data ?? [];

  return (
    <Panel aria-labelledby="orders-heading">
      <PanelHeader id="orders-heading" title={t("account.orders.title")} description={t("account.orders.body")} />
      {result?.error ? (
        <p role="alert" className="px-5 py-6 text-sm text-cloud">
          {t("account.orders.loadFailed")}
        </p>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="receipt"
          title={t("account.orders.empty")}
          body={viewer.demo ? t("account.demoNote") : t("account.orders.emptyBody")}
          action={
            <ButtonLink href="/products" variant="secondary" size="sm" iconRight="arrowRight">
              {t("account.orders.browse")}
            </ButtonLink>
          }
        />
      ) : (
        <ul className="divide-y divide-line">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-col gap-4 px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-[13px] text-cloud">
                    <span className="sr-only">{t("account.orders.number")}: </span>
                    {order.order_number}
                  </p>
                  <p className="text-[13px] text-silver">
                    <span className="tabular">{formatDate(order.placed_at, locale, true)}</span>
                    {" · "}
                    {t(`account.orders.paymentMethods.${order.payment_method === "kt" || order.payment_method === "gateway" ? order.payment_method : "none"}`)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <OrderStatusBadge status={order.status} t={t} />
                  <p className="tabular font-display text-lg font-semibold text-cloud">{formatMoney(order.total, order.currency, locale)}</p>
                </div>
              </div>
              <ul className="flex flex-col gap-2 rounded-[12px] bg-obsidian p-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
                    <Link href={`/product/${item.product_ref}`} className="min-w-0 font-semibold text-cloud hover:underline">
                      {item.title}
                    </Link>
                    <span className="text-[13px] text-silver">
                      {isLicenseKey(item.license) ? t(`market.product.licenses.${item.license}`) : item.license}
                      {" · "}
                      {t(DELIVERY_STATUS_KEY[item.delivery_status])}
                      {" · "}
                      <span className="tabular text-cloud">{formatMoney(item.line_total, order.currency, locale)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
