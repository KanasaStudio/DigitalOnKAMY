import { cn } from "@/components/ui/cn";

/** KAMY wordmark from the official logo file (white on black, cropped to the glyphs). */
export function KamyWordmark({ className, height = 18 }: { className?: string; height?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG brand asset
    <img src="/brand/kamy-wordmark.svg" alt="KAMY" height={height} width={Math.round((height * 1052) / 192)} className={cn("block", className)} />
  );
}

export function KamyLockup({ className, width = 320 }: { className?: string; width?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG brand asset
    <img
      src="/brand/kamy-lockup.svg"
      alt="KAMY — Digital on KAMY"
      width={width}
      height={Math.round((width * 300) / 1052)}
      className={cn("block", className)}
    />
  );
}
