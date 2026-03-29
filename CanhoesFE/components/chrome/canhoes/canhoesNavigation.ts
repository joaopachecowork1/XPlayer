"use client";

import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Gift,
  House,
  Medal,
  Ruler,
  ScrollText,
  Shield,
  Sticker,
  Trophy,
} from "lucide-react";

import type { EventModulesDto, EventOverviewDto } from "@/lib/api/types";
import { IS_LOCAL_MODE } from "@/lib/mock";

export type CanhoesNavItem = {
  description?: string;
  hideInLocalMode?: boolean;
  href: string;
  icon: LucideIcon;
  id: string;
  label: string;
  requiresAdmin?: boolean;
};

const SECRET_SANTA_NAV_ITEM: CanhoesNavItem = {
  description: "Sorteio, pessoa atribuida e wishlist ligada ao ritual.",
  href: "/canhoes/amigo-secreto",
  icon: Gift,
  id: "secret-santa",
  label: "Amigo",
};

const WISHLIST_NAV_ITEM: CanhoesNavItem = {
  description: "Consulta e gere a wishlist do grupo.",
  href: "/canhoes/wishlist",
  icon: Gift,
  id: "wishlist",
  label: "Wishlist",
};

const CATEGORIES_NAV_ITEM: CanhoesNavItem = {
  description: "Arquivo de categorias, nomeados e resultados do evento.",
  href: "/canhoes/categorias",
  icon: Trophy,
  id: "categories",
  label: "Categorias",
};

const VOTING_NAV_ITEM: CanhoesNavItem = {
  description: "Boletim da fase de votacao e progresso por categoria.",
  href: "/canhoes/votacao",
  icon: Flame,
  id: "voting",
  label: "Votos",
};

const GALA_NAV_ITEM: CanhoesNavItem = {
  description: "Area final do evento. Fica oculta em modo local.",
  hideInLocalMode: true,
  href: "/canhoes/gala",
  icon: Medal,
  id: "gala",
  label: "Gala",
};

const STICKERS_NAV_ITEM: CanhoesNavItem = {
  description: "Submete e revê stickers aprovados.",
  href: "/canhoes/stickers",
  icon: Sticker,
  id: "stickers",
  label: "Stickers",
};

const MEASURES_NAV_ITEM: CanhoesNavItem = {
  description: "Regras e medidas aprovadas para a reta final.",
  href: "/canhoes/medidas",
  icon: Ruler,
  id: "measures",
  label: "Medidas",
};

const NOMINEES_NAV_ITEM: CanhoesNavItem = {
  description: "Arquivo completo de nomeacoes aprovadas.",
  href: "/canhoes/nomeacoes",
  icon: ScrollText,
  id: "nominees",
  label: "Nomeacoes",
};

const ADMIN_NAV_ITEM: CanhoesNavItem = {
  description: "Moderacao, fases, pendentes e estado do evento.",
  href: "/canhoes/admin",
  icon: Shield,
  id: "admin",
  label: "Admin",
  requiresAdmin: true,
};

const ITEM_BY_ID: Record<string, CanhoesNavItem> = {
  [SECRET_SANTA_NAV_ITEM.id]: SECRET_SANTA_NAV_ITEM,
  [WISHLIST_NAV_ITEM.id]: WISHLIST_NAV_ITEM,
  [CATEGORIES_NAV_ITEM.id]: CATEGORIES_NAV_ITEM,
  [VOTING_NAV_ITEM.id]: VOTING_NAV_ITEM,
  [GALA_NAV_ITEM.id]: GALA_NAV_ITEM,
  [STICKERS_NAV_ITEM.id]: STICKERS_NAV_ITEM,
  [MEASURES_NAV_ITEM.id]: MEASURES_NAV_ITEM,
  [NOMINEES_NAV_ITEM.id]: NOMINEES_NAV_ITEM,
  [ADMIN_NAV_ITEM.id]: ADMIN_NAV_ITEM,
};

const MODULE_KEY_BY_ITEM_ID = {
  "secret-santa": "secretSanta",
  wishlist: "wishlist",
  categories: "categories",
  voting: "voting",
  gala: "gala",
  stickers: "stickers",
  measures: "measures",
  nominees: "nominees",
  admin: "admin",
} as const satisfies Partial<Record<string, keyof EventModulesDto>>;

export const BOTTOM_LEFT_NAV_ITEMS: readonly CanhoesNavItem[] = [
  {
    href: "/canhoes",
    icon: House,
    id: "home",
    label: "Evento",
  },
  {
    href: "/canhoes/feed",
    icon: ScrollText,
    id: "feed",
    label: "Feed",
  },
] as const;

export const MORE_NAV_ITEMS: readonly CanhoesNavItem[] = [
  CATEGORIES_NAV_ITEM,
  STICKERS_NAV_ITEM,
  WISHLIST_NAV_ITEM,
  GALA_NAV_ITEM,
  MEASURES_NAV_ITEM,
  NOMINEES_NAV_ITEM,
  ADMIN_NAV_ITEM,
] as const;

