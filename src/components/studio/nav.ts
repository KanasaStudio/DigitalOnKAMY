import type { IconName } from "@/components/icons/icon";
import type { MessageKey } from "@/i18n/core";

export type NavItem = { id: string; href: string; icon: IconName; label: MessageKey };
export type NavGroup = { id: string; label: MessageKey; items: NavItem[] };

const item = (id: string, icon: IconName): NavItem => ({
  id,
  href: `/studio/${id}`,
  icon,
  label: `nav.${id}` as MessageKey,
});

export const NAV_GROUPS: NavGroup[] = [
  { id: "sell", label: "nav.groups.sell", items: [item("overview", "home"), item("products", "package"), item("orders", "receipt"), item("reviews", "star")] },
  { id: "grow", label: "nav.groups.grow", items: [item("analytics", "chart"), item("promotions", "ticket"), item("storefront", "store")] },
  { id: "money", label: "nav.groups.money", items: [item("earnings", "wallet")] },
  { id: "manage", label: "nav.groups.manage", items: [item("team", "users"), item("policies", "docs"), item("settings", "settings")] },
];

/** Reachable from the rail footer, the More sheet and the command palette. */
export const NAV_UTILITY: NavItem[] = [item("customers", "community"), item("messages", "chat"), item("help", "help")];

export const MOBILE_TABS: NavItem[] = [item("overview", "home"), item("products", "package"), item("orders", "receipt"), item("earnings", "wallet")];

export const ALL_NAV_ITEMS: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), ...NAV_UTILITY];

/** Sections that exist as routes but are built in later phases. */
export const PLANNED_SECTIONS = ["products", "orders", "customers", "reviews", "analytics", "earnings", "promotions", "messages", "team", "help"] as const;
export type PlannedSection = (typeof PLANNED_SECTIONS)[number];
