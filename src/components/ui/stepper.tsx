"use client";

import { Icon } from "@/components/icons/icon";
import { cn } from "./cn";

export type Step = { id: string; label: string; done: boolean; disabled?: boolean };

/** Visible stepper with free navigation between enabled steps. */
export function Stepper({
  steps,
  current,
  onSelect,
  label,
}: {
  steps: Step[];
  current: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible">
        {steps.map((step, index) => {
          const active = step.id === current;
          return (
            <li key={step.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                disabled={step.disabled}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm transition-colors duration-[180ms]",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  active ? "bg-graphite text-cloud" : "text-silver hover:bg-cloud-hover hover:text-cloud",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                    step.done ? "border-mint bg-mint-tint text-mint" : active ? "border-cloud text-cloud" : "border-line-strong",
                  )}
                >
                  {step.done ? <Icon name="check" size={13} strokeWidth={2.5} /> : index + 1}
                </span>
                <span className="font-semibold whitespace-nowrap">{step.label}</span>
                {step.done ? <span className="sr-only">✓</span> : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
