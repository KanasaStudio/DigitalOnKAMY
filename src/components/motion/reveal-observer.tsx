"use client";

import { useEffect } from "react";

/**
 * Sets the document's motion mode before first paint. "on" enables scroll reveals; reduced-motion
 * users get "reduced" and see everything immediately.
 */
export const MOTION_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;d.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'on';d.dataset.pointer=matchMedia('(hover: hover) and (pointer: fine)').matches?'fine':'coarse';}catch(e){}})();`;

/**
 * One observer for the whole app: any element with `data-reveal` fades in once when it first
 * enters the viewport. New elements (client navigation) are picked up by a MutationObserver.
 */
export function RevealObserver() {
  useEffect(() => {
    const reveal = (el: Element) => el.setAttribute("data-revealed", "");
    if (!("IntersectionObserver" in window) || document.documentElement.dataset.motion !== "on") {
      document.querySelectorAll("[data-reveal]").forEach(reveal);
      const mo = new MutationObserver(() => document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach(reveal));
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
