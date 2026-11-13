import type { InputHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "./cn";

export function Checkbox({
  label,
  description,
  className,
  ...rest
}: { label: ReactNode; description?: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <label className={cn("group flex cursor-pointer items-start gap-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50", className)}>
      <span className="relative mt-0.5 inline-flex size-5 shrink-0">
        <input
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-obsidian transition-colors duration-150 checked:border-mint checked:bg-mint-tint hover:border-silver disabled:cursor-not-allowed aria-[invalid=true]:border-cloud"
          {...rest}
        />
        <Icon name="check" size={14} strokeWidth={2.5} className="pointer-events-none absolute inset-0 m-auto text-mint opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm leading-snug text-cloud">{label}</span>
        {description ? <span className="text-[13px] leading-snug text-silver">{description}</span> : null}
      </span>
    </label>
  );
}

/** Large selectable card used for single choices (radio semantics). */
export function RadioCard({
  label,
  description,
  icon,
  className,
  ...rest
}: { label: ReactNode; description?: ReactNode; icon?: IconName } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer gap-4 rounded-[14px] border border-line-strong bg-surface p-4 transition-colors duration-[180ms]",
        "hover:border-[color-mix(in_srgb,#f4f5f7_35%,transparent)] has-[:checked]:border-mint has-[:checked]:bg-mint-tint",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mint",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className,
      )}
    >
      <input type="radio" className="peer sr-only" {...rest} />
      {icon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-line bg-obsidian text-cloud">
          <Icon name={icon} size={20} />
        </span>
      ) : null}
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-[15px] font-semibold text-cloud">{label}</span>
        {description ? <span className="text-[13px] leading-snug text-silver">{description}</span> : null}
      </span>
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-line-strong group-has-[:checked]:border-mint">
        <span className="size-2.5 rounded-full bg-mint opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
      </span>
    </label>
  );
}

export function Toggle({
  label,
  description,
  className,
  ...rest
}: { label: ReactNode; description?: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role">) {
  return (
    <label className={cn("flex cursor-pointer items-start justify-between gap-4 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50", className)}>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-cloud">{label}</span>
        {description ? <span className="text-[13px] text-silver">{description}</span> : null}
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input
          type="checkbox"
          role="switch"
          className="peer h-6 w-11 cursor-pointer appearance-none rounded-full border border-line-strong bg-graphite transition-colors duration-[180ms] checked:border-mint checked:bg-mint-tint disabled:cursor-not-allowed"
          {...rest}
        />
        <span className="pointer-events-none absolute left-1 top-1 size-4 rounded-full bg-silver transition-transform duration-[180ms] peer-checked:translate-x-5 peer-checked:bg-mint" />
      </span>
    </label>
  );
}
