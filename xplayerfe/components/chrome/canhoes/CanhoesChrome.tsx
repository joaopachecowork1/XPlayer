"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";

import { Button } from "@/components/ui/button";
import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesMoreSheet } from "./CanhoesMoreSheet";
import { CanhoesComposeSheet } from "./CanhoesComposeSheet";

// Available background presets – cycle through them with the palette button.
const BG_PRESETS = [
  {
    id: "musgo",
    label: "Verde Musgo",
    className:
      "bg-[linear-gradient(160deg,#1a3320_0%,#0d1f12_100%)]",
  },
  {
    id: "noite",
    label: "Noite",
    className:
      "bg-[radial-gradient(1000px_500px_at_-10%_-10%,rgba(16,185,129,0.25)_0%,transparent_60%),radial-gradient(800px_400px_at_110%_10%,rgba(34,197,94,0.18)_0%,transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.8)_0%,rgba(2,6,23,0.95)_100%)]",
  },
  {
    id: "floresta",
    label: "Floresta",
    className:
      "bg-[linear-gradient(180deg,#0d2818_0%,#061510_100%)]",
  },
] as const;

type BgPresetId = (typeof BG_PRESETS)[number]["id"];

const BG_LS_KEY = "canhoes-bg-preset";

export function CanhoesChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();
  const isAdmin = useIsAdmin();

  const [moreOpen, setMoreOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [bgPreset, setBgPreset] = useState<BgPresetId>("musgo");

  // Restore saved background preference on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(BG_LS_KEY) as BgPresetId | null;
    if (saved && BG_PRESETS.some((p) => p.id === saved)) {
      setBgPreset(saved);
    }
  }, []);

  const cycleBackground = () => {
    const currentIdx = BG_PRESETS.findIndex((p) => p.id === bgPreset);
    const next = BG_PRESETS[(currentIdx + 1) % BG_PRESETS.length];
    setBgPreset(next.id);
    if (typeof window !== "undefined") {
      localStorage.setItem(BG_LS_KEY, next.id);
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

  return (
    <div
      data-theme="canhoes"
      className={cn("min-h-[100svh] flex flex-col", currentBg.className)}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/75 backdrop-blur">
        <div className="h-12 px-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] leading-none text-muted-foreground">Canhões</div>
            <div className="font-semibold leading-tight truncate">{title}</div>
          </div>

          <div className="flex items-center gap-1">
            {/* Cycle through background presets */}
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleBackground}
              className="h-8 w-8 px-0"
              aria-label={`Fundo: ${currentBg.label}`}
              title={`Fundo: ${currentBg.label}`}
            >
              <Palette className="h-4 w-4" />
            </Button>

            {isLogged && (
              <Button variant="ghost" size="sm" onClick={() => logout()} className="h-8 px-2">
                Sair
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMoreOpen(true)}
              className="h-8 px-2"
              aria-label="Mais"
              title={user?.email ?? "Mais"}
            >
              ☰
            </Button>
          </div>
        </div>
      </header>

      {/* Content – pb accounts for the fixed nav bar (h-16 = 4rem) + iOS home-indicator */}
      <main className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto w-full max-w-2xl px-3 py-3">
          {children}
        </div>
      </main>

      {/* Bottom tabs (mobile-first). On desktop it's still ok; we keep it for now. */}
      <CanhoesBottomTabs
        pathname={pathname ?? ""}
        onNavigate={(href) => router.push(href)}
        onCompose={() => setComposeOpen(true)}
        onMore={() => setMoreOpen(true)}
      />

      <CanhoesMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        isAdmin={isAdmin}
        onNavigate={(href) => {
          setMoreOpen(false);
          router.push(href);
        }}
      />

      <CanhoesComposeSheet
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onDone={() => setComposeOpen(false)}
      />
    </div>
  );
}
