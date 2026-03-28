"use client";

import {
  Gift,
  Medal,
  Ruler,
  ScrollText,
  Shield,
  Sticker,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const MORE_LINKS = [
  { href: "/canhoes/stickers", icon: <Sticker className="h-4 w-4" />, label: "Stickers" },
  { href: "/canhoes/wishlist", icon: <Gift className="h-4 w-4" />, label: "Wishlist" },
  {
    href: "/canhoes/amigo-secreto",
    icon: <Gift className="h-4 w-4" />,
    label: "Amigo secreto",
  },
  { href: "/canhoes/gala", icon: <Medal className="h-4 w-4" />, label: "Gala" },
  { href: "/canhoes/medidas", icon: <Ruler className="h-4 w-4" />, label: "Medidas" },
  {
    href: "/canhoes/nomeacoes",
    icon: <ScrollText className="h-4 w-4" />,
    label: "Nomeacoes",
  },
] as const;

export function CanhoesMoreSheet({
  open,
  onOpenChange,
  onNavigate,
}: Readonly<{
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNavigate: (href: string) => void;
}>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="pb-safe">
        <SheetHeader className="pb-2">
          <p className="label text-[var(--color-text-muted)]">Explorar</p>
          <SheetTitle className="text-left">Mais areas do arquivo</SheetTitle>
        </SheetHeader>

        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
          {MORE_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => onNavigate(link.href)}
              className="canhoes-tap flex min-h-12 items-center gap-3 rounded-[var(--radius-md-token)] border border-[var(--color-beige-dark)]/25 bg-[var(--color-bg-surface-alt)]/75 px-4 py-3 text-left text-[var(--color-text-dark)] shadow-[var(--shadow-paper)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-moss)] text-[var(--color-bg-card)]">
                {link.icon}
              </span>
              <span className="font-semibold">{link.label}</span>
            </button>
          ))}
        </div>

        <Separator className="bg-[var(--color-beige-dark)]/25" />

        <div className="px-4 pb-4 pt-4">
          <Button
            variant="secondary"
            className="w-full justify-center"
            onClick={() => onNavigate("/canhoes/admin")}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
