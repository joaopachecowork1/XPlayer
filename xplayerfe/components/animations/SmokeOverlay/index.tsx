"use client";

/**
 * SmokeOverlay — Canvas-based atmospheric smoke effect.
 *
 * Renders slow-rising beige/white translucent particles on a Canvas element
 * positioned as a fixed full-screen background layer. Uses requestAnimationFrame
 * for smooth 60fps rendering and automatically pauses when
 * `prefers-reduced-motion` is active.
 */

import { useEffect, useRef } from "react";

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  decay: number;
}

const PARTICLE_COUNT = 28;

function createParticle(canvasWidth: number, canvasHeight: number): SmokeParticle {
  return {
    x: Math.random() * canvasWidth,
    y: canvasHeight + Math.random() * 80,
    vx: (Math.random() - 0.5) * 0.35,
    vy: -(Math.random() * 0.4 + 0.15),
    radius: Math.random() * 28 + 14,
    opacity: Math.random() * 0.055 + 0.015,
    decay: Math.random() * 0.00035 + 0.00015,
  };
}

export function SmokeOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* Respect user's motion preference */
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let particles: SmokeParticle[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    let resizeTimer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 100);
    };
    window.addEventListener("resize", debouncedResize, { passive: true });

    /* Initialise particles spread across the viewport */
    particles = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(canvas.width, canvas.height),
    );
    /* Stagger initial y-positions so they don't all start at the bottom */
    particles.forEach((p, i) => {
      p.y = canvas.height - (i / PARTICLE_COUNT) * canvas.height * 1.2;
    });

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        /* Draw soft radial gradient blob */
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0,   `rgba(245, 235, 224, ${p.opacity})`);
        gradient.addColorStop(0.5, `rgba(233, 216, 166, ${p.opacity * 0.5})`);
        gradient.addColorStop(1,   "rgba(245, 235, 224, 0)");

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        /* Update position */
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= p.decay;
        p.radius  += 0.06;

        /* Reset when particle becomes invisible or leaves screen */
        if (p.opacity <= 0 || p.y < -p.radius * 2) {
          Object.assign(p, createParticle(canvas.width, canvas.height));
        }
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
