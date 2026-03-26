"use client";

import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesMoreSheet } from "./CanhoesMoreSheet";
import { CanhoesComposeSheet } from "./CanhoesComposeSheet";

const PAGE_TITLES = [
  { href: "/canhoes/admin", label: "Admin" },
  { href: "/canhoes/amigo-secreto", label: "Amigo Secreto" },
  { href: "/canhoes/categorias", label: "Categorias" },
  { href: "/canhoes/feed", label: "Feed" },
  { href: "/canhoes/gala", label: "Gala" },
  { href: "/canhoes/medidas", label: "Medidas" },
  { href: "/canhoes/nomeacoes", label: "Nomeações" },
  { href: "/canhoes/stickers", label: "Stickers" },
  { href: "/canhoes/votacao", label: "Votação" },
  { href: "/canhoes/wishlist", label: "Wishlist" },
] as const;

const BACKGROUND_PRESETS = [
  {
    id: "moss",
    label: "Musgo",
    emoji: "🌿",
    className:
      "bg-[radial-gradient(circle_at_top,_rgba(107,124,69,0.24),_transparent_32%),linear-gradient(180deg,#202617_0%,var(--color-bg-primary)_40%,#11150d_100%)]",
  },
  {
    id: "fire",
    label: "Brasa",
    emoji: "🔥",
    className:
      "bg-[radial-gradient(circle_at_top,_rgba(255,107,53,0.18),_transparent_34%),linear-gradient(180deg,#2c1d13_0%,var(--color-bg-primary)_44%,#11150d_100%)]",
  },
  {
    id: "psycho",
    label: "Psycho",
    emoji: "⚡",
    className:
      "bg-[radial-gradient(circle_at_top,_rgba(77,150,255,0.2),_transparent_32%),linear-gradient(180deg,#1d2318_0%,var(--color-bg-primary)_44%,#10140d_100%)]",
  },
] as const;

type BackgroundPresetId = (typeof BACKGROUND_PRESETS)[number]["id"];

const BACKGROUND_STORAGE_KEY = "canhoes-bg-preset";

function getPageTitle(pathname: string | null) {
  if (!pathname) return "Feed";

  const matchedPage = PAGE_TITLES.find(({ href }) => pathname.startsWith(href));
  return matchedPage?.label ?? "Feed";
}

export function CanhoesChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isComposeSheetOpen, setIsComposeSheetOpen] = useState(false);
  const [backgroundPresetId, setBackgroundPresetId] = useState<BackgroundPresetId>("moss");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Scroll listener para backdrop blur dinâmico
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load saved preset
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPresetId = localStorage.getItem(BACKGROUND_STORAGE_KEY) as BackgroundPresetId | null;
    const hasValidPreset = BACKGROUND_PRESETS.some(({ id }) => id === savedPresetId);

    if (savedPresetId && hasValidPreset) {
      setBackgroundPresetId(savedPresetId);
    }
  }, []);

  // Fade transition ao mudar background
  useEffect(() => {
    setIsTransitioning(true);
    const t = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(t);
  }, [backgroundPresetId]);

  const currentBackgroundPreset =
    BACKGROUND_PRESETS.find(({ id }) => id === backgroundPresetId) ?? BACKGROUND_PRESETS[0];
  const pageTitle = getPageTitle(pathname);
  const isFeedPath = pathname === "/canhoes" || pathname === "/canhoes/" || pathname === "/canhoes/feed";

  const handleBackgroundCycle = () => {
    const currentPresetIndex = BACKGROUND_PRESETS.findIndex(({ id }) => id === backgroundPresetId);
    const nextPreset = BACKGROUND_PRESETS[(currentPresetIndex + 1) % BACKGROUND_PRESETS.length];

    setBackgroundPresetId(nextPreset.id);
    if (typeof window !== "undefined") {
      localStorage.setItem(BACKGROUND_STORAGE_KEY, nextPreset.id);
    }
  };

  return (
    <div
      data-theme="canhoes"
      className={cn(
        "relative isolate flex min-h-[100svh] flex-col overflow-hidden transition-opacity duration-300",
        currentBackgroundPreset.className,
        isTransitioning && "opacity-90"
      )}
    >
      {/* Header Sticky com Backdrop Blur Dinâmico */}
      <header
        className={cn(
          "sticky top-0 z-30 border-b border-[var(--color-moss)]/20 transition-all duration-300",
          "backdrop-blur-dynamic",
          isScrolled && "backdrop-blur-dynamic scrolled",
          "bg-[rgba(26,31,20,0.84)]"
        )}
      >
        <div className="mx-auto flex min-h-16 max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="label text-[var(--color-text-muted)]">Canhões</p>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-base">
                {currentBackgroundPreset.emoji}
              </span>
              <div className="min-w-0">
                <h1 className="heading-2 truncate text-[var(--color-text-primary)]">Canhões do Ano</h1>
                <p className="body-small truncate text-[var(--color-text-muted)]">{pageTitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackgroundCycle}
              className="canhoes-tap flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-moss)]/25 bg-white/5 text-lg text-[var(--color-text-primary)]"
              aria-label={`Mudar fundo. Actual: ${currentBackgroundPreset.label}`}
              title={`Mudar fundo: ${currentBackgroundPreset.label}`}
              type="button"
            >
              {currentBackgroundPreset.emoji}
            </button>

            {isLogged ? (
              <Button variant="ghost" className="hidden px-3 py-2 sm:inline-flex" onClick={() => logout()}>
                Sair
              </Button>
            ) : null}

            <Button
              variant="secondary"
              size="icon"
              className="shrink-0"
              onClick={() => setIsMoreSheetOpen(true)}
              aria-label="Abrir menu"
              title={user?.email ?? "Mais opções"}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))]">
        <div className={cn("mx-auto w-full max-w-2xl py-4", isFeedPath ? "px-0 sm:px-4" : "px-4")}>{children}</div>
      </main>

      <CanhoesBottomTabs
        pathname={pathname ?? ""}
        onNavigate={(href) => router.push(href)}
        onCompose={() => setIsComposeSheetOpen(true)}
      />

      <CanhoesMoreSheet
        open={isMoreSheetOpen}
        onOpenChange={setIsMoreSheetOpen}
        onNavigate={(href) => {
          setIsMoreSheetOpen(false);
          router.push(href);
        }}
      />

      <CanhoesComposeSheet
        open={isComposeSheetOpen}
        onOpenChange={setIsComposeSheetOpen}
        onDone={() => setIsComposeSheetOpen(false)}
      />
    </div>
  );
}
