"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { absMediaUrl } from "./hubUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Mobile-first media carousel (Instagram-ish).
 * - Full width
 * - Swipe/scroll horizontally
 * - Snap paging
 * - Dots indicator
 */
export function MediaCarousel({
  urls,
  className,
  aspect = "square",
}: Readonly<{
  urls: string[];
  className?: string;
  aspect?: "square" | "portrait";
}>) {
  const media = useMemo(() => (urls ?? []).filter(Boolean), [urls]);
  const ref = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (ref.current) ref.current.scrollTo({ left: 0 });
  }, [media.length]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    setIndex(Math.max(0, Math.min(media.length - 1, i)));
  };

  if (media.length === 0) return null;

  const goTo = (nextIndex: number) => {
    const el = ref.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(media.length - 1, nextIndex));
    setIndex(clamped);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  const aspectCls =
    aspect === "portrait" ? "aspect-[4/5]" : "aspect-square";

  return (
    <div className={cn("w-full", className)}>
      <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-black/15">
        <div
          ref={ref}
          onScroll={onScroll}
          className={cn(
            "relative w-full overflow-x-auto",
            "snap-x snap-mandatory",
            "flex scrollbar-none touch-pan-x"
          )}
        >
          {media.map((u, i) => (
          <div
            key={u}
            className={cn(
              "min-w-full snap-center transition-transform duration-300 ease-out",
              "bg-muted/20",
              i === index ? "scale-[1.0]" : "scale-[0.985]",
              aspectCls
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={absMediaUrl(u)}
              alt="post media"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              draggable={false}
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-full w-full object-cover"
            />
          </div>
          ))}
        </div>

        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Imagem anterior"
              className="canhoes-tap absolute left-1.5 sm:left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/35 p-1 text-white opacity-90 sm:opacity-0 shadow-lg transition-all sm:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35"
              disabled={index === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Próxima imagem"
              className="canhoes-tap absolute right-1.5 sm:right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/35 p-1 text-white opacity-90 sm:opacity-0 shadow-lg transition-all sm:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35"
              disabled={index === media.length - 1}
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/35 to-transparent" />
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="mt-1.5 flex items-center justify-center gap-1">
          {media.map((u, i) => (
            <button
              key={`dot-${u}-${i}`}
              type="button"
              aria-label={`Ir para imagem ${i + 1}`}
              className={cn(
                "canhoes-tap h-1.5 rounded-full transition-all",
                i === index ? "w-4 sm:w-5 bg-primary" : "w-1.5 bg-primary/40"
              )}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