const STATIC_PAGE_TITLES: readonly Pick<CanhoesNavItem, "href" | "label">[] = [
  ...BOTTOM_LEFT_NAV_ITEMS,
  SECRET_SANTA_NAV_ITEM,
  WISHLIST_NAV_ITEM,
  CATEGORIES_NAV_ITEM,
  VOTING_NAV_ITEM,
  GALA_NAV_ITEM,
  ...MORE_NAV_ITEMS,
];

function isNavItemAvailable({
  itemId,
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  overview,
}: Readonly<{
  itemId: string;
  isAdmin: boolean;
  isLocalMode?: boolean;
  overview?: EventOverviewDto | null;
}>) {
  if (itemId === "admin") return isAdmin;
  if (itemId === "gala" && isLocalMode) return false;

  const modules = overview?.modules;
  if (!modules) return true;

  const moduleKey = MODULE_KEY_BY_ITEM_ID[itemId as keyof typeof MODULE_KEY_BY_ITEM_ID];
  return moduleKey ? modules[moduleKey] : true;
}

function pickFirstVisibleItem(
  itemIds: readonly string[],
  options: Readonly<{
    excludedIds?: string[];
    isAdmin: boolean;
    isLocalMode?: boolean;
    overview?: EventOverviewDto | null;
  }>
) {
  const excludedIds = new Set(options.excludedIds ?? []);

  for (const itemId of itemIds) {
    if (excludedIds.has(itemId)) continue;
    if (!isNavItemAvailable({ itemId, ...options })) continue;

    const item = ITEM_BY_ID[itemId];
    if (item) return item;
  }

  return null;
}

export function getPrimaryRightNavItem({
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  overview,
}: Readonly<{
  isAdmin: boolean;
  isLocalMode?: boolean;
  overview?: EventOverviewDto | null;
}>) {
  // The first right-hand slot stays stable and favors the phase-adjacent module
  // users are most likely to need throughout the event.
  return (
    pickFirstVisibleItem(["secret-santa", "wishlist", "categories"], {
      isAdmin,
      isLocalMode,
      overview,
    }) ?? SECRET_SANTA_NAV_ITEM
  );
}

export function getDynamicBottomNavItem({
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  overview,
  primaryItemId,
}: Readonly<{
  isAdmin: boolean;
  isLocalMode?: boolean;
  overview?: EventOverviewDto | null;
  primaryItemId?: string;
}>): CanhoesNavItem {
  if (isAdmin) {
    return ADMIN_NAV_ITEM;
  }

  // The outer-right slot is permanent but dynamic. Admins always get Admin
  // there; regular members get the best-fit module for the current phase.
  const phaseType = overview?.activePhase?.type ?? "DRAW";
  const phaseCandidates: Record<string, readonly string[]> = {
    DRAW: ["wishlist", "categories"],
    PROPOSALS: ["categories", "wishlist"],
    VOTING: ["voting", "categories", "wishlist"],
    RESULTS: ["gala", "categories", "wishlist"],
  };

  return (
    pickFirstVisibleItem(phaseCandidates[phaseType] ?? phaseCandidates.DRAW, {
      excludedIds: primaryItemId ? [primaryItemId] : [],
      isAdmin,
      isLocalMode,
      overview,
    }) ??
    pickFirstVisibleItem(["categories", "wishlist", "secret-santa"], {
      excludedIds: primaryItemId ? [primaryItemId] : [],
      isAdmin,
      isLocalMode,
      overview,
    }) ??
    CATEGORIES_NAV_ITEM
  );
}

export function getPageTitle(pathname: string | null) {
  if (!pathname) return "Evento";

  const matchedStaticPage = STATIC_PAGE_TITLES.find(({ href }) => pathname.startsWith(href));
  if (matchedStaticPage) return matchedStaticPage.label;
  if (pathname.startsWith("/canhoes/amigo-secreto")) return "Amigo";

  return "Evento";
}

export function getVisibleMoreNavItems({
  excludedIds = [],
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  overview,
}: Readonly<{
  excludedIds?: string[];
  isAdmin: boolean;
  isLocalMode?: boolean;
  overview?: EventOverviewDto | null;
}>) {
  // The More sheet only shows modules that are not already promoted to the
  // bottom navigation for the current user and phase.
  return MORE_NAV_ITEMS.filter((item) => {
    if (excludedIds.includes(item.id)) return false;

    return isNavItemAvailable({
      itemId: item.id,
      isAdmin,
      isLocalMode,
      overview,
    });
  });
}

export function isMoreSectionActive({
  dynamicItem,
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  overview,
  pathname,
  primaryRightItem,
}: Readonly<{
  dynamicItem?: CanhoesNavItem | null;
  isAdmin: boolean;
  isLocalMode?: boolean;
  overview?: EventOverviewDto | null;
  pathname: string;
  primaryRightItem?: CanhoesNavItem | null;
}>) {
  const primaryIds = [
    ...BOTTOM_LEFT_NAV_ITEMS.map((item) => item.id),
    primaryRightItem?.id,
    dynamicItem?.id,
  ].filter(Boolean) as string[];

  return getVisibleMoreNavItems({
    excludedIds: primaryIds,
    isAdmin,
    isLocalMode,
    overview,
  }).some(({ href }) => pathname.startsWith(href));
}
