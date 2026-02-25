"use client";

import { cn } from "@/lib/utils";
import { Home, List, Plus, Vote, MoreHorizontal } from "lucide-react";

type Props = {
  pathname: string;
  onNavigate: (href: string) => void;
  onCompose: () => void;
  onMore: () => void;
};

function active(pathname: string, href: string) {
  if (href === "/canhoes") return pathname === "/canhoes" || pathname === "/canhoes/";
  return pathname.startsWith(href);
}

export function CanhoesBottomTabs({ pathname, onNavigate, onCompose, onMore }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto max-w-2xl px-2">
        <div className="h-16 grid grid-cols-5 items-center">
          <Tab
            label="Feed"
            icon={<Home className="h-5 w-5" />}
            active={active(pathname, "/canhoes")}
            onClick={() => onNavigate("/canhoes")}
          />

          <Tab
            label="Cats"
            icon={<List className="h-5 w-5" />}
            active={active(pathname, "/canhoes/categorias")}
            onClick={() => onNavigate("/canhoes/categorias")}
          />

          <ComposeButton onClick={onCompose} />

          <Tab
            label="Voto"
            icon={<Vote className="h-5 w-5" />}
            active={active(pathname, "/canhoes/votacao")}
            onClick={() => onNavigate("/canhoes/votacao")}
          />

          <Tab
            label="Mais"
            icon={<MoreHorizontal className="h-5 w-5" />}
            active={false}
            onClick={onMore}
          />
        </div>
      </div>
    </nav>
  );
}

function Tab({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-full flex flex-col items-center justify-center gap-0.5 text-[11px]",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span className={cn(active && "font-semibold")}>{label}</span>
    </button>
  );
}

function ComposeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "mx-auto -mt-6 h-12 w-12 rounded-full",
        "bg-primary text-primary-foreground shadow-lg",
        "flex items-center justify-center",
        "border border-primary/30"
      )}
      aria-label="Criar"
      title="Criar post"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
