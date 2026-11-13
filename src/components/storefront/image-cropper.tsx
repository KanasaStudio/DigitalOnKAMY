"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { useI18n } from "@/i18n/client";

export type CropKind = "avatar" | "banner";

const SPEC: Record<CropKind, { aspect: number; width: number; height: number }> = {
  avatar: { aspect: 1, width: 512, height: 512 },
  banner: { aspect: 4, width: 1600, height: 400 },
};

const MAX_UPLOAD_BYTES = 3_800_000;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Crop with drag-to-pan and zoom. Keyboard: arrow keys pan, +/− zoom.
 * The avatar shows the circular mask; the banner shows the safe area and the zone
 * covered by the profile photo.
 */
export function ImageCropper({
  kind,
  file,
  onCancel,
  onApply,
  busy,
}: {
  kind: CropKind;
  file: File | null;
  onCancel: () => void;
  onApply: (blob: Blob) => void;
  busy: boolean;
}) {
  const { t } = useI18n();
  const spec = SPEC[kind];
  const frameRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [frameW, setFrameW] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Reset framing when a new file arrives (derived during render, no effect needed).
  const [prevFile, setPrevFile] = useState(file);
  if (file !== prevFile) {
    setPrevFile(file);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setNatural(null);
  }
  const src = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (src) URL.revokeObjectURL(src);
  }, [src]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setFrameW(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  const frameH = frameW / spec.aspect;
  const base = natural ? Math.max(frameW / natural.w, frameH / natural.h) : 1;
  const scale = base * zoom;
  const dispW = natural ? natural.w * scale : 0;
  const dispH = natural ? natural.h * scale : 0;

  const clamp = useCallback(
    (o: { x: number; y: number }, z = zoom) => {
      if (!natural) return o;
      const s = base * z;
      const maxX = Math.max(0, (natural.w * s - frameW) / 2);
      const maxY = Math.max(0, (natural.h * s - frameH) / 2);
      return { x: Math.min(maxX, Math.max(-maxX, o.x)), y: Math.min(maxY, Math.max(-maxY, o.y)) };
    },
    [natural, base, zoom, frameW, frameH],
  );

  const setZoomClamped = (z: number) => {
    const next = Math.min(4, Math.max(1, z));
    setZoom(next);
    setOffset((o) => clamp(o, next));
  };

  const left = frameW / 2 - dispW / 2 + offset.x;
  const top = frameH / 2 - dispH / 2 + offset.y;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setOffset(clamp({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y }));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 40 : 10;
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[e.key]) {
      e.preventDefault();
      setOffset((o) => clamp({ x: o.x + moves[e.key][0], y: o.y + moves[e.key][1] }));
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      setZoomClamped(zoom + 0.1);
    } else if (e.key === "-") {
      e.preventDefault();
      setZoomClamped(zoom - 0.1);
    }
  };

  const apply = async () => {
    const img = imgRef.current;
    if (!img || !natural) return;
    const canvas = document.createElement("canvas");
    canvas.width = spec.width;
    canvas.height = spec.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, -left / scale, -top / scale, frameW / scale, frameH / scale, 0, 0, spec.width, spec.height);
    let blob = await canvasToBlob(canvas, "image/webp", 0.9);
    if (!blob || blob.size > MAX_UPLOAD_BYTES) blob = await canvasToBlob(canvas, "image/jpeg", 0.86);
    if (blob) onApply(blob);
  };

  const tooSmall = natural ? natural.w < spec.width * 0.75 || natural.h < spec.height * 0.75 : false;

  return (
    <Dialog
      open={Boolean(file)}
      onClose={onCancel}
      title={t("storefront.cropTitle")}
      description={t("storefront.cropBody")}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button onClick={apply} loading={busy} disabled={!natural}>
            {busy ? t("storefront.uploading") : t("storefront.applyCrop")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          ref={frameRef}
          tabIndex={0}
          role="group"
          aria-label={t("storefront.cropBody")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          onKeyDown={onKeyDown}
          className="relative w-full cursor-grab touch-none overflow-hidden rounded-[12px] border border-line-strong bg-obsidian active:cursor-grabbing"
          style={{ aspectRatio: String(spec.aspect), maxWidth: kind === "avatar" ? 380 : undefined, marginInline: kind === "avatar" ? "auto" : undefined }}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL for cropping
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              className="pointer-events-none absolute max-w-none select-none"
              style={natural ? { width: dispW, height: dispH, left, top } : { opacity: 0 }}
            />
          ) : null}
          {kind === "avatar" ? (
            <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(9,11,15,0.6)] outline outline-1 outline-dashed outline-cloud/60" />
          ) : (
            <>
              <div className="pointer-events-none absolute inset-y-[12%] inset-x-[6%] rounded-md border border-dashed border-cloud/60">
                <span className="label-mono absolute left-2 top-1.5 !text-[10px] !text-cloud/80">{t("storefront.safeArea")}</span>
              </div>
              <div className="pointer-events-none absolute bottom-0 left-[2%] h-[38%] w-[11%] rounded-t-full bg-obsidian/60" />
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <IconButton icon="zoomOut" label={`${t("storefront.zoom")} −`} size="sm" onClick={() => setZoomClamped(zoom - 0.2)} />
          <label className="flex flex-1 items-center gap-3">
            <span className="sr-only">{t("storefront.zoom")}</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoomClamped(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[var(--color-mint)]"
            />
          </label>
          <IconButton icon="zoomIn" label={`${t("storefront.zoom")} +`} size="sm" onClick={() => setZoomClamped(zoom + 0.2)} />
        </div>
        {tooSmall ? <p className="text-[13px] text-silver">{kind === "avatar" ? t("storefront.avatarHint") : t("storefront.bannerHint")}</p> : null}
      </div>
    </Dialog>
  );
}
