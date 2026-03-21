"use client";

import { cn } from "@/lib/utils";
import { Flame, Leaf, Plus, Trophy, Shield } from "lucide-react";

type Props = {
  pathname: string;
  onNavigate: (href: string) => void;
  onCompose: () => void;
};

/**
 * CanhoesBottomTabs — Mobile-first 5-tab bottom navigation.
 *
 * Tabs: Feed · Ranking · [ + Compose ] · Forum · Admin
 *
 * Design:
 * - Dark glass background with neon-green border-top
 * - Active tab: neon-green label + animated glow indicator
 * - Admin tab is ALWAYS visible regardless of isAdmin — the page
 *   itself handles access control and shows "Acesso Negado" if needed.
 * - Compose (centre) is an elevated pill button with orange gradient.
 */
function active(pathname: string, href: string) {
  if (href === "/canhoes") return pathname === "/canhoes" || pathname === "/canhoes/";
  return pathname.startsWith(href);
}

export function CanhoesBottomTabs({ pathname, onNavigate, onCompose }: Readonly<Props>) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        borderTop: "1px solid rgba(0,255,68,0.15)",
        background: "linear-gradient(180deg, rgba(10,18,13,0.85) 0%, rgba(7,12,9,0.92) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="mx-auto max-w-2xl px-2">
        <div className="h-14 sm:h-16 grid grid-cols-5 items-center px-1">
          {/* Feed */}
          <Tab
            label="Feed"
            icon={<Leaf className="h-5 w-5" />}
            active={active(pathname, "/canhoes")}
            onClick={() => onNavigate("/canhoes")}
          />

          {/* Ranking */}
          <Tab
            label="Ranking"
            icon={<Trophy className="h-5 w-5" />}
            active={active(pathname, "/canhoes/categorias")}
            onClick={() => onNavigate("/canhoes/categorias")}
          />

          {/* Compose (centre, elevated) */}
          <ComposeButton onClick={onCompose} />

          {/* Forum / Votação */}
          <Tab
            label="Forum"
            icon={<Flame className="h-5 w-5" />}
            active={active(pathname, "/canhoes/votacao")}
            onClick={() => onNavigate("/canhoes/votacao")}
          />

          {/* Admin — always visible; page renders denial screen for non-admins */}
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

/** Single navigation tab button */
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
  // Admin tab uses a slightly different palette (yellow-gold when active, muted amber when idle).
  const activeColor  = adminStyle ? "#ffe135" : "#00ff44";
  const idleColor    = adminStyle ? "rgba(255,225,53,0.35)" : "rgba(0,255,68,0.35)";
  const glowColor    = adminStyle ? "rgba(255,225,53,0.5)"  : "rgba(0,255,68,0.5)";

  return (
    <button
      onClick={onClick}
      style={{
        color: isActive ? activeColor : idleColor,
        filter: isActive ? `drop-shadow(0 0 6px ${glowColor})` : "none",
        transition: "color 0.15s ease, filter 0.15s ease, transform 0.1s ease",
      }}
      className={cn(
        "canhoes-tap h-full flex flex-col items-center justify-center gap-0.5 rounded-xl",
        "text-[10px] sm:text-[11px] font-bold",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {icon}
      <span className="font-semibold tracking-wide" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {label}
      </span>
      {/* Active indicator bar */}
      {isActive && (
        <span
          className="h-0.5 w-5 rounded-full"
          style={{
            background: activeColor,
            boxShadow: `0 0 6px ${glowColor}`,
            animation: "canhoes-ambient-float 2.5s ease-in-out infinite",
          }}
        />
      )}
    </button>
  );
}

/** Centre compose button — elevated orange pill */
function ComposeButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      onClick={onClick}
      className="canhoes-tap mx-auto -mt-5 sm:-mt-6 h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center"
      style={{
        background: "radial-gradient(circle at 30% 25%, #ffd18e 0%, #f59c45 45%, #dd6f2f 100%)",
        border: "1.5px solid rgba(255,209,142,0.40)",
        boxShadow: "0 6px 22px rgba(221,111,47,0.50), 0 0 28px rgba(245,156,69,0.30)",
        color: "#20150e",
      }}
      aria-label="Criar post"
      title="Criar post"
    >
      <Plus className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
    </button>
  );
}
