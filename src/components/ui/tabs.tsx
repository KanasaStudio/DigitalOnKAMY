"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "./cn";

export type TabItem = { id: string; label: string };

/** Segmented tabs with roving focus (arrow keys, Home, End). */
export function Tabs({
  items,
  value,
  onChange,
  label,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  className?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (event: KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    refs.current[next]?.focus();
    onChange(items[next].id);
  };
  return (
    <div role="tablist" aria-label={label} className={cn("inline-flex rounded-[10px] border border-line bg-obsidian p-1", className)}>
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "h-8 rounded-[7px] px-3 text-[13px] font-semibold transition-colors duration-[180ms]",
              selected ? "bg-graphite text-cloud" : "text-silver hover:text-cloud",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
