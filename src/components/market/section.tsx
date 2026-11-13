import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/icon";
import { cn } from "@/components/ui/cn";

export function SectionHeader({ title, body, href, linkLabel, eyebrow, className }: { title: string; body?: string; href?: string; linkLabel?: string; eyebrow?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-mint">{eyebrow}</p> : null}
        <h2 className="type-section text-cloud">{title}</h2>
        {body ? <p className="mt-1.5 text-sm text-silver md:text-[15px]">{body}</p> : null}
      </div>
      {href && linkLabel ? (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-mint hover:underline">
          {linkLabel}
          <Icon name="arrowRight" size={18} />
        </Link>
      ) : null}
    </div>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-4 md:px-6", className)}>{children}</div>;
}
