"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { SmokeOverlay } from "@/components/animations/SmokeOverlay";
import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesMoreSheet } from "./CanhoesMoreSheet";

// Available background presets — taverna de inverno dark greens
const BG_PRESETS = [
  {
    id: "musgo",
    label: "Musgo Escuro",
    className:
      "bg-[linear-gradient(160deg,#0d1a0f_0%,#111f14_40%,#0a1510_100%)]",
  },
  {
    id: "noite-clara",
    label: "Noite Quente",
    className:
      "bg-[linear-gradient(180deg,#142418_0%,#0d1a0f_100%)]",
  },
] as const;

type BgPresetId = (typeof BG_PRESETS)[number]["id"];

const BG_LS_KEY = "canhoes-bg-preset";

/**
 * CanhoesChrome — full-screen mobile-first shell for all Canhões pages.
 *
 * Layout:
 * ┌─────────────────────────────┐
 * │  Sticky header (Canhões)    │  48px
 * ├─────────────────────────────┤
 * │  Page content (scrollable)  │  flex-1
 * ├─────────────────────────────┤
 * │  Bottom tabs (5)            │  56px + safe-area
 * └─────────────────────────────┘
 *
 * Visual layers (back → front):
 * 1. Radial gradient background (BG_PRESETS, user-selectable)
 * 2. Atmospheric overlay — soft neon mist at top + warm glow at bottom
 * 3. Smoke particle layer — 5 animated orbs for depth
 * 4. Page content
 * 5. Header (sticky)
 * 6. Bottom tabs (fixed)
 */
export function CanhoesChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();

  const [moreOpen, setMoreOpen] = useState(false);
  const [bgPreset, setBgPreset] = useState<BgPresetId>("musgo");

  // Restore saved background preference on mount.
  useEffect(() => {
    if (globalThis.window === undefined) return;
    const saved = localStorage.getItem(BG_LS_KEY) as BgPresetId | null;
    if (saved && BG_PRESETS.some((p) => p.id === saved)) {
      setBgPreset(saved);
    }
  }, []);

  const cycleBackground = () => {
    const currentIdx = BG_PRESETS.findIndex((p) => p.id === bgPreset);
    const next = BG_PRESETS[(currentIdx + 1) % BG_PRESETS.length];
    setBgPreset(next.id);
    if (globalThis.window !== undefined) {
      globalThis.localStorage.setItem(BG_LS_KEY, next.id);
    }
  };

  const currentBg = BG_PRESETS.find((p) => p.id === bgPreset) ?? BG_PRESETS[0];

  const title = useMemo(() => {
    if (pathname?.startsWith("/canhoes/categorias"))   return "Categorias";
    if (pathname?.startsWith("/canhoes/votacao"))       return "Votação";
    if (pathname?.startsWith("/canhoes/stickers"))      return "Stickers";
    if (pathname?.startsWith("/canhoes/admin"))         return "Admin";
    if (pathname?.startsWith("/canhoes/wishlist"))      return "Wishlist";
    if (pathname?.startsWith("/canhoes/amigo-secreto")) return "Amigo Secreto";
    if (pathname?.startsWith("/canhoes/gala"))          return "Gala";
    if (pathname?.startsWith("/canhoes/medidas"))       return "Medidas";
    if (pathname?.startsWith("/canhoes/nomeacoes"))     return "Nomeações";
    return "Nomeações";
  }, [pathname]);



  return (
    <div
      data-theme="canhoes"
      className={cn("relative isolate min-h-[100svh] flex flex-col overflow-hidden", currentBg.className)}
    >
      {/* ── Layer 1: atmospheric warm mist overlay ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            "radial-gradient(120% 60% at 50% 0%, rgba(82,183,136,0.06) 0%, transparent 55%)",
            "radial-gradient(80% 40% at 20% 85%, rgba(233,216,166,0.07) 0%, transparent 70%)",
            "radial-gradient(90% 45% at 85% 80%, rgba(45,106,79,0.10) 0%, transparent 74%)",
          ].join(","),
        }}
      />

      {/* ── Layer 2: canvas smoke overlay (beige/white particles) ── */}
      <SmokeOverlay />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: "linear-gradient(180deg, rgba(13,26,15,0.94) 0%, rgba(13,26,15,0.82) 100%)",
          borderBottom: "1px solid rgba(82,183,136,0.16)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="h-12 px-3 sm:h-13 sm:px-4 flex items-center justify-between gap-2">
          {/* App name + section */}
          <div className="min-w-0 flex flex-col">
            <span
              className="canhoes-title text-base leading-tight truncate"
              style={{ fontSize: "16px" }}
            >
              🕯️ Canhões do Ano
            </span>
            {title !== "Nomeações" && (
              <span
                className="text-[10px] leading-none mt-0.5 truncate"
                style={{ color: "rgba(82,183,136,0.65)", fontFamily: "'Crimson Pro', serif", fontWeight: 600 }}
              >
                {title}
              </span>
            )}
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1">
            {/* Background preset cycle */}
            <button
              onClick={cycleBackground}
              className="canhoes-tap h-8 w-8 flex items-center justify-center rounded-xl text-base"
              style={{ color: "rgba(233,216,166,0.50)" }}
              aria-label={`Fundo: ${currentBg.label}`}
              title={currentBg.label}
            >
              🎨
            </button>

            {isLogged && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="h-8 px-2 text-xs"
                style={{ color: "rgba(201,185,154,0.65)", fontFamily: "'Crimson Pro', serif" }}
              >
                Sair
              </Button>
            )}

            {/* "Mais" menu trigger */}
            <button
              className="canhoes-tap canhoes-btn-shine h-8 px-3 flex items-center justify-center rounded-xl text-sm font-bold"
              style={{
                background: "rgba(82,183,136,0.10)",
                border: "1px solid rgba(82,183,136,0.22)",
                color: "rgba(233,216,166,0.85)",
                fontFamily: "'Crimson Pro', serif",
              }}
              onClick={() => setMoreOpen(true)}
              aria-label="Mais"
              title={user?.email ?? "Mais"}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* ── Content — pb accounts for fixed tabs (56px) + iOS home-indicator ── */}
      <main className="relative z-10 flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto w-full max-w-2xl py-2.5 sm:py-3 px-2.5 sm:px-3">
          {children}
        </div>
      </main>

      {/* ── Bottom tabs ── */}
      <CanhoesBottomTabs
        pathname={pathname ?? ""}
        onNavigate={(href) => router.push(href)}
      />

      {/* ── More sheet (Stickers, Wishlist, Gala, …) ── */}
      <CanhoesMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        onNavigate={(href) => {
          setMoreOpen(false);
          router.push(href);
        }}
      />
    </div>
  );
}
