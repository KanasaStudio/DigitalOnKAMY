"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/i18n/client";
import { ALL_NAV_ITEMS } from "./nav";

type Entry = { id: string; label: string; icon: IconName; group: "pages" | "actions"; run: () => void };

/** Ctrl/Cmd+K: jump between Studio pages. Products join the index in Phase 5. */
export function CommandPalette({
  open,
  onClose,
  onSwitchLocale,
  onOpenShortcuts,
}: {
  open: boolean;
  onClose: () => void;
  onSwitchLocale: () => void;
  onOpenShortcuts: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      restore.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setActive(0);
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      restore.current?.focus?.();
    }
  }, [open]);

  const entries = useMemo<Entry[]>(() => {
    const pages: Entry[] = ALL_NAV_ITEMS.map((item) => ({
      id: item.id,
      label: t(item.label),
      icon: item.icon,
      group: "pages",
      run: () => router.push(item.href),
    }));
    const actions: Entry[] = [
      { id: "locale", label: t("command.switchLanguage"), icon: "language", group: "actions", run: onSwitchLocale },
      { id: "shortcuts", label: t("command.openShortcuts"), icon: "keyboard", group: "actions", run: onOpenShortcuts },
    ];
    const q = query.trim().toLowerCase();
    return [...pages, ...actions].filter((e) => !q || e.label.toLowerCase().includes(q) || e.id.includes(q));
  }, [t, router, query, onSwitchLocale, onOpenShortcuts]);

  const choose = (entry: Entry | undefined) => {
    if (!entry) return;
    onClose();
    entry.run();
  };

  return (
    <dialog
      ref={ref}
      aria-label={t("command.title")}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-[20px] border border-line-strong bg-surface p-0 text-cloud shadow-2xl shadow-black/60 backdrop:bg-obsidian/75 open:animate-sheet-in"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Icon name="search" size={18} className="text-silver" />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={entries[active] ? `${listId}-${entries[active].id}` : undefined}
          aria-autocomplete="list"
          value={query}
          placeholder={t("command.placeholder")}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, entries.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(entries[active]);
            }
          }}
          className="h-14 flex-1 bg-transparent text-[15px] text-cloud outline-none placeholder:text-silver"
        />
      </div>
      <ul id={listId} role="listbox" aria-label={t("command.title")} className="scrollbar-quiet max-h-80 overflow-y-auto p-2">
        {entries.length === 0 ? <li className="px-3 py-6 text-center text-sm text-silver">{t("command.empty")}</li> : null}
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            id={`${listId}-${entry.id}`}
            role="option"
            aria-selected={index === active}
            onMouseEnter={() => setActive(index)}
            onClick={() => choose(entry)}
            className={cn(
              "flex h-11 cursor-pointer items-center gap-3 rounded-[10px] px-3 text-sm font-semibold",
              index === active ? "bg-graphite text-cloud" : "text-silver",
            )}
          >
            <Icon name={entry.icon} size={18} />
            <span className="flex-1">{entry.label}</span>
            <span className="label-mono !text-[10px]">{t(`command.${entry.group}`)}</span>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
