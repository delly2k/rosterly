"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const ZOOM_STEPS = [1, 1.25, 1.5, 2, 2.5, 3];

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const zoom = ZOOM_STEPS[zoomIndex];

  const zoomIn = useCallback(() => {
    setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1));
  }, []);
  const zoomOut = useCallback(() => {
    setZoomIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    if (!open || !imgRef.current) return;
    const img = imgRef.current;
    if (img.naturalWidth) {
      setSize({ w: img.naturalWidth, h: img.naturalHeight });
      return;
    }
    img.onload = () => setSize({ w: img.naturalWidth, h: img.naturalHeight });
    return () => {
      img.onload = null;
    };
  }, [open, src]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 block w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-auto max-h-[400px] w-full cursor-zoom-in object-contain"
        />
        <p className="py-2 text-center text-xs font-medium text-[var(--color-ink-muted)]">
          Click to zoom
        </p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed ${alt}`}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border-strong)] bg-[var(--color-sidebar)] px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoomIndex <= 0}
                className="btn-admin-secondary text-xs disabled:opacity-40"
              >
                − Zoom out
              </button>
              <span className="min-w-[4rem] text-sm font-medium text-white">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoomIndex >= ZOOM_STEPS.length - 1}
                className="btn-admin-secondary text-xs disabled:opacity-40"
              >
                + Zoom in
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-admin-primary"
            >
              Close
            </button>
          </div>
          <div
            className="min-h-0 flex-1 overflow-auto p-4"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <div
              className="flex min-h-full items-center justify-center"
              style={
                size
                  ? {
                      minWidth: size.w * zoom,
                      minHeight: size.h * zoom,
                    }
                  : undefined
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={src}
                alt={alt}
                className="select-none object-contain"
                style={
                  size
                    ? {
                        width: size.w * zoom,
                        height: size.h * zoom,
                        maxWidth: "none",
                      }
                    : { maxWidth: "100%", maxHeight: "100%" }
                }
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
