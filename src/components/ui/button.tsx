import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { cn } from "./cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,opacity] duration-[180ms] ease-[var(--ease-out-quiet)] " +
  "disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-mint text-obsidian hover:bg-[color-mix(in_srgb,#65e5d0_82%,#f4f5f7)] active:bg-[color-mix(in_srgb,#65e5d0_88%,#090b0f)]",
  secondary:
    "border border-line-strong bg-surface-raised text-cloud hover:border-[color-mix(in_srgb,#f4f5f7_35%,transparent)] hover:bg-[color-mix(in_srgb,#202631_80%,#f4f5f7_6%)] active:bg-surface",
  ghost: "text-silver hover:bg-cloud-hover hover:text-cloud active:bg-line",
  // Destructive actions are distinguished by icon and wording, never by a red hue.
  destructive:
    "border border-line-strong bg-transparent text-cloud hover:border-cloud hover:bg-cloud-hover active:bg-line",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

function Inner({ icon, iconRight, loading, children, variant }: CommonProps) {
  const leading = loading ? <Spinner /> : icon ? <Icon name={icon} size={16} /> : variant === "destructive" ? <Icon name="delete" size={16} /> : null;
  return (
    <>
      {leading}
      <span>{children}</span>
      {iconRight && !loading ? <Icon name={iconRight} size={16} /> : null}
    </>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Inner icon={icon} iconRight={iconRight} loading={loading} variant={variant}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className,
  children,
  ...rest
}: Omit<CommonProps, "loading"> & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      <Inner icon={icon} iconRight={iconRight} variant={variant}>
        {children}
      </Inner>
    </Link>
  );
}
