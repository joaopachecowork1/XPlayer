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

export function NumberTicker({
  value,
  className,
  delay = 0,
  from = 0,
  duration = 400,
}: NumberTickerProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsVisible(true), delay);
    return () => window.clearTimeout(timeoutId);
  }, [delay]);

  useEffect(() => {
    if (!isVisible || !nodeRef.current) return undefined;

    const node = nodeRef.current;
    const startValue = from;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(
        startValue + (endValue - startValue) * easedProgress
      );

      node.textContent = currentValue.toLocaleString("pt-PT");

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        node.textContent = endValue.toLocaleString("pt-PT");
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [duration, from, isVisible, value]);

  return (
    <span
      ref={nodeRef}
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
