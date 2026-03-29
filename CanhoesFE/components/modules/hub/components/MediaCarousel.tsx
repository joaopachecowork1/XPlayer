"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { absMediaUrl } from "./hubUtils";

function useCarouselGesture(totalSlides: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    const deltaX = Math.abs(event.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(event.touches[0].clientY - touchStartY.current);

    if (deltaX > deltaY && deltaX > 10) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!isDragging.current) return;

    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;

    if (deltaX < -threshold && currentIndex < totalSlides - 1) {
      setCurrentIndex((previousIndex) => previousIndex + 1);
    } else if (deltaX > threshold && currentIndex > 0) {
      setCurrentIndex((previousIndex) => previousIndex - 1);
    }

    isDragging.current = false;
  };

  return {
    currentIndex,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    setCurrentIndex,
  };
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
  const { currentIndex, setCurrentIndex, handleTouchEnd, handleTouchMove, handleTouchStart } =
    useCarouselGesture(media.length);

  useEffect(() => {
    setCurrentIndex((previousIndex) =>
      Math.min(previousIndex, Math.max(media.length - 1, 0))
    );
  }, [media.length, setCurrentIndex]);

  if (media.length === 0) return null;

  const aspectClassName = aspect === "portrait" ? "aspect-[4/5]" : "aspect-square";

  if (media.length === 1) {
    return (
      <div className={cn("w-full", className)}>
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-[var(--color-beige-dark)]/25 bg-[var(--color-bg-surface)]",
            aspectClassName
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={absMediaUrl(media[0])}
            alt="Media do post"
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

  return (
    <div className={cn("w-full", className)}>
      <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-beige-dark)]/25 bg-[var(--color-bg-surface)]">
        <div
          className={cn("relative w-full", aspectClassName)}
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
            {media.map((url, index) => (
              <div
                key={url}
                aria-hidden={index !== currentIndex}
                className="h-full min-w-full flex-shrink-0 bg-[var(--color-bg-surface)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={absMediaUrl(url)}
                  alt={`Imagem ${index + 1} de ${media.length}`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentIndex((previousIndex) => Math.max(0, previousIndex - 1))}
            aria-label="Imagem anterior"
            className="canhoes-tap absolute left-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 text-[var(--text-primary)] opacity-95 shadow-[var(--shadow-panel)] transition-all sm:left-2 sm:opacity-0 sm:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrentIndex((previousIndex) =>
                Math.min(media.length - 1, previousIndex + 1)
              )
            }
            aria-label="Proxima imagem"
            className="canhoes-tap absolute right-1.5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 text-[var(--text-primary)] opacity-95 shadow-[var(--shadow-panel)] transition-all sm:right-2 sm:opacity-0 sm:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={currentIndex === media.length - 1}
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          <span
            className="pointer-events-none absolute bottom-2 right-2.5 z-10 rounded-full bg-[rgba(15,18,9,0.82)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
          >
            {currentIndex + 1} / {media.length}
          </span>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[rgba(36,25,20,0.24)] to-transparent" />
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-center gap-1">
        {media.map((url, index) => (
          <button
            key={`dot-${url}-${index}`}
            type="button"
            aria-label={`Ir para imagem ${index + 1}`}
            className={cn(
              "canhoes-tap h-1.5 rounded-full transition-all",
              index === currentIndex
                ? "w-4 bg-[var(--color-moss)] sm:w-5"
                : "w-1.5 bg-[var(--color-brown)]/30"
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
