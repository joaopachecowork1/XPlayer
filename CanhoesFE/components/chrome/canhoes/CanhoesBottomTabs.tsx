"use client";

import type { ReactNode } from "react";
import { Flame, Leaf, Plus, Shield, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

type TabConfig = {
  href: string;
  icon: ReactNode;
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
  {
    href: "/canhoes/categorias",
    icon: <Trophy className="h-5 w-5" />,
    label: "Ranking",
  },
  {
    href: "/canhoes/votacao",
    icon: <Flame className="h-5 w-5" />,
    label: "Votacao",
  },
  {
    href: "/canhoes/admin",
    icon: <Shield className="h-5 w-5" />,
    isAdmin: true,
    label: "Admin",
  },
] as const;

function isTabActive(pathname: string, href: string) {
  if (href === "/canhoes") {
    return (
      pathname === "/canhoes" ||
      pathname === "/canhoes/" ||
      pathname === "/canhoes/feed"
    );
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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-moss)]/18 bg-[rgba(36,25,20,0.92)] backdrop-blur-xl">
      <div className="mx-auto max-w-[calc(var(--page-max-width)+10rem)] px-2 pb-safe">
        <div className="grid min-h-[4.4rem] grid-cols-5 items-end gap-1 py-2">
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
  icon: ReactNode;
  isActive: boolean;
  isAdmin?: boolean;
  label: string;
  onClick: () => void;
}>) {
  const activeClasses = isAdmin
    ? "text-[var(--color-beige-light)]"
    : "text-[var(--color-bg-card)]";
  const indicatorClasses = isAdmin
    ? "bg-[var(--color-beige)]"
    : "bg-[var(--color-moss-light)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "canhoes-tap flex min-h-11 flex-col items-center justify-center gap-1 rounded-[1rem] px-2 pb-1 pt-2 text-[11px] font-semibold",
        isActive
          ? activeClasses
          : "text-[rgba(245,239,224,0.62)] hover:text-[var(--color-bg-card)]"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className={cn("flex items-center justify-center", !isActive && "opacity-80")}>
        {icon}
      </div>
      <span className={cn(isActive ? "font-bold" : "font-medium")}>{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          "h-0.5 w-6 rounded-full transition-opacity",
          isActive ? indicatorClasses : "opacity-0"
        )}
      />
    </button>
  );
}

function ComposeButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="canhoes-tap mx-auto -mt-5 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-beige)]/40 bg-[var(--color-moss)] text-[var(--color-bg-card)] shadow-[var(--shadow-layered)]"
      aria-label="Criar post"
      title="Criar post"
    >
      <Plus className="h-5 w-5" strokeWidth={2.2} />
    </button>
  );
}
