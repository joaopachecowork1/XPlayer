"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function CanhoesLoginPage() {
  const router = useRouter();
  const { isLogged, loading, loginGoogle } = useAuth();
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Gerar partículas de folhas
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading && isLogged) {
      router.replace("/canhoes");
    }
  }, [loading, isLogged, router]);

  const handleLogin = () => {
    setIsSigningIn(true);
    loginGoogle();
  };

  // Debug info (remove em produção)
  if (typeof window !== "undefined") {
    console.log("[LoginPage] loading:", loading, "isLogged:", isLogged, "isSigningIn:", isSigningIn);
  }

  return (
    <div
      className="relative isolate min-h-[100svh] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 140% 90% at 50% 100%, #1a2f1e 0%, #0d1410 40%, #08100a 100%)",
      }}
    >
      {/* ── Partículas de folhas a cair ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute text-[var(--color-moss)]/20"
            style={{
              left: `${p.x}%`,
              top: `-20px`,
              animation: `leaf-fall ${8 + Math.random() * 4}s linear ${p.delay}s infinite`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            <Leaf className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
        ))}
      </div>

      {/* ── Glow de fundo ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            "radial-gradient(circle at 30% 40%, rgba(107, 124, 69, 0.12) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 60%, rgba(74, 92, 47, 0.1) 0%, transparent 45%)",
            "radial-gradient(circle at 50% 80%, rgba(107, 203, 119, 0.08) 0%, transparent 50%)",
          ].join(","),
        }}
      />

      {/* ── Main card ── */}
      <div
        className="relative z-10 flex flex-col items-center gap-8 px-6 py-12 w-full max-w-sm"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Logo/Emoji animado */}
        <div
          className="relative"
          style={{
            animation: "canhoes-bounce-rotate 4s ease-in-out infinite",
          }}
        >
          <Target
            className="h-20 w-20 sm:h-24 sm:w-24"
            style={{
              color: "var(--color-psycho-1)",
              filter: "drop-shadow(0 0 24px rgba(255, 107, 157, 0.5))",
            }}
          />
          <Leaf
            className="absolute -top-2 -right-2 h-8 w-8 sm:h-10 sm:w-10"
            style={{
              color: "var(--color-moss-light)",
              filter: "drop-shadow(0 0 16px rgba(107, 124, 69, 0.6))",
              animation: "leaf-spin 8s linear infinite",
            }}
          />
        </div>

        {/* Título */}
        <div className="text-center space-y-3">
          <h1
            className="font-black tracking-tight"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.8rem, 7vw, 2.5rem)",
              color: "var(--color-cream)",
              textShadow: "0 0 40px rgba(212, 184, 150, 0.4), 0 0 80px rgba(107, 124, 69, 0.3)",
              lineHeight: 1.1,
            }}
          >
            CANHÕES DO ANO
          </h1>
          <p
            className="text-sm sm:text-base font-medium tracking-widest uppercase"
            style={{
              color: "var(--color-moss-light)",
              textShadow: "0 0 20px rgba(107, 124, 69, 0.5)",
            }}
          >
            O Ritual Anual
          </p>
        </div>

        {/* Divisor decorativo */}
        <div
          className="w-full h-px relative overflow-hidden"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(107, 124, 69, 0.5) 50%, transparent 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(107, 203, 119, 0.4), transparent)",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Botão de Login com Google */}
        <div className="w-full">
          <button
            onClick={handleLogin}
            disabled={isSigningIn || (loading && isLogged)}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all duration-300 backdrop-blur-sm"
            style={{
              background: "rgba(26, 35, 24, 0.7)",
              border: "2px solid rgba(107, 124, 69, 0.4)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(107, 124, 69, 0.1)",
              color: "var(--color-text-primary)",
              opacity: (isSigningIn || (loading && isLogged)) ? 0.6 : 1,
              transform: (isSigningIn || (loading && isLogged)) ? "scale(0.99)" : "scale(1)",
            }}
          >
            <Leaf className="h-5 w-5 flex-shrink-0" style={{ color: "var(--color-moss-light)" }} />
            {(isSigningIn || (loading && isLogged)) ? "A entrar…" : "Continuar com Google"}
          </button>
        </div>

        {/* Nota de rodapé */}
        <p
          className="text-center text-xs max-w-[280px]"
          style={{
            color: "rgba(184, 155, 122, 0.5)",
            fontFamily: "'Crimson Pro', Georgia, serif",
            lineHeight: 1.6,
          }}
        >
          🔒 Acesso exclusivo para membros dos Canhões
        </p>
      </div>

      {/* ── Linha decorativa inferior ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, var(--color-moss) 50%, transparent 100%)",
          opacity: 0.3,
        }}
      />
    </div>
  );
}
