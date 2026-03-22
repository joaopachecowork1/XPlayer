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
 */
export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        "fixed bottom-0 inset-x-0 z-40",
        "md:hidden",
        "border-t border-border/40",
        "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85",
        "pb-safe",
      )}
    >
      <ul className="flex h-16 items-stretch">
        {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <li key={id} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 px-1",
                  "transition-all duration-200 ease-out",
                  "tap-scale",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active pill indicator */}
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary animate-nav-indicator origin-center"
                    aria-hidden="true"
                  />
                )}

                <div className={cn(
                  "relative flex items-center justify-center rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary/12 w-12 h-7"
                    : "w-10 h-7",
                )}>
                  <Icon
                    className={cn(
                      "transition-all duration-200",
                      isActive ? "h-[22px] w-[22px]" : "h-[20px] w-[20px]",
                    )}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span className={cn(
                  "text-[10px] leading-none transition-all duration-200",
                  isActive ? "font-semibold" : "font-medium",
                )}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
