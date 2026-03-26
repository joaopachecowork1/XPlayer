"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  count?: number;
  colors?: string[];
  className?: string;
  onComplete?: () => void;
}

/**
 * Particles Effect (Mockup Reference)
 *
 * Efeito de partículas/confetti ao votar ou submeter:
 * - Burst de partículas em direções aleatórias
 * - Cores psicadélicas (psycho-1 a psycho-5)
 * - Animação: 800ms
 * - Auto-remove após conclusão
 *
 * Uso:
 * ```tsx
 * <Particles count={30} onComplete={() => setParticles(null)} />
 * ```
 */
export function Particles({ count = 20, colors, className, onComplete }: ParticlesProps) {
  const defaultColors = [
    "var(--color-psycho-1)", // Rosa
    "var(--color-psycho-2)", // Amarelo
    "var(--color-psycho-3)", // Verde
    "var(--color-psycho-4)", // Azul
    "var(--color-psycho-5)", // Roxo
  ];

  const particleColors = colors || defaultColors;

  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50, // center %
      y: 50, // center %
      tx: (Math.random() - 0.5) * 200, // -100 to 100px
      ty: (Math.random() - 1) * 150, // -150 to 0px (upward)
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      size: Math.random() * 8 + 4, // 4-12px
      rotation: Math.random() * 360,
    }));
  }, [count, particleColors]);

  const handleAnimationEnd = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      onAnimationEnd={handleAnimationEnd}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            "--tx": `${particle.tx}px`,
            "--ty": `${particle.ty}px`,
            transform: `rotate(${particle.rotation}deg)`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/**
 * Hook para gerar partículas num ponto específico
 */
export function useParticles() {
  const [particles, setParticles] = React.useState<{ x: number; y: number; id: number } | null>(null);

  const trigger = useCallback((x: number, y: number) => {
    setParticles({ x, y, id: Date.now() });
  }, []);

  const clear = useCallback(() => {
    setParticles(null);
  }, []);

  return { particles, trigger, clear };
}
