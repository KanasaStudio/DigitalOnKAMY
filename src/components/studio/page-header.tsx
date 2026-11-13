import type { ReactNode } from "react";

export function PageHeader({ title, description, actions, eyebrow }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        {eyebrow ? <div className="flex items-center gap-2">{eyebrow}</div> : null}
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-cloud md:text-[28px]">{title}</h1>
        {description ? <p className="text-[15px] leading-relaxed text-silver">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
