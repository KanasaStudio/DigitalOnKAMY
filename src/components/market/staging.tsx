import { cn } from "@/components/ui/cn";

export function StagingTag({ children, className }: { children: string; className?: string }) {
  return <span className={cn("inline-flex items-center rounded border border-dashed border-silver/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-silver", className)}>{children}</span>;
}
