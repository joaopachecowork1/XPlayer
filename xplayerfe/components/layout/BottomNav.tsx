"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Calendar, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "home",     label: "Início",   href: "/dashboard", icon: Home },
  { id: "backlog",  label: "Backlog",  href: "/backlog",   icon: Library },
  { id: "sessions", label: "Sessões",  href: "/sessions",  icon: Calendar },
  { id: "canhoes",  label: "Canhões",  href: "/canhoes",   icon: Trophy },
  { id: "friends",  label: "Amigos",   href: "/friends",   icon: Users },
];

/**
 * Thumb-friendly bottom navigation for mobile screens.
 * Hidden on md+ (desktop uses the sidebar).
 *
 * Design notes:
 * - 56px height + safe-area padding
 * - 44px minimum tap target per item
 * - Active item gets emerald glow indicator
 * - Subtle backdrop-blur for depth
 */
export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        "fixed bottom-0 inset-x-0 z-40",
        "md:hidden", // desktop uses sidebar
        "border-t border-border/50",
        "bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
        "pb-safe",
      )}
    >
      <ul className="flex h-14 items-stretch">
        {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <li key={id} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-0.5 px-1",
                  "transition-all duration-150 ease-out",
                  "tap-scale", // press scale from globals.css
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span
                    className="absolute top-1 h-0.5 w-5 rounded-full bg-primary animate-nav-indicator"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-150",
                    isActive && "scale-110",
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
