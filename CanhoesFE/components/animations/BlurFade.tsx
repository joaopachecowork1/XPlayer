"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
}

/**
 * BlurFade + Staggered Scroll Animation
 *
 * Animação de entrada dos cards ao fazer scroll (mockup reference):
 * - Fade in (opacity 0 → 1)
 * - Blur out (blur 8px → 0)
 * - Slide up (translateY 16px → 0)
 * - Scale (0.98 → 1)
 *
 * Uso:
 * ```tsx
 * <BlurFade delay={index * 0.05}>
 *   <Card />
 * </BlurFade>
 * ```
 */
export function BlurFade({ children, delay = 0, className, threshold = 0.1 }: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin: "50px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={cn("blurfade-in", className)}
      style={{
        animationDelay: `${delay}ms`,
        animationPlayState: isVisible ? "running" : "paused",
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}
