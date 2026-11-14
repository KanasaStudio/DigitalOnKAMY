"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/i18n/client";
import { sound } from "@/lib/sound/sound-manager";
import { useSoundPrefs } from "@/lib/sound/use-sound";

/** Compact SOUND FX switch with a small settings popover (§16). */
export function SoundControl({ className }: { className?: string }) {
  const { t } = useI18n();
  const prefs = useSoundPrefs();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const missing = prefs.enabled && prefs.checked && prefs.available === 0;

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${t("market.sound.settings")}: ${prefs.enabled ? t("market.sound.on") : t("market.sound.off")}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-[var(--duration-micro)]",
          prefs.enabled ? "border-mint-line text-mint" : "border-line-strong text-silver hover:border-cloud/40 hover:text-cloud",
        )}
      >
        <Icon name={prefs.enabled ? "volume" : "volumeOff"} size={16} />
        <span aria-hidden>{prefs.enabled ? "SFX ON" : "SFX OFF"}</span>
      </button>
      {open ? (
        <div id={panelId} role="group" aria-label={t("market.sound.settings")} className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 animate-panel-in rounded-[14px] border border-line-strong bg-graphite p-4 text-left shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-silver">{t("market.sound.label")}</p>
          <label className="mt-3 flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm font-semibold text-cloud">{t("market.sound.enable")}</span>
            <span className="relative inline-flex">
              <input
                type="checkbox"
                role="switch"
                checked={prefs.enabled}
                onChange={(e) => {
                  sound.set({ enabled: e.target.checked });
                  if (e.target.checked) sound.play("click-secondary");
                }}
                className="peer sr-only"
              />
              <span className="h-6 w-11 rounded-full bg-obsidian ring-1 ring-line-strong transition-colors peer-checked:bg-mint peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-mint" />
              <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-cloud transition-transform duration-[var(--duration-button)] ease-[var(--ease-out-quiet)] peer-checked:translate-x-5 peer-checked:bg-obsidian" />
            </span>
          </label>
          <fieldset disabled={!prefs.enabled} className="mt-4 space-y-3 disabled:opacity-45">
            <label className="block text-[13px] text-silver">
              {t("market.sound.volume")}
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(prefs.volume * 100)}
                onChange={(e) => sound.set({ volume: Number(e.target.value) / 100 })}
                onPointerUp={() => sound.play("click-secondary")}
                className="mt-1.5 block w-full accent-[#65e5d0]"
              />
            </label>
            <label className="flex items-center gap-2.5 text-[13px] text-cloud">
              <input type="checkbox" checked={prefs.hover} onChange={(e) => sound.set({ hover: e.target.checked })} className="size-4 accent-[#65e5d0]" />
              {t("market.sound.hover")}
            </label>
            <label className="flex items-center gap-2.5 text-[13px] text-cloud">
              <input type="checkbox" checked={prefs.notifications} onChange={(e) => sound.set({ notifications: e.target.checked })} className="size-4 accent-[#65e5d0]" />
              {t("market.sound.notifications")}
            </label>
          </fieldset>
          <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-silver">{missing ? t("market.sound.unavailable") : t("market.sound.note")}</p>
        </div>
      ) : null}
    </div>
  );
}
