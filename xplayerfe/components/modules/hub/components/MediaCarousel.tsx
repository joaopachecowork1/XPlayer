"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { absMediaUrl } from "./hubUtils";

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
}: {
  urls: string[];
  className?: string;
  aspect?: "square" | "portrait";
}) {
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

  const aspectCls =
    aspect === "portrait" ? "aspect-[4/5]" : "aspect-square";

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={ref}
        onScroll={onScroll}
        className={cn(
          "relative w-full overflow-x-auto rounded-xl border",
          "snap-x snap-mandatory",
          "flex"
        )}
      >
        {media.map((u) => (
          <div
            key={u}
            className={cn(
              "min-w-full snap-center",
              "bg-muted/20",
              aspectCls
            )}
          >
            <img
              src={absMediaUrl(u)}
              alt="post media"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {media.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-1">
          {media.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para imagem ${i + 1}`}
              className={cn(
                "h-2 w-2 rounded-full border",
                i === index ? "bg-primary" : "bg-transparent"
              )}
              onClick={() => {
                const el = ref.current;
                if (!el) return;
                el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
