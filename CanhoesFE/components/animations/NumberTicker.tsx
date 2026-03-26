"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  className?: string;
  delay?: number;
  from?: number;
  duration?: number;
}

/**
 * NumberTicker Animation (Mockup Reference)
 *
 * Animação de contagem para badges numéricos:
 * - Conta de 0 até ao valor final
 * - Duração: 400ms
 * - Easing: ease-out
 * - Font: tabular-nums (para alinhamento)
 *
 * Uso:
 * ```tsx
 * <NumberTicker value={4200} />
 * ```
 */
export function NumberTicker({ value, className, delay = 0, from = 0, duration = 400 }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible || !ref.current) return;

    const node = ref.current;
    const start = from;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-out
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.round(start + (end - start) * eased);
      node.textContent = current.toLocaleString("pt-PT");

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        node.textContent = value.toLocaleString("pt-PT");
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, from, duration]);

  return (
    <span
      ref={ref}
      className={cn("number-ticker inline-block min-w-[1.5em] text-right", className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(4px)",
      }}
    >
      {from}
    </span>
  );
}
