"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesMoreSheet } from "./CanhoesMoreSheet";
import { CanhoesComposeSheet } from "./CanhoesComposeSheet";

export function CanhoesChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();

  const [moreOpen, setMoreOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

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
    <div data-theme="canhoes" className={cn("relative isolate min-h-[100svh] flex flex-col overflow-hidden bg-[var(--bg-base)]")}>
      <header
        className="sticky top-0 z-30 sidebar"
        style={{
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="h-12 px-3 sm:h-13 sm:px-4 flex items-center justify-between gap-2">
          <div className="min-w-0 flex flex-col">
            <span className="canhoes-title text-base leading-tight truncate">Canhões do Ano</span>
            {title !== "Feed" && <span className="text-[10px] leading-none mt-0.5 truncate text-[var(--text-muted)]">{title}</span>}
          </div>

          <div className="flex items-center gap-1">
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
