"use client";

import { cn } from "@/lib/utils";
import { Leaf, Trophy, PlusCircle, MessageCircle, ShieldCheck } from "lucide-react";

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
            icon={<Leaf size={22} color={active(pathname, "/canhoes") ? "#00ff44" : "#4a8a4a"} style={{ filter: active(pathname, "/canhoes") ? "drop-shadow(0 0 6px #00ff44)" : "none" }} />}
            active={active(pathname, "/canhoes")}
            onClick={() => onNavigate("/canhoes")}
          />

          {/* Ranking */}
          <Tab
            label="Ranking"
            icon={<Trophy size={22} color={active(pathname, "/canhoes/categorias") ? "#ffe135" : "#4a8a4a"} style={{ filter: active(pathname, "/canhoes/categorias") ? "drop-shadow(0 0 6px #ffe135)" : "none" }} />}
            active={active(pathname, "/canhoes/categorias")}
            onClick={() => onNavigate("/canhoes/categorias")}
          />

          {/* Compose (centre, elevated) */}
          <ComposeButton onClick={onCompose} />

          {/* Forum / Votação */}
          <Tab
            label="Forum"
            icon={<MessageCircle size={22} color={active(pathname, "/canhoes/votacao") ? "#c44dff" : "#4a8a4a"} style={{ filter: active(pathname, "/canhoes/votacao") ? "drop-shadow(0 0 6px #c44dff)" : "none" }} />}
            active={active(pathname, "/canhoes/votacao")}
            onClick={() => onNavigate("/canhoes/votacao")}
          />

          {/* Admin — always visible; page renders denial screen for non-admins */}
          <Tab
            label="Admin"
            icon={<ShieldCheck size={22} color={active(pathname, "/canhoes/admin") ? "#00ff44" : "#4a8a4a"} style={{ filter: active(pathname, "/canhoes/admin") ? "drop-shadow(0 0 6px #00ff44)" : "none" }} />}
            active={active(pathname, "/canhoes/admin")}
            onClick={() => onNavigate("/canhoes/admin")}
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
}: Readonly<{
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      style={{
        color: isActive ? "#00ff44" : "#4a8a4a",
        transition: "color 0.15s ease, filter 0.15s ease, transform 0.1s ease",
      }}
      className={cn(
        "canhoes-tap h-full flex flex-col items-center justify-center gap-0.5 rounded-xl",
        "text-[10px] sm:text-[11px] font-bold",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {icon}
      <span className="font-semibold tracking-wide" style={{ fontFamily: "'Nunito', sans-serif", color: isActive ? "inherit" : "#4a8a4a" }}>
        {label}
      </span>
      {isActive && (
        <span
          className="h-0.5 w-5 rounded-full"
          style={{
            background: "#00ff44",
            boxShadow: "0 0 6px #00ff4480",
            animation: "canhoes-ambient-float 2.5s ease-in-out infinite",
          }}
        />
      )}
    </button>
  );
}

/** Centre compose button — green neon pill */
function ComposeButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      onClick={onClick}
      className="canhoes-tap mx-auto -mt-5 sm:-mt-6 h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #00dd44 0%, #009933 100%)",
        border: "1.5px solid #00ff44",
        boxShadow: "0 0 20px #00ff4460, 0 4px 16px rgba(0,0,0,0.4)",
        color: "#ffffff",
      }}
      aria-label="Criar post"
      title="Criar post"
    >
      <PlusCircle size={24} strokeWidth={2} />
    </button>
  );
}
