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

// Available background presets – simpler, more visible design
const BG_PRESETS = [
  {
    id: "musgo",
    label: "Verde Musgo",
    className:
      "bg-[linear-gradient(135deg,#0f2415_0%,#162d1c_50%,#0d1a11_100%)]",
  },
  {
    id: "noite-clara",
    label: "Noite Clara",
    className:
      "bg-[linear-gradient(180deg,#1a2620_0%,#0f1f16_100%)]",
  },
] as const;

type BgPresetId = (typeof BG_PRESETS)[number]["id"];

const BG_LS_KEY = "canhoes-bg-preset";

export function CanhoesChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();
  const isAdmin = useIsAdmin();

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
      className={cn("relative isolate min-h-[100svh] flex flex-col overflow-hidden", currentBg.className)}
    >
      {/* Lightweight atmosphere layers: jungle mist + burn glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(255,255,255,0.06)_0%,transparent_55%),radial-gradient(80%_40%_at_20%_85%,rgba(255,132,78,0.14)_0%,transparent_70%),radial-gradient(90%_45%_at_85%_80%,rgba(42,136,77,0.18)_0%,transparent_74%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.18] [background-image:linear-gradient(120deg,rgba(255,255,255,0.08)_0%,transparent_22%,rgba(255,255,255,0.03)_50%,transparent_74%)]"
      />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur-md">
        <div className="h-11 px-2.5 sm:h-12 sm:px-3 flex items-center justify-between gap-2">
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

      {/* Content – pb accounts for fixed tabs (h-14 = 3.5rem) + iOS home-indicator */}
      <main className="relative z-10 flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]">
        <div className={cn(
          "mx-auto w-full max-w-2xl py-2.5 sm:py-3",
          isFeedPath ? "px-0 sm:px-2" : "px-2.5 sm:px-3"
        )}>
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
