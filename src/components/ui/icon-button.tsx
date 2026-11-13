"use client";

import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "./cn";
import { Tooltip } from "./tooltip";

export function IconButton({
  icon,
  label,
  size = "md",
  showTooltip = true,
  tooltipSide = "top",
  className,
  type = "button",
  ...rest
}: {
  icon: IconName;
  /** Required: icon-only controls must have an accessible name. */
  label: string;
  size?: "sm" | "md";
  showTooltip?: boolean;
  tooltipSide?: "top" | "right" | "bottom";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const button = (describedBy?: string) => (
    <button
      type={type}
      aria-label={label}
      aria-describedby={describedBy}
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] text-silver transition-colors duration-[180ms]",
        "hover:bg-cloud-hover hover:text-cloud active:bg-line disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" ? "size-8" : "size-10",
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size === "sm" ? 16 : 20} />
    </button>
  );
  if (!showTooltip) return button();
  return (
    <Tooltip content={label} side={tooltipSide}>
      {(id) => button(id)}
    </Tooltip>
  );
}
