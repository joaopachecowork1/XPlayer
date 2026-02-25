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
import { Settings, LogOut, Bell, Menu } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type HeaderProps = {
  title?: string;
  onMenuClick?: () => void;
};

export function Header({ title = "", onMenuClick }: HeaderProps) {
  const { logout, user } = useAuth();
  const { data: session } = useSession();
  const router = useRouter();

  // Prefer backend user (has isAdmin) but always show the Google profile immediately.
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* PS-style: keep header minimal; show title only when explicitly provided. */}
          {title ? (
            <h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
          ) : (
            <span className="text-lg font-semibold tracking-tight">XPlayer</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />

          <Button variant="ghost" size="icon" aria-label="Notificações">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
                aria-label="Menu do utilizador"
              >
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{displayEmail || "—"}</p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  router.push("/settings");
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive"
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
