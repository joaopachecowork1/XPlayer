"use client";

/**
 * CannonBlast — Canvas-based confetti cannon animation.
 *
 * Fires colourful particles from the bottom-left and bottom-right corners,
 * simulating cannon blasts. Triggered imperatively via the `trigger` prop
 * (increment to fire). Uses requestAnimationFrame and automatically respects
 * `prefers-reduced-motion`.
 *
 * Colour palette: taverna greens + warm beige/gold + forest accents.
 */

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  gravity: number;
  decay: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  "#52b788", // bright green
  "#2d6a4f", // moss green
  "#e9d8a6", // warm beige-gold
  "#f5ebe0", // light beige
  "#c9b99a", // muted beige
  "#95d5b2", // pale green
  "#b7e4c7", // mint
];

function createCannonParticle(
  fromX: number,
  fromY: number,
  directionAngle: number,
  spread: number,
): Particle {
  const angle  = directionAngle + (Math.random() - 0.5) * spread;
  const speed  = Math.random() * 7 + 4;
  return {
    x:             fromX,
    y:             fromY,
    vx:            Math.cos(angle) * speed,
    vy:            Math.sin(angle) * speed,
    color:         COLORS[Math.floor(Math.random() * COLORS.length)],
    size:          Math.random() * 6 + 3,
    gravity:       0.18,
    decay:         Math.random() * 0.012 + 0.008,
    rotation:      Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.18,
    opacity:       1,
  };
}

interface Props {
  /** Increment this value to trigger a cannon blast */
  trigger: number;
  /** Number of particles per cannon (each side fires this many). Default: 60 */
  particlesPerCannon?: number;
  /** Duration of the animation in ms. Default: 3500 */
  duration?: number;
}

export function CannonBlast({ trigger, particlesPerCannon = 60, duration = 3500 }: Readonly<Props>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    if (trigger === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    /* Respect user's motion preference */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    /* Keep canvas sized to the viewport during the animation */
    const syncSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", syncSize, { passive: true });

    cancelAnimationFrame(animRef.current);

    const particles: Particle[] = [];
    const bottomY = canvas.height + 10;

    /* Left cannon — fires up-right */
    const leftX = canvas.width * 0.05;
    for (let i = 0; i < particlesPerCannon; i++) {
      particles.push(createCannonParticle(leftX, bottomY, -Math.PI / 3, 0.9));
    }
    /* Right cannon — fires up-left */
    const rightX = canvas.width * 0.95;
    for (let i = 0; i < particlesPerCannon; i++) {
      particles.push(createCannonParticle(rightX, bottomY, -Math.PI * 2 / 3, 0.9));
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        if (p.opacity <= 0) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle   = p.color;

        /* Draw as rounded rectangle (confetti) */
        const w = p.size;
        const h = p.size * 0.5;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 2);
        ctx.fill();
        ctx.restore();

        p.x        += p.vx;
        p.y        += p.vy;
        p.vy       += p.gravity;
        p.vx       *= 0.99;
        p.rotation += p.rotationSpeed;
        p.opacity  -= p.decay;
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", syncSize);
    };
  }, [trigger, particlesPerCannon, duration]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
