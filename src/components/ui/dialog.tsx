"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useI18n } from "@/i18n/client";
import { cn } from "./cn";
import { IconButton } from "./icon-button";

/**
 * Modal dialog and side sheet built on the native <dialog> element: focus is trapped
 * by the browser, Esc closes it, and focus returns to the trigger on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "modal",
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  variant?: "modal" | "sheet" | "bottom-sheet";
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();
  const { t } = useI18n();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      restoreFocus.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      restoreFocus.current?.focus?.();
    }
  }, [open]);

  const width = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" }[size];
  const placement = {
    modal: cn("m-auto w-[calc(100%-2rem)] rounded-[20px]", width),
    sheet: "my-0 ml-auto mr-0 h-dvh max-h-dvh w-full max-w-md rounded-none border-y-0 border-r-0",
    "bottom-sheet": "mx-0 mb-0 mt-auto w-full max-w-none rounded-t-[20px] border-x-0 border-b-0",
  }[variant];

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "max-h-[calc(100dvh-2rem)] overflow-hidden border border-line-strong bg-surface p-0 text-cloud shadow-2xl shadow-black/60",
        "backdrop:bg-obsidian/75 backdrop:backdrop-blur-[2px] open:flex open:animate-sheet-in open:flex-col",
        placement,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="text-lg font-bold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p id={descId} className="text-sm leading-relaxed text-silver">
              {description}
            </p>
          ) : null}
        </div>
        <IconButton icon="close" label={t("common.close")} onClick={onClose} size="sm" showTooltip={false} />
      </div>
      {children ? <div className="scrollbar-quiet flex-1 overflow-y-auto px-5 py-5">{children}</div> : null}
      {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">{footer}</div> : null}
    </dialog>
  );
}
