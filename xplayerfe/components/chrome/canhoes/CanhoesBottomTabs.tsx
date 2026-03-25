"use client";

import { cn } from "@/lib/utils";
import { Flame, Leaf, Plus, Trophy, Shield } from "lucide-react";

type Props = {
  pathname: string;
  onNavigate: (href: string) => void;
  onCompose: () => void;
};

function active(pathname: string, href: string) {
  if (href === "/canhoes") return pathname === "/canhoes" || pathname === "/canhoes/";
  return pathname.startsWith(href);
}

export function CanhoesBottomTabs({ pathname, onNavigate, onCompose }: Readonly<Props>) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-base)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="mx-auto max-w-2xl px-2">
        <div className="h-14 sm:h-16 grid grid-cols-5 items-center px-1">
          <Tab
            label="Feed"
            icon={<Leaf className="h-5 w-5" />}
            active={active(pathname, "/canhoes")}
            onClick={() => onNavigate("/canhoes")}
          />

          <Tab
            label="Ranking"
            icon={<Trophy className="h-5 w-5" />}
            active={active(pathname, "/canhoes/categorias")}
            onClick={() => onNavigate("/canhoes/categorias")}
          />

          <ComposeButton onClick={onCompose} />

          <Tab
            label="Forum"
            icon={<Flame className="h-5 w-5" />}
            active={active(pathname, "/canhoes/votacao")}
            onClick={() => onNavigate("/canhoes/votacao")}
          />

          <Tab
            label="Admin"
            icon={<Shield className="h-5 w-5" />}
            active={active(pathname, "/canhoes/admin")}
            onClick={() => onNavigate("/canhoes/admin")}
            adminStyle
          />
        </div>
      </div>
    </nav>
  );
}

function Tab({
  label,
  icon,
  active: isActive,
  onClick,
  adminStyle = false,
}: Readonly<{
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  adminStyle?: boolean;
}>) {
  const activeColor = adminStyle ? "var(--text-accent)" : "var(--text-secondary)";
  const idleColor = "var(--text-muted)";

  return (
    <button
      onClick={onClick}
      style={{
        color: isActive ? activeColor : idleColor,
        transition: "color 0.15s ease, transform 0.1s ease",
      }}
      className={cn(
        "canhoes-tap h-full flex flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm-token)]",
        "text-[10px] sm:text-[11px] font-medium",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {icon}
      <span className="font-medium tracking-wide">{label}</span>
      {isActive && (
        <span
          className="h-0.5 w-5 rounded-full"
          style={{
            background: activeColor,
          }}
        />
      )}
    </button>
  );
}

function ComposeButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      onClick={onClick}
      className="canhoes-tap mx-auto -mt-5 sm:-mt-6 h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center"
      style={{
        background: "var(--btn-primary-bg)",
        border: "1px solid var(--border-accent)",
        boxShadow: "var(--shadow-card)",
        color: "var(--btn-primary-text)",
      }}
      aria-label="Criar post"
      title="Criar post"
    >
      <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
    </button>
  );
}
