"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, Menu } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

type HeaderProps = {
  title?: string;
  onMenuClick?: () => void;
};

export function Header({ title = "", onMenuClick }: HeaderProps) {
  const { logout, user } = useAuth();
  const { data: session } = useSession();
  const router = useRouter();

  const displayName = user?.name ?? session?.user?.name ?? "Utilizador";
  const displayEmail = user?.email ?? session?.user?.email ?? "";

  const initials =
    displayName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "U";

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full",
      "border-b border-border/50",
      "bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
    )}>
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile menu button — only shown on mobile where bottom nav doesn't cover settings/etc */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            aria-label="Abrir menu"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {title ? (
            <h1 className="text-lg sm:text-xl font-bold truncate">{title}</h1>
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center md:hidden glow-primary"
              >
                <span className="text-[10px] font-black text-white leading-none">X</span>
              </div>
              <span className="text-base font-semibold tracking-tight text-foreground md:hidden">XPlayer</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full tap-scale"
                aria-label="Menu do utilizador"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 animate-fade-in">
              <DropdownMenuLabel>
                <p className="font-semibold text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{displayEmail || "—"}</p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  router.push("/settings");
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Perfil & Definições
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  logout();
                  router.push("/login");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Terminar Sessão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
