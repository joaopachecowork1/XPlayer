"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  count?: number;
  colors?: string[];
  className?: string;
  durationMs?: number;
  onComplete?: () => void;
}

export function Particles({
  count = 20,
  colors,
  className,
  durationMs = 780,
  onComplete,
}: ParticlesProps) {
  const particleColors = React.useMemo(
    () =>
      colors ?? [
        "var(--color-psycho-1)",
        "var(--color-psycho-2)",
        "var(--color-psycho-3)",
        "var(--color-psycho-4)",
        "var(--color-brown)",
      ],
    [colors]
  );

  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, index) => ({
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      id: index,
      rotation: Math.random() * 360,
      size: Math.random() * 8 + 4,
      tx: (Math.random() - 0.5) * 220,
      ty: (Math.random() - 1) * 180,
      x: 50,
      y: 50,
    }));
  }, [count, particleColors]);

  useEffect(() => {
    if (!onComplete) return undefined;

    const timeoutId = window.setTimeout(onComplete, durationMs + 40);
    return () => window.clearTimeout(timeoutId);
  }, [durationMs, onComplete]);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle absolute rounded-full"
          style={
            {
              animationDuration: `${durationMs}ms`,
              backgroundColor: particle.color,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: `rotate(${particle.rotation}deg)`,
              width: `${particle.size}px`,
              "--tx": `${particle.tx}px`,
              "--ty": `${particle.ty}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function useParticles() {
  const [particles, setParticles] = React.useState<{
    x: number;
    y: number;
    id: number;
  } | null>(null);

  const trigger = React.useCallback((x: number, y: number) => {
    setParticles({ x, y, id: Date.now() });
  }, []);

  const clear = React.useCallback(() => {
    setParticles(null);
  }, []);

  return { particles, trigger, clear };
}
