"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  alphaDecay: number;
}

function createParticle(canvasWidth: number, canvasHeight: number): Particle {
  return {
    x: Math.random() * canvasWidth,
    y: canvasHeight + Math.random() * 60,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -(0.3 + Math.random() * 0.5),
    radius: 20 + Math.random() * 40,
    alpha: 0.03 + Math.random() * 0.05,
    alphaDecay: 0.0003 + Math.random() * 0.0003,
  };
}

/**
 * SmokeOverlay — full-screen canvas smoke particles.
 *
 * Organic beige/white particles rise slowly from the bottom.
 * Runs at 60fps via requestAnimationFrame.
 * pointer-events: none — never intercepts clicks.
 * Automatically disabled when prefers-reduced-motion is set.
 */
export function SmokeOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PARTICLE_COUNT = 30;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();

    // Debounce resize to avoid excessive redraws.
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };
    window.addEventListener("resize", handleResize);

    // Pre-populate particles spread across the visible area.
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle(canvas.width, canvas.height);
      // Stagger initial y positions so they don't all start at the bottom.
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Draw soft radial gradient orb.
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(245, 235, 224, ${p.alpha})`);
        gradient.addColorStop(1, "rgba(245, 235, 224, 0)");

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Update position.
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.alphaDecay;

        // Recycle particle when it fades out or exits the top.
        if (p.alpha <= 0 || p.y + p.radius < 0) {
          particles[i] = createParticle(canvas.width, canvas.height);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 1, zIndex: 0 }}
    />
  );
}
