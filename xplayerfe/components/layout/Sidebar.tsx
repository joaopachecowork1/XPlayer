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

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: any;
  children?: Array<{ id: string; label: string; href: string; icon: any; adminOnly?: boolean }>;
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
    // Mantemos sub-itens para acesso rápido (especialmente no desktop), mas o clique no item principal
    // deve SEMPRE levar ao feed (/canhoes), mesmo para admins.
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

export default function Sidebar({ collapsed, onCollapsedChange, onNavigate, mode = "desktop", className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = !!user?.isAdmin;
  const items = useMemo(() => {
    // Keep the primary navigation minimal. If the user is admin, expose a dedicated Admin entry
    // (separate from the Canhões module) at the bottom.
    if (!isAdmin) return NAVIGATION_ITEMS;
    return [
      ...NAVIGATION_ITEMS,
      { id: "canhoes-admin", label: "Admin Canhões", icon: Shield, href: "/canhoes/admin" },
    ];
  }, [isAdmin]);

  return (
    <aside className={cn(
      "border-r bg-background transition-all duration-300",
      mode === "mobile" ? "w-full" : (collapsed ? "w-16" : "w-64"),
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
              <span className="text-xl font-bold">XPlayer</span>
            </Link>
          )}
          {mode === "desktop" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapsedChange(!collapsed)}
              className={collapsed ? "mx-auto" : ""}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));

            const children = (item.children ?? []).filter((c) => !c.adminOnly || isAdmin);

            const wrapperClass = cn(
              "space-y-1",
              item.id === "canhoes-admin" && !collapsed && "mt-4 pt-4 border-t border-border/60"
            );

            return (
              <div key={item.id} className={wrapperClass}>
                <Link href={item.href} onClick={onNavigate}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start gap-3", collapsed && "justify-center")}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Button>
                </Link>

                {/* Submódulos (apenas quando expandido) */}
                {!collapsed && children.length > 0 ? (
                  <div className="pl-2 border-l border-border/50 space-y-1">
                    {children.map((c) => {
                      const CIcon = c.icon;
                      const childActive = pathname === c.href;
                      return (
                        <Link key={c.id} href={c.href} onClick={onNavigate}>
                          <Button
                            size="sm"
                            variant={childActive ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <CIcon className="h-4 w-4 flex-shrink-0" />
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
        <div className="p-4 border-t">
          <Link href="/sessions" onClick={onNavigate}>
            <Button className="w-full gap-2">
              <Plus className="h-5 w-5" />
              {!collapsed && <span>Nova Sessão</span>}
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
