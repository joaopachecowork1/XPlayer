"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  vx: number;
  vy: number;
  color: string;
}

const COLORS = [
  "rgba(0,255,68,",      // neon green
  "rgba(82,183,136,",    // accent bright
  "rgba(233,216,166,",   // beige warm
  "rgba(245,235,224,",   // beige light
  "rgba(255,255,255,",   // white
];

function createStar(w: number, h: number): Star {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    radius: 0.5 + Math.random() * 1.5,
    alpha: 0.2 + Math.random() * 0.7,
    twinkleSpeed: 0.5 + Math.random() * 1.5,
    twinkleOffset: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 0.08,
    vy: -0.05 - Math.random() * 0.1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

/**
 * StarField — full-screen canvas with twinkling, drifting star particles.
 *
 * Used on the login splash screen for a game-like atmospheric effect.
 * pointer-events: none — never intercepts clicks.
 * Automatically disabled when prefers-reduced-motion is set.
 *
 * @param count - Number of star particles to render simultaneously (default: 120).
 */
export function StarField({ count = 120 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    window.addEventListener("resize", handleResize);

    const stars: Star[] = Array.from({ length: count }, () =>
      createStar(canvas.width, canvas.height)
    );

    let t = 0;
    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.016;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
        const a = s.alpha * twinkle;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${a.toFixed(2)})`;
        ctx.fill();

        // soft glow for larger stars
        if (s.radius > 1.2) {
          const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 4);
          glow.addColorStop(0, `${s.color}${(a * 0.4).toFixed(2)})`);
          glow.addColorStop(1, `${s.color}0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        s.x += s.vx;
        s.y += s.vy;

        // Recycle when drifted off screen
        if (s.y + s.radius < 0 || s.x < -20 || s.x > canvas.width + 20) {
          const fresh = createStar(canvas.width, canvas.height);
          fresh.y = canvas.height + 10;
          stars[i] = fresh;
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
