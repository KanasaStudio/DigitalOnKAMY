import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Icon } from "@/components/icons/icon";
import { cn } from "./cn";

export const controlBase =
  "w-full rounded-[10px] border bg-obsidian text-[15px] text-cloud placeholder:text-silver/70 " +
  "transition-[border-color,box-shadow] duration-[180ms] outline-none " +
  "border-line-strong hover:border-[color-mix(in_srgb,#f4f5f7_32%,transparent)] " +
  "focus-visible:border-mint focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,#65e5d0_22%,transparent)] focus-visible:outline-none " +
  "aria-[invalid=true]:border-cloud aria-[invalid=true]:shadow-[inset_3px_0_0_#f4f5f7] " +
  "disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-surface";

export function Input({
  className,
  prefix,
  suffix,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { prefix?: ReactNode; suffix?: ReactNode }) {
  if (!prefix && !suffix) return <input className={cn(controlBase, "h-11 px-3.5", className)} {...rest} />;
  return (
    <div className="relative flex items-center">
      {prefix ? (
        <span className="pointer-events-none absolute left-3.5 font-mono text-[13px] text-silver">{prefix}</span>
      ) : null}
      <input
        className={cn(controlBase, "h-11", prefix ? "pl-[var(--prefix-w,7.5rem)]" : "pl-3.5", suffix ? "pr-10" : "pr-3.5", className)}
        {...rest}
      />
      {suffix ? <span className="absolute right-3 flex items-center">{suffix}</span> : null}
    </div>
  );
}

export function Textarea({ className, rows = 4, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(controlBase, "min-h-24 resize-y px-3.5 py-2.5 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(controlBase, "h-11 appearance-none pl-3.5 pr-10", className)} {...rest}>
        {children}
      </select>
      <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-silver" />
    </div>
  );
}
