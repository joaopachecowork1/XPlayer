"use client";

import { Flame, Leaf, Plus, Shield, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

type TabConfig = {
  href: string;
  icon: React.ReactNode;
  isAdmin?: boolean;
  label: string;
};

type CanhoesBottomTabsProps = {
  pathname: string;
  onNavigate: (href: string) => void;
  onCompose: () => void;
};

const TABS: TabConfig[] = [
  { href: "/canhoes", icon: <Leaf className="h-5 w-5" />, label: "Feed" },
  { href: "/canhoes/categorias", icon: <Trophy className="h-5 w-5" />, label: "Ranking" },
  { href: "/canhoes/votacao", icon: <Flame className="h-5 w-5" />, label: "Votação" },
  { href: "/canhoes/admin", icon: <Shield className="h-5 w-5" />, isAdmin: true, label: "Admin" },
] as const;

function isTabActive(pathname: string, href: string) {
  if (href === "/canhoes") {
    return pathname === "/canhoes" || pathname === "/canhoes/" || pathname === "/canhoes/feed";
  }

  return pathname.startsWith(href);
}

export function CanhoesBottomTabs({
  pathname,
  onNavigate,
  onCompose,
}: Readonly<CanhoesBottomTabsProps>) {
  const [feedTab, rankingTab, votingTab, adminTab] = TABS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-moss)]/20 bg-[rgba(26,31,20,0.94)] backdrop-blur">
      <div className="mx-auto max-w-2xl px-2 pb-safe">
        <div className="grid min-h-16 grid-cols-5 items-end gap-1 py-2">
          <BottomTab
            icon={feedTab.icon}
            isActive={isTabActive(pathname, feedTab.href)}
            label={feedTab.label}
            onClick={() => onNavigate(feedTab.href)}
          />
          <BottomTab
            icon={rankingTab.icon}
            isActive={isTabActive(pathname, rankingTab.href)}
            label={rankingTab.label}
            onClick={() => onNavigate(rankingTab.href)}
          />
          <ComposeButton onClick={onCompose} />
          <BottomTab
            icon={votingTab.icon}
            isActive={isTabActive(pathname, votingTab.href)}
            label={votingTab.label}
            onClick={() => onNavigate(votingTab.href)}
          />
          <BottomTab
            icon={adminTab.icon}
            isActive={isTabActive(pathname, adminTab.href)}
            isAdmin={adminTab.isAdmin}
            label={adminTab.label}
            onClick={() => onNavigate(adminTab.href)}
          />
        </div>
      </div>
    </nav>
  );
}

function BottomTab({
  icon,
  isActive,
  isAdmin = false,
  label,
  onClick,
}: Readonly<{
  icon: React.ReactNode;
  isActive: boolean;
  isAdmin?: boolean;
  label: string;
  onClick: () => void;
}>) {
  const activeClasses = isAdmin ? "text-[var(--color-beige)]" : "text-[var(--color-text-primary)]";
  const indicatorClasses = isAdmin ? "bg-[var(--color-beige)]" : "bg-[var(--color-moss)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "canhoes-tap flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-2 pb-1 pt-2 text-[11px] font-bold",
        isActive ? activeClasses : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className={cn("flex items-center justify-center", isActive ? "" : "opacity-80")}>
        {icon}
      </div>
      <span className={cn(isActive ? "font-extrabold" : "font-semibold")}>{label}</span>
      <span
        aria-hidden="true"
        className={cn("h-0.5 w-6 rounded-full transition-opacity", isActive ? indicatorClasses : "opacity-0")}
      />
    </button>
  );
}

function ComposeButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="canhoes-tap mx-auto -mt-5 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-beige)]/35 bg-[var(--color-moss)] text-[var(--color-text-primary)] shadow-[var(--shadow-card)]"
      aria-label="Criar post"
      title="Criar post"
    >
      <Plus className="h-5 w-5" strokeWidth={2.2} />
    </button>
  );
}
