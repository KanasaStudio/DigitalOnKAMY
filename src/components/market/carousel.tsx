"use client";

import { useRef, type ReactNode } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { useI18n } from "@/i18n/client";

/** Horizontal shelf with scroll-snap; arrow buttons on pointer devices, swipe on touch. */
export function ProductCarousel({ children, label }: { children: ReactNode; label: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <div className="relative">
      <div className="absolute -top-[60px] right-0 hidden gap-2 md:flex">
        <IconButton icon="chevronLeft" label={t("market.catalog.prev")} onClick={() => scroll(-1)} className="border border-line-strong" />
        <IconButton icon="chevronRight" label={t("market.catalog.next")} onClick={() => scroll(1)} className="border border-line-strong" />
      </div>
      <div ref={ref} role="region" aria-label={label} tabIndex={0} className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 no-scrollbar md:mx-0 md:gap-4 md:scroll-px-0 md:px-0">
        {children}
      </div>
    </div>
  );
}
