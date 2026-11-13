"use client";

import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "./cn";

export type ChipOption = { value: string; label: string; icon?: IconName };

/** Multi-select as a group of toggle buttons. Fully keyboard operable (Tab + Space/Enter). */
export function ChipSelect({
  options,
  value,
  onChange,
  max,
  labelledBy,
  describedBy,
  invalid,
  disabled,
}: {
  options: ChipOption[];
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const atMax = max !== undefined && value.length >= max;
  return (
    <div role="group" aria-labelledby={labelledBy} aria-describedby={describedBy} data-invalid={invalid || undefined} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option.value);
        const blocked = disabled || (!selected && atMax);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            disabled={blocked}
            onClick={() => onChange(selected ? value.filter((v) => v !== option.value) : [...value, option.value])}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition-colors duration-[180ms]",
              "disabled:cursor-not-allowed disabled:opacity-40",
              selected
                ? "border-mint bg-mint-tint text-cloud"
                : "border-line-strong text-silver hover:border-silver hover:text-cloud",
            )}
          >
            {option.icon ? <Icon name={option.icon} size={16} /> : null}
            {option.label}
            {selected ? <Icon name="check" size={14} className="text-mint" /> : null}
          </button>
        );
      })}
    </div>
  );
}
