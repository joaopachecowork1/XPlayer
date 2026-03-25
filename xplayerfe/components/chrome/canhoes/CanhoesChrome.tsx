"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesMoreSheet } from "./CanhoesMoreSheet";
import { CanhoesComposeSheet } from "./CanhoesComposeSheet";

const BG_PRESETS = [
  { id: "base", label: "Base", emoji: "🌿", background: "var(--bg-base)" },
  { id: "surface", label: "Superfície", emoji: "🪖", background: "var(--bg-surface)" },
  { id: "elevated", label: "Elevado", emoji: "🏛️", background: "var(--bg-elevated)" },
] as const;

type BgPresetId = (typeof BG_PRESETS)[number]["id"];
const BG_LS_KEY = "canhoes-bg-preset";

export function CanhoesChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();

  const [moreOpen, setMoreOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [bgPreset, setBgPreset] = useState<BgPresetId>("base");

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
    if (pathname?.startsWith("/canhoes/categorias")) return "Categorias";
    if (pathname?.startsWith("/canhoes/votacao")) return "Votação";
    if (pathname?.startsWith("/canhoes/stickers")) return "Stickers";
    if (pathname?.startsWith("/canhoes/admin")) return "Admin";
    if (pathname?.startsWith("/canhoes/wishlist")) return "Wishlist";
    if (pathname?.startsWith("/canhoes/amigo-secreto")) return "Amigo Secreto";
    if (pathname?.startsWith("/canhoes/gala")) return "Gala";
    if (pathname?.startsWith("/canhoes/medidas")) return "Medidas";
    if (pathname?.startsWith("/canhoes/nomeacoes")) return "Nomeações";
    return "Feed";
  }, [pathname]);

  const isFeedPath = pathname === "/canhoes" || pathname === "/canhoes/";

  return (
    <div
      data-theme="canhoes"
      className={cn("relative isolate min-h-[100svh] flex flex-col overflow-hidden")}
      style={{ background: currentBg.background }}
    >
      <header className="sticky top-0 z-30 sidebar" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="h-12 px-3 sm:h-13 sm:px-4 flex items-center justify-between gap-2">
          <div className="min-w-0 flex flex-col">
            <span className="canhoes-title text-base leading-tight truncate">{currentBg.emoji} Canhões do Ano</span>
            {title !== "Feed" && <span className="text-[10px] leading-none mt-0.5 truncate text-[var(--text-muted)]">{title}</span>}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={cycleBackground}
              className="canhoes-tap nav-item h-8 w-8 flex items-center justify-center text-base"
              aria-label={`Fundo: ${currentBg.label}`}
              title={`Mudar fundo: ${currentBg.label}`}
            >
              {currentBg.emoji}
            </button>

            {isLogged && (
              <Button variant="ghost" size="sm" onClick={() => logout()} className="h-8 px-2 text-xs">
                Sair
              </Button>
            )}

            <button
              className="canhoes-tap nav-item h-8 px-3 flex items-center justify-center text-sm font-medium"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
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

      <main className="relative z-10 flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]">
        <div className={cn("mx-auto w-full max-w-2xl py-2.5 sm:py-3", isFeedPath ? "px-0 sm:px-2" : "px-2.5 sm:px-3")}>{children}</div>
      </main>

      <CanhoesBottomTabs pathname={pathname ?? ""} onNavigate={(href) => router.push(href)} onCompose={() => setComposeOpen(true)} />

      <CanhoesMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        onNavigate={(href) => {
          setMoreOpen(false);
          router.push(href);
        }}
      />

      <CanhoesComposeSheet open={composeOpen} onOpenChange={setComposeOpen} onDone={() => setComposeOpen(false)} />
    </div>
  );
}
