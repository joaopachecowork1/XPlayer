"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  Calendar,
  Users,
  Settings,
  Plus,
  Menu,
  Library,
  Trophy,
  Sticker,
  Vote,
  Shield,
  Sparkles,
  Gavel,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

import type { LucideIcon } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  children?: Array<{ id: string; label: string; href: string; icon: LucideIcon; adminOnly?: boolean }>;
};

const NAVIGATION_ITEMS: NavItem[] = [
  { id: "home", label: "Início", icon: Home, href: "/dashboard" },
  { id: "backlog", label: "Backlog", icon: Library, href: "/backlog" },
  { id: "sessions", label: "Sessões", icon: Calendar, href: "/sessions" },
  {
    id: "canhoes",
    label: "Canhões",
    icon: Trophy,
    href: "/canhoes",
    children: [
      { id: "canhoes-feed", label: "Feed", href: "/canhoes", icon: Sparkles },
      { id: "canhoes-categories", label: "Categorias", href: "/canhoes/categorias", icon: Library },
      { id: "canhoes-stickers", label: "Sticker do Ano", href: "/canhoes/stickers", icon: Sticker },
      { id: "canhoes-vote", label: "Votações", href: "/canhoes/votacao", icon: Vote },
      { id: "canhoes-measures", label: "Medidas", href: "/canhoes/medidas", icon: Gavel },
      { id: "canhoes-wishlist", label: "Wishlist", href: "/canhoes/wishlist", icon: Library },
      { id: "canhoes-secret", label: "Amigo Secreto", href: "/canhoes/amigo-secreto", icon: Users },
      { id: "canhoes-admin", label: "Admin", href: "/canhoes/admin", icon: Shield, adminOnly: true },
    ],
  },
  { id: "friends", label: "Amigos", icon: Users, href: "/friends" },
  { id: "settings", label: "Definições", icon: Settings, href: "/settings" },
];

type SidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  /** Fechar o menu (mobile drawer) após navegação */
  onNavigate?: () => void;
  /** Mobile drawer mode: sidebar should fill available width and not show collapse control. */
  mode?: "desktop" | "mobile";
  className?: string;
};

export default function Sidebar({ collapsed, onCollapsedChange, onNavigate, mode = "desktop", className }: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const { user } = useAuth();
  let widthClass = "w-64";
  if (mode === "mobile") {
    widthClass = "w-full";
  } else if (collapsed) {
    widthClass = "w-16";
  }

  const isAdmin = !!user?.isAdmin;
  const items = useMemo(() => {
    if (!isAdmin) return NAVIGATION_ITEMS;
    return [
      ...NAVIGATION_ITEMS,
      { id: "canhoes-admin", label: "Admin Canhões", icon: Shield, href: "/canhoes/admin" },
    ];
  }, [isAdmin]);

  return (
    <aside className={cn(
      "border-r border-jungle-400/20 bg-[linear-gradient(180deg,rgba(8,18,13,0.96)_0%,rgba(5,11,8,0.98)_100%)] backdrop-blur-md transition-all duration-300",
      widthClass,
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5 tap-scale">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center glow-primary">
                <span className="text-xs font-black text-white leading-none">X</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">XPlayer</span>
            </Link>
          )}
          {mode === "desktop" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapsedChange(!collapsed)}
              className={cn("h-9 w-9 shrink-0", collapsed ? "mx-auto" : "")}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const currentPath = pathname ?? "";
            const isActive = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href + "/"));

            const children = (item.children ?? []).filter((c) => !c.adminOnly || isAdmin);

            const wrapperClass = cn(
              "space-y-0.5",
              item.id === "canhoes-admin" && !collapsed && "mt-3 pt-3 border-t border-border/40"
            );

            return (
              <div key={item.id} className={wrapperClass}>
                <Link href={item.href} onClick={onNavigate}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-10 justify-start gap-3 tap-scale rounded-lg",
                      "transition-all duration-150",
                      collapsed && "justify-center px-0",
                      isActive
                            ? "canhoes-chip text-jungle-100 font-semibold shadow-[0_0_18px_rgba(65,255,134,0.14)]"
                            : "text-jungle-300/80 hover:text-jungle-100 hover:bg-jungle-800/55",
                    )}
                  >
                    <Icon className={cn(
                      "h-4.5 w-4.5 flex-shrink-0",
                          isActive ? "text-jungle-100" : "text-jungle-400/85"
                    )} strokeWidth={isActive ? 2.5 : 1.8} />
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                    {/* Active dot for collapsed mode */}
                    {collapsed && isActive && (
                      <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Button>
                </Link>

                {/* Submódulos (apenas quando expandido) */}
                {!collapsed && children.length > 0 ? (
                  <div className="pl-3 ml-2 border-l border-border/40 space-y-0.5">
                    {children.map((c) => {
                      const CIcon = c.icon;
                      const childActive = pathname === c.href;
                      return (
                        <Link key={c.id} href={c.href} onClick={onNavigate}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={cn(
                              "w-full h-8 justify-start gap-2 text-xs tap-scale rounded-md",
                              childActive
                                ? "text-primary bg-primary/10 font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                          >
                            <CIcon className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={childActive ? 2.5 : 1.8} />
                            <span>{c.label}</span>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        {/* New Session Button */}
        <div className="p-3 border-t border-border/50">
          <Link href="/sessions" onClick={onNavigate}>
            <Button
              className={cn(
                "w-full gap-2 h-10 tap-scale glow-primary-sm",
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <Plus className="h-4 w-4" />
              {!collapsed && <span className="text-sm font-semibold">Nova Sessão</span>}
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
