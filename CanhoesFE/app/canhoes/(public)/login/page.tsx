"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { IS_MOCK_MODE } from "@/lib/mock";
import { StarField } from "@/components/animations";

export default function CanhoesLoginPage() {
  const router = useRouter();
  const { isLogged, loading, loginGoogle } = useAuth();
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // small delay so the entrance animation fires
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading && isLogged) router.replace("/canhoes");
  }, [loading, isLogged, router]);

  return (
    <div
      className="relative isolate min-h-[100svh] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% 110%, #1a3a1e 0%, #0d1f12 45%, #060d08 100%)",
      }}
    >
      {/* ── Stars particle layer ── */}
      <StarField count={150} />

      {/* ── Neon mist overlay ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            "radial-gradient(120% 50% at 50% 0%, rgba(0,255,68,0.07) 0%, transparent 60%)",
            "radial-gradient(80% 40% at 20% 100%, rgba(82,183,136,0.10) 0%, transparent 70%)",
            "radial-gradient(90% 40% at 80% 95%, rgba(0,200,60,0.08) 0%, transparent 70%)",
          ].join(","),
        }}
      />

      {/* ── Main card ── */}
      <div
        className="relative z-10 flex flex-col items-center gap-7 px-6 py-10 w-full max-w-sm"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.55s ease, transform 0.55s ease",
        }}
      >
        {/* Floating cannon emoji */}
        <div
          className="text-6xl select-none"
          style={{
            animation: "canhoes-bounce-rotate 3s ease-in-out infinite",
            filter: "drop-shadow(0 0 18px rgba(0,255,68,0.45))",
          }}
        >
          🎯
        </div>

        {/* Title */}
        <div className="text-center space-y-1.5">
          <h1
            className="canhoes-title"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              fontSize: "clamp(1.6rem, 6vw, 2.2rem)",
              fontWeight: 900,
              letterSpacing: "0.06em",
              color: "#e9d8a6",
              textShadow:
                "0 0 20px rgba(233,216,166,0.45), 0 0 50px rgba(0,255,68,0.20)",
              lineHeight: 1.1,
            }}
          >
            CANHÕES DO ANO
          </h1>
          <p
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "1rem",
              color: "rgba(0,255,68,0.60)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            O ritual anual dos Canhões
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,255,68,0.35) 50%, transparent 100%)",
          }}
        />

        {/* Buttons */}
        <div className="w-full space-y-3">
          {IS_MOCK_MODE ? (
            /* Demo mode — just enter directly */
            <button
              onClick={() => {
                setPressed(true);
                router.replace("/canhoes");
              }}
              disabled={pressed}
              className="canhoes-tap w-full h-13 rounded-2xl flex items-center justify-center gap-3 font-bold text-base"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, #7effa8 0%, #00cc44 45%, #008c2e 100%)",
                border: "1.5px solid rgba(0,255,68,0.50)",
                boxShadow:
                  "0 6px 24px rgba(0,204,68,0.45), 0 0 32px rgba(0,255,68,0.20)",
                color: "#062010",
                opacity: pressed ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              🎮 Entrar no Jogo
            </button>
          ) : (
            /* Real Google login */
            <button
              onClick={() => loginGoogle()}
              disabled={loading}
              className="canhoes-tap w-full h-13 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm"
              style={{
                background: "rgba(15,36,21,0.7)",
                border: "1.5px solid rgba(0,255,68,0.40)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.40), inset 0 1px 2px rgba(126,255,183,0.10)",
                color: "#e9d8a6",
                backdropFilter: "blur(10px)",
                opacity: loading ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <Chrome className="h-5 w-5 flex-shrink-0" />
              {loading ? "A entrar…" : "Continuar com Google"}
            </button>
          )}
        </div>

        {/* Footer note */}
        <p
          className="text-center text-xs"
          style={{
            color: "rgba(201,185,154,0.45)",
            fontFamily: "'Crimson Pro', Georgia, serif",
            lineHeight: 1.5,
          }}
        >
          {IS_MOCK_MODE
            ? "Modo demonstração · sem backend"
            : "Acesso exclusivo para membros dos Canhões"}
        </p>
      </div>

      {/* ── Bottom neon line ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-0.5 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,255,68,0.50) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}

