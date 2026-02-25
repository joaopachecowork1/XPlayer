"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Image as ImageIcon, Vote, Gift, List, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const items = [
  { href: "/canhoes", label: "Visão geral", icon: Sparkles },
  { href: "/canhoes/stickers", label: "Sticker do Ano", icon: ImageIcon },
  { href: "/canhoes/votacao", label: "Votações", icon: Vote },
  { href: "/canhoes/wishlist", label: "Wishlist", icon: List },
  { href: "/canhoes/amigo-secreto", label: "Amigo Secreto", icon: Gift },
  { href: "/canhoes/admin", label: "Admin", icon: Sparkles, adminOnly: true },
];

export function CanhoesAppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLogged } = useAuth();

  const visibleItems = items.filter(item => {
    if (item.adminOnly) return user?.isAdmin === true;
    return true;
  });

  return (
    <div data-theme="canhoes" className="min-h-[100svh] bg-gradient-to-b from-emerald-950/35 via-background to-background flex flex-col">
      
      {/* 1. HEADER FIXO (Sticky) */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
          
          {/* Lado Esquerdo: Menu Mobile + Título */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            
            {/* Menu Sheet só aparece em Mobile */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-ml-2 shrink-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <SheetTitle className="text-left">Menu Canhões</SheetTitle>
                  <nav className="flex flex-col gap-2 mt-6">
                    {visibleItems.map((it) => {
                      const active = pathname === it.href;
                      const Icon = it.icon;
                      return (
                        <Link 
                          key={it.href} 
                          href={it.href} 
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          )}
                        >
                          <Icon className="h-5 w-5" /> {it.label}
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <div className="truncate">
              <div className="text-xs sm:text-sm font-bold text-primary truncate">Canhões do Ano</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {user?.name ?? user?.email ?? "Convidado"}
              </div>
            </div>
          </div>

          {/* Lado Direito: Logout */}
          {isLogged && (
            <Button variant="ghost" size="sm" onClick={() => logout()} className="shrink-0 text-xs sm:text-sm">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          )}
        </div>

        {/* 2. MENU DESKTOP (Escondido em Mobile) */}
        <div className="hidden md:block border-t bg-muted/10">
          <div className="mx-auto max-w-6xl px-4">
            <nav className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
              {visibleItems.map((it) => {
                const active = pathname === it.href;
                const Icon = it.icon;
                return (
                  <Link 
                    key={it.href} 
                    href={it.href} 
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm whitespace-nowrap transition-colors",
                      active ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" /> {it.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* 3. CONTEÚDO PRINCIPAL RESPONSIVO */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6">
        <div className="rounded-2xl border bg-background/50 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}