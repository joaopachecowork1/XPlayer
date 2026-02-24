"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Image as ImageIcon, Vote, Gift, List } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

  // ✅ Filtrar items baseado em adminOnly
  const visibleItems = items.filter(item => {
    if (item.adminOnly) {
      return user?.isAdmin === true;
    }
    return true;
  });

  return (
    <div data-theme="canhoes" className="min-h-[100svh] bg-gradient-to-b from-emerald-950/35 via-background to-background">
      <div className="mx-auto max-w-6xl p-3 sm:p-6">
        <header className="flex items-center justify-between gap-3 rounded-2xl border bg-background/70 backdrop-blur px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">Canhões do Ano</div>
            <div className="font-semibold truncate">{user?.name ?? user?.email ?? ""}</div>
          </div>
          {isLogged && (
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Sair
            </Button>
          )}
        </header>

        <nav className="mt-3 rounded-2xl border bg-background/70 backdrop-blur px-2 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {visibleItems.map((it) => {
              const active = pathname === it.href;
              const Icon = it.icon;
              return (
                <Link 
                  key={it.href} 
                  href={it.href} 
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" /> {it.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <Separator className="my-4" />

        <main className="rounded-2xl border bg-background/70 backdrop-blur p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}