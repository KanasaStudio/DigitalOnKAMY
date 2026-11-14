"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type Props = {
  children: ReactNode;
  className?: string;
  /** Soft mint light that follows the pointer. */
  light?: boolean;
  /** Sparse drifting points that lean slightly away from the pointer. */
  particles?: number;
};

/**
 * Pointer-responsive surface for hero and editorial panels (§05). Writes four CSS variables on the
 * container from a single requestAnimationFrame loop — no React state, no layout reads per frame:
 *   --mx / --my  pointer position in px (for the light)
 *   --px / --py  normalised -1..1 (for parallax: translate(calc(var(--px) * 10px), …))
 * The loop only runs while the panel is on screen, the tab is visible, the device has a fine
 * pointer and the user has not asked for reduced motion.
 */
export function PointerField({ children, className, light = true, particles = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let rect = el.getBoundingClientRect();
    const target = { x: rect.width * 0.7, y: rect.height * 0.35 };
    const cur = { ...target };
    let visible = false;
    let raf = 0;
    let inside = false;

    const ctx = canvas.current?.getContext("2d") ?? null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    type P = { x: number; y: number; z: number; vx: number; vy: number };
    let pts: P[] = [];
    const sizeCanvas = () => {
      rect = el.getBoundingClientRect();
      if (!ctx || !canvas.current) return;
      canvas.current.width = Math.round(rect.width * dpr);
      canvas.current.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (pts.length === 0) {
        pts = Array.from({ length: particles }, () => ({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          z: 0.3 + Math.random() * 0.7,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
        }));
      }
    };
    sizeCanvas();

    const frame = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      cur.x += (target.x - cur.x) * 0.12;
      cur.y += (target.y - cur.y) * 0.12;
      el.style.setProperty("--mx", `${cur.x.toFixed(1)}px`);
      el.style.setProperty("--my", `${cur.y.toFixed(1)}px`);
      el.style.setProperty("--px", ((cur.x / rect.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--py", ((cur.y / rect.height) * 2 - 1).toFixed(3));
      if (ctx && pts.length) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        const ox = (cur.x / rect.width - 0.5) * 18;
        const oy = (cur.y / rect.height - 0.5) * 18;
        for (const p of pts) {
          p.x = (p.x + p.vx + rect.width) % rect.width;
          p.y = (p.y + p.vy + rect.height) % rect.height;
          const x = p.x - ox * p.z;
          const y = p.y - oy * p.z;
          const d = Math.hypot(x - cur.x, y - cur.y);
          const near = inside ? Math.max(0, 1 - d / 220) : 0;
          ctx.fillStyle = `rgba(${near > 0.05 ? "101,229,208" : "244,245,247"},${(0.08 + p.z * 0.14 + near * 0.35).toFixed(3)})`;
          const s = 1 + p.z * 1.4;
          ctx.fillRect(x, y, s, s);
        }
      }
      const settled = Math.abs(target.x - cur.x) < 0.3 && Math.abs(target.y - cur.y) < 0.3;
      if (!settled || pts.length) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      inside = true;
      kick();
    };
    const onLeave = () => {
      inside = false;
      target.x = rect.width * 0.7;
      target.y = rect.height * 0.35;
      kick();
    };
    const onResize = () => {
      sizeCanvas();
      kick();
    };
    const onScroll = () => {
      rect = el.getBoundingClientRect();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        rect = el.getBoundingClientRect();
        kick();
      }
    });
    io.observe(el);
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", kick);
    el.dataset.pointerActive = "";
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", kick);
      delete el.dataset.pointerActive;
    };
  }, [particles]);

  return (
    <div ref={ref} className={cn("relative isolate", className)} style={{ ["--px" as string]: 0, ["--py" as string]: 0 }}>
      {particles > 0 ? <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 -z-10 size-full" /> : null}
      {light ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 [[data-pointer-active]>&]:opacity-100"
          style={{ background: "radial-gradient(520px circle at var(--mx, 70%) var(--my, 35%), color-mix(in srgb, #65e5d0 13%, transparent), transparent 62%)" }}
        />
      ) : null}
      {children}
    </div>
  );
}

/** Parallax layer inside a PointerField. depth is the max shift in px at the panel edge. */
export function Parallax({ depth, children, className }: { depth: number; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("transition-transform duration-75 ease-linear will-change-transform motion-reduce:!transform-none", className)}
      style={{ transform: `translate3d(calc(var(--px, 0) * ${-depth}px), calc(var(--py, 0) * ${-depth}px), 0)` }}
    >
      {children}
    </div>
  );
}
