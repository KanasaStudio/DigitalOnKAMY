"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/i18n/client";

export type SectionNavItem = { href: string; icon: IconName; label: string; exact?: boolean };

/** Section navigation for account and admin: a wrapping row on small screens, a column on large ones. */
export function SectionNav({ items, label }: { items: SectionNavItem[]; label: string }) {
  const pathname = usePathname() ?? "";
  return (
    <nav aria-label={label}>
      <ul className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-2.5 rounded-[10px] px-3 text-sm font-semibold transition-colors duration-[var(--duration-micro)]",
                  active ? "bg-mint-tint text-mint" : "text-silver hover:bg-cloud-hover hover:text-cloud",
                )}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AccountNav({ showAdmin }: { showAdmin: boolean }) {
  const { t } = useI18n();
  const items: SectionNavItem[] = [
    { href: "/account", icon: "user", label: t("account.nav.profile"), exact: true },
    { href: "/account/orders", icon: "receipt", label: t("account.nav.orders") },
    { href: "/account/library", icon: "download", label: t("account.nav.library") },
    ...(showAdmin ? [{ href: "/admin", icon: "shield" as const, label: t("account.nav.admin") }] : []),
  ];
  return <SectionNav items={items} label={t("account.nav.label")} />;
}
