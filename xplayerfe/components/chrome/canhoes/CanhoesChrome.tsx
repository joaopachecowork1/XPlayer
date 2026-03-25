"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesMoreSheet } from "./CanhoesMoreSheet";
import { CanhoesComposeSheet } from "./CanhoesComposeSheet";
import { SmokeOverlay } from "@/components/animations";

// Available background presets – varied game-like palettes
const BG_PRESETS = [
  {
    id: "musgo",
    label: "Verde Musgo",
    emoji: "🌿",
    className: "bg-[linear-gradient(135deg,#0f2415_0%,#162d1c_50%,#0d1a11_100%)]",
  },
  {
    id: "brasa",
    label: "Brasa",
    emoji: "🔥",
    className: "bg-[linear-gradient(135deg,#1a0a00_0%,#2a1200_45%,#0f0800_100%)]",
  },
  {
    id: "abismo",
    label: "Abismo",
    emoji: "🌌",
    className: "bg-[linear-gradient(160deg,#060812_0%,#0a0d1e_50%,#040609_100%)]",
  },
  {
    id: "aurora",
    label: "Aurora",
    emoji: "🌠",
    className: "bg-[linear-gradient(135deg,#0d0a20_0%,#150d2e_45%,#0a1018_100%)]",
  },
  {
    id: "selva",
    label: "Selva Neon",
    emoji: "🌴",
    className: "bg-[linear-gradient(160deg,#001a07_0%,#002b0e_50%,#000d03_100%)]",
  },
  {
    id: "noite",
    label: "Noite Clara",
    emoji: "🌙",
    className: "bg-[linear-gradient(180deg,#1a2620_0%,#0f1f16_100%)]",
  },
] as const;

type BgPresetId = (typeof BG_PRESETS)[number]["id"];

// Overlay mist colours per preset (neon accent + warm base)
const BG_OVERLAYS: Record<BgPresetId, string> = {
  musgo: [
    "radial-gradient(120% 60% at 50% 0%, rgba(0,255,68,0.07) 0%, transparent 55%)",
    "radial-gradient(80% 40% at 20% 85%, rgba(255,140,0,0.08) 0%, transparent 70%)",
    "radial-gradient(90% 45% at 85% 80%, rgba(0,200,80,0.10) 0%, transparent 74%)",
  ].join(","),
  brasa: [
    "radial-gradient(120% 60% at 50% 0%, rgba(255,80,0,0.10) 0%, transparent 55%)",
    "radial-gradient(80% 40% at 10% 90%, rgba(255,140,0,0.14) 0%, transparent 70%)",
    "radial-gradient(90% 45% at 90% 75%, rgba(200,40,0,0.08) 0%, transparent 74%)",
  ].join(","),
  abismo: [
    "radial-gradient(120% 60% at 50% 0%, rgba(80,80,255,0.06) 0%, transparent 55%)",
    "radial-gradient(80% 40% at 15% 90%, rgba(0,180,255,0.07) 0%, transparent 70%)",
    "radial-gradient(90% 45% at 85% 80%, rgba(120,0,255,0.05) 0%, transparent 74%)",
  ].join(","),
  aurora: [
    "radial-gradient(120% 60% at 50% 0%, rgba(140,60,255,0.09) 0%, transparent 55%)",
    "radial-gradient(80% 40% at 20% 85%, rgba(0,200,120,0.09) 0%, transparent 70%)",
    "radial-gradient(90% 45% at 80% 75%, rgba(80,0,200,0.08) 0%, transparent 74%)",
  ].join(","),
  selva: [
    "radial-gradient(120% 60% at 50% 0%, rgba(0,255,68,0.12) 0%, transparent 55%)",
    "radial-gradient(80% 40% at 15% 90%, rgba(0,255,100,0.10) 0%, transparent 70%)",
    "radial-gradient(90% 45% at 85% 80%, rgba(0,180,50,0.08) 0%, transparent 74%)",
  ].join(","),
  noite: [
    "radial-gradient(120% 60% at 50% 0%, rgba(0,255,68,0.05) 0%, transparent 55%)",
    "radial-gradient(80% 40% at 20% 85%, rgba(100,200,140,0.06) 0%, transparent 70%)",
    "radial-gradient(90% 45% at 85% 80%, rgba(0,160,60,0.07) 0%, transparent 74%)",
  ].join(","),
};

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
  const [composeOpen, setComposeOpen] = useState(false);
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
    return "Feed";
  }, [pathname]);

  const isFeedPath = pathname === "/canhoes" || pathname === "/canhoes/";

  return (
    <div
      data-theme="canhoes"
      className={cn("relative isolate min-h-[100svh] flex flex-col overflow-hidden", currentBg.className)}
    >
      {/* ── Layer 1: atmospheric mist overlay — colour-keyed to preset ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: BG_OVERLAYS[bgPreset] ?? BG_OVERLAYS.musgo }}
      />

      {/* ── Layer 2: canvas smoke particles (organic, bege, 60fps) ── */}
      <SmokeOverlay />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: "linear-gradient(180deg, rgba(6,14,9,0.92) 0%, rgba(6,14,9,0.80) 100%)",
          borderBottom: "1px solid rgba(0,255,68,0.14)",
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
              {currentBg.emoji} Canhões do Ano
            </span>
            {title !== "Feed" && (
              <span
                className="text-[10px] leading-none mt-0.5 truncate"
                style={{ color: "rgba(0,255,68,0.55)", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                {title}
              </span>
            )}
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1">
            {/* Background preset cycle — shows current preset emoji */}
            <button
              onClick={cycleBackground}
              className="canhoes-tap h-8 w-8 flex items-center justify-center rounded-xl text-base"
              style={{ color: "rgba(0,255,68,0.70)" }}
              aria-label={`Fundo: ${currentBg.label}`}
              title={`Mudar fundo: ${currentBg.label}`}
            >
              {currentBg.emoji}
            </button>

            {isLogged && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="h-8 px-2 text-xs"
                style={{ color: "rgba(0,255,68,0.55)" }}
              >
                Sair
              </Button>
            )}

            {/* "Mais" menu trigger */}
            <button
              className="canhoes-tap h-8 px-3 flex items-center justify-center rounded-xl text-sm font-bold"
              style={{
                background: "rgba(0,255,68,0.08)",
                border: "1px solid rgba(0,255,68,0.18)",
                color: "rgba(0,255,68,0.80)",
                fontFamily: "'Nunito', sans-serif",
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
        <div
          className={cn(
            "mx-auto w-full max-w-2xl py-2.5 sm:py-3",
            isFeedPath ? "px-0 sm:px-2" : "px-2.5 sm:px-3"
          )}
        >
          {children}
        </div>
      </main>

      {/* ── Bottom tabs ── */}
      <CanhoesBottomTabs
        pathname={pathname ?? ""}
        onNavigate={(href) => router.push(href)}
        onCompose={() => setComposeOpen(true)}
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

      {/* ── Compose sheet ── */}
      <CanhoesComposeSheet
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onDone={() => setComposeOpen(false)}
      />
    </div>
  );
}
