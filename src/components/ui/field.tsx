"use client";

import { useId, type ReactNode } from "react";
import { Icon } from "@/components/icons/icon";
import { useI18n } from "@/i18n/client";
import { cn } from "./cn";

export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
};

/**
 * Label, hint, counter and error wiring for any control.
 * Error text format: what happened, why, how to fix — written by the caller.
 */
export function Field({
  label,
  hint,
  error,
  required,
  optional,
  counter,
  className,
  labelAction,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  counter?: { count: number; max: number };
  className?: string;
  labelAction?: ReactNode;
  children: (control: FieldControlProps) => ReactNode;
}) {
  const { t } = useI18n();
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const over = counter ? counter.count > counter.max : false;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-cloud">
          {label}
          {optional ? <span className="ml-1.5 font-normal text-silver">({t("common.optional")})</span> : null}
          {required ? <span className="sr-only"> ({t("common.required")})</span> : null}
        </label>
        {labelAction}
      </div>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
      })}
      {(hint || counter) && !error ? (
        <div className="flex items-start justify-between gap-3 text-[13px] leading-snug text-silver">
          {hint ? <p id={hintId}>{hint}</p> : <span />}
          {counter ? (
            <span className={cn("tabular shrink-0", over && "text-cloud")} aria-live="polite">
              {t("common.characters", { count: counter.count, max: counter.max })}
            </span>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-[13px] leading-snug text-cloud" role="alert">
          <Icon name="error" size={16} className="mt-px" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
