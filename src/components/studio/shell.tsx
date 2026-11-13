"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition, type ReactNode } from "react";
import { setLocaleAction, setRailCollapsedAction } from "@/app/actions/locale";
import { KamyWordmark } from "@/components/brand/logo";
import { Icon } from "@/components/icons/icon";
import { Avatar, Kbd } from "@/components/ui/misc";
import { cn } from "@/components/ui/cn";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { useI18n } from "@/i18n/client";
import { CommandPalette } from "./command-palette";
import { MOBILE_TABS, NAV_GROUPS, NAV_UTILITY, type NavItem } from "./nav";

type ShellProps = {
  children: ReactNode;
  storeName: string | null;
  avatarUrl: string | null;
  userName: string;
  demo: boolean;
  initialCollapsed: boolean;
  publicHref: string | null;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return Boolean(el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)));
}

export function StudioShell({ children, storeName, avatarUrl, userName, demo, initialCollapsed, publicHref }: ShellProps) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [, startTransition] = useTransition();

  const toggleRail = useCallback(() => {
    setCollapsed((value) => {
      const next = !value;
      startTransition(() => void setRailCollapsedAction(next));
      return next;
    });
  }, []);

  const switchLocale = useCallback(() => {
    const next = locale === "id" ? "en" : "id";
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }, [locale, router]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen(true);
      } else if (event.key === "[") {
        event.preventDefault();
        toggleRail();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleRail]);

  // Close the More sheet after navigating (derived during render).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMoreOpen(false);
  }

  const railLink = (item: NavItem) => {
    const active = isActive(pathname, item.href);
    const label = t(item.label);
    return (
      <li key={item.id}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          title={collapsed ? label : undefined}
          className={cn(
            "group flex h-9 items-center gap-3 rounded-[10px] px-2.5 text-sm font-semibold transition-colors duration-[180ms]",
            active ? "bg-graphite text-cloud" : "text-silver hover:bg-cloud-hover hover:text-cloud",
            collapsed && "justify-center px-0",
          )}
        >
          <Icon name={item.icon} size={18} className={active ? "text-mint" : undefined} />
          <span className={cn(collapsed && "sr-only")}>{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="flex min-h-dvh">
      <a
        href="#studio-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-mint focus:px-3 focus:py-2 focus:text-obsidian"
      >
        {t("common.skipToContent")}
      </a>

      {/* Desktop rail */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-obsidian transition-[width] duration-300 ease-[var(--ease-out-quiet)] md:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center gap-2 px-4", collapsed && "justify-center px-0")}>
          <Link href="/studio/overview" className="flex items-center gap-2.5 rounded-md" aria-label="KAMY Merchant Studio">
            {collapsed ? (
              <span className="flex size-8 items-center justify-center rounded-lg border border-line-strong font-extrabold tracking-tight">K</span>
            ) : (
              <>
                <KamyWordmark height={15} />
                <span className="label-mono !text-[10px]">Studio</span>
              </>
            )}
          </Link>
        </div>

        <nav aria-label={t("nav.primary")} className="scrollbar-quiet flex-1 overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.id} className="mt-4 first:mt-1">
              <p className={cn("label-mono mb-1.5 px-2.5 !text-[10px]", collapsed && "sr-only")}>{t(group.label)}</p>
              <ul className="flex flex-col gap-0.5">{group.items.map(railLink)}</ul>
            </div>
          ))}
          <div className="mt-4 border-t border-line pt-4">
            <ul className="flex flex-col gap-0.5">{NAV_UTILITY.map(railLink)}</ul>
          </div>
        </nav>

        <div className={cn("flex items-center gap-2 border-t border-line p-3", collapsed && "flex-col")}>
          <IconButton
            icon="panelLeft"
            label={collapsed ? t("nav.expand") : t("nav.collapse")}
            onClick={toggleRail}
            size="sm"
            tooltipSide="right"
          />
          {!collapsed ? <Kbd>[</Kbd> : null}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {demo ? (
          <div className="flex items-center justify-center gap-2 border-b border-dashed border-silver/50 bg-surface px-4 py-2 text-center text-[13px] text-cloud">
            <Icon name="info" size={16} className="text-silver" />
            {t("demo.banner")}
          </div>
        ) : null}

        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-obsidian/90 px-4 backdrop-blur md:px-6">
          <Link href="/studio/overview" className="md:hidden" aria-label="KAMY Merchant Studio">
            <KamyWordmark height={14} />
          </Link>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto hidden h-10 w-72 items-center gap-2.5 rounded-[10px] border border-line-strong bg-surface px-3 text-sm text-silver transition-colors hover:border-silver hover:text-cloud md:ml-0 md:flex"
          >
            <Icon name="search" size={16} />
            <span className="flex-1 text-left">{t("nav.search")}</span>
            <Kbd>⌘K</Kbd>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <IconButton icon="search" label={t("nav.search")} onClick={() => setPaletteOpen(true)} className="md:hidden" />
            <button
              type="button"
              onClick={switchLocale}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] px-2.5 text-[13px] font-semibold text-silver transition-colors hover:bg-cloud-hover hover:text-cloud"
              aria-label={`${t("common.language")}: ${t(`common.languages.${locale}`)}`}
            >
              <Icon name="language" size={18} />
              <span className="font-mono uppercase">{locale}</span>
            </button>
            {publicHref ? (
              <IconButton icon="externalLink" label={t("common.viewPublicPage")} onClick={() => window.open(publicHref, "_blank", "noopener")} className="hidden sm:inline-flex" tooltipSide="bottom" />
            ) : null}
            <IconButton icon="keyboard" label={t("shortcuts.title")} onClick={() => setShortcutsOpen(true)} className="hidden md:inline-flex" tooltipSide="bottom" />
            <div className="ml-2 flex items-center gap-3 border-l border-line pl-3">
              <Avatar src={avatarUrl} name={storeName ?? userName} size={32} />
              <div className="hidden max-w-44 flex-col leading-tight lg:flex">
                <span className="truncate text-sm font-semibold text-cloud">{storeName ?? userName}</span>
                <span className="truncate text-xs text-silver">{userName}</span>
              </div>
              {!demo ? (
                <form action="/auth/sign-out" method="post">
                  <IconButton type="submit" icon="logOut" label={t("common.signOut")} size="sm" tooltipSide="bottom" />
                </form>
              ) : null}
            </div>
          </div>
        </header>

        <main id="studio-main" className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile tab bar */}
      <nav aria-label={t("nav.primary")} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-obsidian/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {MOBILE_TABS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold", active ? "text-cloud" : "text-silver")}
                >
                  <Icon name={item.icon} size={20} className={active ? "text-mint" : undefined} />
                  {t(item.label)}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold text-silver"
            >
              <Icon name="menu" size={20} />
              {t("nav.more")}
            </button>
          </li>
        </ul>
      </nav>

      <Dialog open={moreOpen} onClose={() => setMoreOpen(false)} title={t("nav.more")} variant="bottom-sheet">
        <div className="flex flex-col gap-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="label-mono mb-2">{t(group.label)}</p>
              <ul className="grid grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-12 items-center gap-2.5 rounded-[10px] border border-line px-3 text-sm font-semibold",
                        isActive(pathname, item.href) ? "border-mint-line bg-mint-tint text-cloud" : "text-cloud",
                      )}
                    >
                      <Icon name={item.icon} size={18} />
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <ul className="grid grid-cols-2 gap-2 border-t border-line pt-4">
            {NAV_UTILITY.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="flex h-12 items-center gap-2.5 rounded-[10px] border border-line px-3 text-sm font-semibold text-cloud">
                  <Icon name={item.icon} size={18} />
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
          {!demo ? (
            <form action="/auth/sign-out" method="post">
              <button type="submit" className="flex h-12 w-full items-center gap-2.5 rounded-[10px] px-3 text-sm font-semibold text-silver hover:text-cloud">
                <Icon name="logOut" size={18} />
                {t("common.signOut")}
              </button>
            </form>
          ) : null}
        </div>
      </Dialog>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSwitchLocale={switchLocale}
        onOpenShortcuts={() => {
          setPaletteOpen(false);
          setShortcutsOpen(true);
        }}
      />

      <Dialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title={t("shortcuts.title")} size="sm">
        <dl className="flex flex-col gap-3 text-sm">
          {[
            [["Ctrl", "K"], t("shortcuts.commandPalette")],
            [["?"], t("shortcuts.help")],
            [["["], t("shortcuts.toggleRail")],
            [["Esc"], t("shortcuts.close")],
          ].map(([keys, label]) => (
            <div key={label as string} className="flex items-center justify-between gap-4">
              <dt className="text-cloud">{label as string}</dt>
              <dd className="flex gap-1">
                {(keys as string[]).map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Dialog>
    </div>
  );
}
