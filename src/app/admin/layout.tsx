import Link from "next/link";
import { SectionNav, type SectionNavItem } from "@/components/account/account-nav";
import { KamyWordmark } from "@/components/brand/logo";
import { Icon } from "@/components/icons/icon";
import { DemoLabel } from "@/components/ui/misc";
import { getTranslator } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/account-context";

export const metadata = { robots: { index: false, follow: false } };

/**
 * Every admin route renders inside this layout, and every admin page calls `requireAdmin`
 * again itself: a layout is not re-run on client navigation, so it cannot be the only gate.
 * Data access is enforced a third time by RLS (`private.is_platform_admin`).
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const [viewer, { t }] = await Promise.all([requireAdmin("/admin"), getTranslator()]);
  const items: SectionNavItem[] = [
    { href: "/admin", icon: "chart", label: t("admin.nav.overview"), exact: true },
    { href: "/admin/audit", icon: "history", label: t("admin.nav.audit") },
  ];
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-mint focus:px-4 focus:py-2 focus:text-obsidian">
        {t("common.skipToContent")}
      </a>
      <header className="border-b border-line bg-graphite">
        <div className="mx-auto flex min-h-[60px] max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" aria-label={t("admin.title")}>
              <KamyWordmark height={20} />
            </Link>
            <span className="label-mono">Admin</span>
            {viewer.demo ? <DemoLabel>{t("demo.label")}</DemoLabel> : null}
          </div>
          <div className="flex items-center gap-4 text-[13px] text-silver">
            {viewer.adminRole ? <span>{t("admin.role", { role: t(`admin.roles.${viewer.adminRole}`) })}</span> : null}
            <Link href="/" className="inline-flex h-11 items-center gap-1.5 font-semibold text-cloud hover:underline">
              <Icon name="arrowLeft" size={16} />
              {t("admin.nav.backToSite")}
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-[1320px] flex-1 gap-8 px-4 py-8 md:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <SectionNav items={items} label={t("admin.nav.label")} />
        <main id="admin-main" className="min-w-0">
          {viewer.demo ? <p className="mb-6 text-sm text-silver">{t("admin.demoNote")}</p> : null}
          {children}
        </main>
      </div>
    </div>
  );
}
