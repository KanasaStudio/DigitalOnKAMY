import { useId, type ReactElement, type ReactNode } from "react";
import { cn } from "./cn";

/**
 * CSS-only tooltip shown on hover and keyboard focus. The trigger gets aria-describedby.
 * Use for supplementary text only; never hide essential information in a tooltip.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: ReactNode;
  children: (describedBy: string) => ReactElement;
  side?: "top" | "right" | "bottom";
  className?: string;
}) {
  const id = useId();
  const position = {
    top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
    right: "left-full top-1/2 ml-2 -translate-y-1/2",
  }[side];
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children(id)}
      <span
        role="tooltip"
        id={id}
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-64 rounded-md border border-line-strong bg-graphite px-2.5 py-1.5",
          "text-xs font-medium text-cloud opacity-0 shadow-lg shadow-black/40 transition-opacity duration-150",
          "group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          position,
        )}
      >
        {content}
      </span>
    </span>
  );
}
