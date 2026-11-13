"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { useI18n } from "@/i18n/client";
import { cn } from "./cn";

type ToastTone = "success" | "info" | "error";
type ToastItem = { id: number; tone: ToastTone; message: string; action?: { label: string; onClick: () => void } };
type ToastApi = { show: (message: string, options?: { tone?: ToastTone; action?: ToastItem["action"] }) => void };

const ToastContext = createContext<ToastApi | null>(null);
const ICON: Record<ToastTone, IconName> = { success: "success", info: "info", error: "error" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const show = useCallback<ToastApi["show"]>(
    (message, options) => {
      const id = nextId.current++;
      setItems((list) => [...list.slice(-2), { id, message, tone: options?.tone ?? "success", action: options?.action }]);
      window.setTimeout(() => dismiss(id), options?.tone === "error" ? 9000 : 5000);
    },
    [dismiss],
  );
  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6" aria-live="polite" role="status">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm animate-sheet-in items-start gap-3 rounded-[14px] border bg-graphite px-4 py-3 text-sm text-cloud shadow-xl shadow-black/50",
              item.tone === "success" ? "border-mint-line" : "border-line-strong",
              item.tone === "error" && "shadow-[inset_3px_0_0_#f4f5f7]",
            )}
          >
            <Icon name={ICON[item.tone]} size={18} className={cn("mt-px", item.tone === "success" && "text-mint")} />
            <p className="flex-1 leading-snug">{item.message}</p>
            {item.action ? (
              <button type="button" onClick={item.action.onClick} className="font-semibold text-mint hover:underline">
                {item.action.label}
              </button>
            ) : null}
            <button type="button" onClick={() => dismiss(item.id)} aria-label={t("common.close")} className="-mr-1 text-silver hover:text-cloud">
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside <ToastProvider>");
  return value;
}
