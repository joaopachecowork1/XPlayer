"use client";

import { useEffect, useRef } from "react";

interface BlastParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  gravity: number;
}

const COLORS = [
  "#52b788", // color-accent-bright (green)
  "#2d6a4f", // color-accent-green
  "#e9d8a6", // color-beige-warm (gold)
  "#f5ebe0", // color-beige-light
  "#c9b99a", // color-beige-muted
];

function createBlastParticle(x: number, y: number): BlastParticle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 6;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 3,
    radius: 3 + Math.random() * 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 1,
    gravity: 0.12 + Math.random() * 0.08,
  };
}

interface CannonBlastProps {
  /** Set to true to trigger the cannon blast animation. Resets when set back to false. */
  trigger: boolean;
}

/**
 * CannonBlast — confetti explosion from both lower corners.
 *
 * Fires when `trigger` goes from false → true.
 * Lasts ~3–4 seconds, not looping.
 * Disabled when prefers-reduced-motion is set.
 */
export function CannonBlast({ trigger }: CannonBlastProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevTrigger = useRef(false);

  useEffect(() => {
    if (!trigger || prevTrigger.current === trigger) return;
    prevTrigger.current = trigger;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: BlastParticle[] = [];
    const BURST_COUNT = 60;

    // Left cannon (bottom-left corner)
    for (let i = 0; i < BURST_COUNT; i++) {
      const p = createBlastParticle(canvas.width * 0.05, canvas.height * 0.9);
      // Bias velocity toward upper-right.
      p.vx = Math.abs(p.vx) + 1;
      p.vy = -Math.abs(p.vy) - 1;
      particles.push(p);
    }

    // Right cannon (bottom-right corner)
    for (let i = 0; i < BURST_COUNT; i++) {
      const p = createBlastParticle(canvas.width * 0.95, canvas.height * 0.9);
      // Bias velocity toward upper-left.
      p.vx = -(Math.abs(p.vx) + 1);
      p.vy = -Math.abs(p.vy) - 1;
      particles.push(p);
    }

    let rafId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = 0;

      for (const p of particles) {
        if (p.alpha <= 0) continue;
        alive++;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.alpha -= 0.012;
        p.radius *= 0.997;
      }

      if (alive > 0) {
        rafId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [trigger]);

  // Reset prevTrigger when trigger goes false.
  useEffect(() => {
    if (!trigger) {
      prevTrigger.current = false;
    }
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 9999 }}
    />
  );
}
