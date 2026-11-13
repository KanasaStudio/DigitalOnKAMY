import type { HTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "./cn";

export function Panel({ className, children, ...rest }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section className={cn("rounded-[16px] border border-line bg-surface", className)} {...rest}>
      {children}
    </section>
  );
}

export function PanelHeader({ title, action, description, id }: { title: ReactNode; action?: ReactNode; description?: ReactNode; id?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-[15px] font-bold tracking-tight text-cloud">
          {title}
        </h2>
        {description ? <p className="text-[13px] leading-snug text-silver">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("label-mono", className)}>{children}</p>;
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
  children,
}: {
  icon: IconName;
  title: ReactNode;
  body: ReactNode;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-3 px-5 py-8", className)}>
      <span className="flex size-10 items-center justify-center rounded-[10px] border border-line bg-obsidian text-silver">
        <Icon name={icon} size={20} />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <p className="text-[15px] font-semibold text-cloud">{title}</p>
        <p className="text-sm leading-relaxed text-silver">{body}</p>
      </div>
      {children}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block rounded-md bg-graphite motion-safe:animate-slow-pulse", className)} />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-line-strong bg-obsidian px-1.5 font-mono text-[11px] text-silver">
      {children}
    </kbd>
  );
}

export function Progress({ value, max = 100, label, className }: { value: number; max?: number; label: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-graphite", className)}
    >
      <div className="h-full rounded-full bg-mint transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Marks sample data. Every demo figure must sit next to one of these. */
export function DemoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center gap-1 rounded border border-dashed border-silver/70 px-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-silver", className)}>
      {children}
    </span>
  );
}

export function Avatar({ src, name, size = 40, className }: { src?: string | null; name: string; size?: number; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong bg-graphite font-bold text-cloud", className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- public storage URL, sized by container
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initials || "K"}</span>
      )}
    </span>
  );
}
