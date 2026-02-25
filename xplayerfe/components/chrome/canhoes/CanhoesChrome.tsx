"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";

import { Button } from "@/components/ui/button";
import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesMoreSheet } from "./CanhoesMoreSheet";
import { CanhoesComposeSheet } from "./CanhoesComposeSheet";

export function CanhoesChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();
  const isAdmin = useIsAdmin();

  const [moreOpen, setMoreOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const title = useMemo(() => {
    if (pathname.startsWith("/canhoes/categorias")) return "Categorias";
    if (pathname.startsWith("/canhoes/votacao")) return "Votação";
    if (pathname.startsWith("/canhoes/stickers")) return "Stickers";
    if (pathname.startsWith("/canhoes/admin")) return "Admin";
    return "Feed";
  }, [pathname]);

  return (
    <div
      data-theme="canhoes"
      className={cn(
        "min-h-dvh flex flex-col",
        // subtle party background
        "bg-[radial-gradient(1000px_500px_at_-10%_-10%,rgba(16,185,129,0.25)_0%,transparent_60%),radial-gradient(800px_400px_at_110%_10%,rgba(34,197,94,0.18)_0%,transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.8)_0%,rgba(2,6,23,0.95)_100%)]"
      )}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/75 backdrop-blur">
        <div className="h-12 px-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] leading-none text-muted-foreground">Canhões</div>
            <div className="font-semibold leading-tight truncate">{title}</div>
          </div>

          <div className="flex items-center gap-2">
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

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="mx-auto w-full max-w-2xl px-3 py-3">
          {children}
        </div>
      </main>

      {/* Bottom tabs (mobile-first). On desktop it's still ok; we keep it for now. */}
      <CanhoesBottomTabs
        pathname={pathname}
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
