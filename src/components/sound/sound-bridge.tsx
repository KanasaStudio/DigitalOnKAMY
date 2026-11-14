"use client";

import { useEffect } from "react";
import { sound, type SoundId } from "@/lib/sound/sound-manager";

const isDisabled = (el: Element) => el.matches(":disabled, [aria-disabled='true']");

/**
 * Declarative sound hooks, one listener each for the whole document:
 *   data-sfx="click-primary"  plays on click (one listener, so nested handlers can't double it)
 *   data-sfx-hover            plays the hover tick on pointer entry, mouse only, once per entry
 * Sound never blocks or delays the action; the manager swallows every failure.
 */
export function SoundBridge() {
  useEffect(() => {
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest?.("[data-sfx-hover]");
      if (!el || isDisabled(el)) return;
      if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return; // moving inside the same control
      sound.play("hover");
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-sfx]");
      if (!el || isDisabled(el)) return;
      sound.play(el.getAttribute("data-sfx") as SoundId);
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);
  return null;
}
