"use client";

import React, { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { absMediaUrl } from "./hubUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Mobile-first media carousel (Instagram-ish).
 * - Full width, transform-based slide transitions
 * - touch-action: pan-y lets the browser handle vertical page scroll natively
 * - JS detects horizontal intent (deltaX > deltaY) to change slides
 * - NO event.preventDefault() — avoids blocking the page scroll on iOS/Android
 * - Dots indicator + position counter
 */

function useCarouselGesture(totalSlides: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    // Only flag as a horizontal drag when the gesture is clearly horizontal.
    // Do NOT call e.preventDefault() — touch-action: pan-y already tells the
    // browser to handle vertical scrolling natively.
    if (deltaX > deltaY && deltaX > 10) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;
    if (deltaX < -threshold && currentIndex < totalSlides - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (deltaX > threshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
    isDragging.current = false;
  };

  return { currentIndex, setCurrentIndex, handleTouchStart, handleTouchMove, handleTouchEnd };
}

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
  const { currentIndex, setCurrentIndex, handleTouchStart, handleTouchMove, handleTouchEnd } =
    useCarouselGesture(media.length);

  if (media.length === 0) return null;

  // Single image — no carousel chrome needed.
  if (media.length === 1) {
    const aspectCls = aspect === "portrait" ? "aspect-[4/5]" : "aspect-square";
    return (
      <div className={cn("w-full", className)}>
        <div className={cn("overflow-hidden rounded-2xl border border-border/70 bg-black/15", aspectCls)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={absMediaUrl(media[0])}
            alt="post media"
            loading="lazy"
            decoding="async"
            draggable={false}
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    );
  }

  const aspectCls = aspect === "portrait" ? "aspect-[4/5]" : "aspect-square";

  return (
    <div className={cn("w-full", className)}>
      <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-black/15">
        {/* Carousel track — moved by CSS transform, not native scroll */}
        <div
          className={cn("relative w-full", aspectCls)}
          style={{ touchAction: "pan-y" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex h-full w-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: "transform 0.3s ease",
              willChange: "transform",
            }}
          >
            {media.map((u, i) => (
              <div
                key={u}
                aria-hidden={i !== currentIndex}
                className="min-w-full h-full flex-shrink-0 bg-muted/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={absMediaUrl(u)}
                  alt={`Slide ${i + 1} de ${media.length}`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Navigation arrows (visible on mobile, appear on hover for desktop) */}
          <button
            type="button"
            onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
            aria-label="Imagem anterior"
            className="canhoes-tap absolute left-1.5 sm:left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/35 p-1 text-white opacity-90 sm:opacity-0 shadow-lg transition-all sm:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((p) => Math.min(media.length - 1, p + 1))}
            aria-label="Próxima imagem"
            className="canhoes-tap absolute right-1.5 sm:right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/35 p-1 text-white opacity-90 sm:opacity-0 shadow-lg transition-all sm:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={currentIndex === media.length - 1}
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Position counter */}
          <span
            className="pointer-events-none absolute bottom-2 right-2.5 z-10 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/90"
            style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
          >
            {currentIndex + 1} / {media.length}
          </span>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-1.5 flex items-center justify-center gap-1">
        {media.map((u, i) => (
          <button
            key={`dot-${u}-${i}`}
            type="button"
            aria-label={`Ir para imagem ${i + 1}`}
            className={cn(
              "canhoes-tap h-1.5 rounded-full transition-all",
              i === currentIndex
                ? "w-4 sm:w-5 bg-[var(--color-accent-bright,var(--primary))]"
                : "w-1.5 bg-primary/40"
            )}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
