"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Gift, List, Sparkles, Ruler, Users, Image as ImageIcon } from "lucide-react";

export function CanhoesMoreSheet({
  open,
  onOpenChange,
  isAdmin,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  isAdmin: boolean;
  onNavigate: (href: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="pb-2">
          <SheetTitle>Mais</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-2 p-4 pt-0">
          <Item label="Stickers" icon={<ImageIcon className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/stickers")} />
          <Item label="Wishlist" icon={<List className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/wishlist")} />
          <Item label="Amigo Secreto" icon={<Gift className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/amigo-secreto")} />
          <Item label="Gala" icon={<Sparkles className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/gala")} />
          <Item label="Medidas" icon={<Ruler className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/medidas")} />
          <Item label="Nomeações" icon={<Users className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/nomeacoes")} />
        </div>

        {isAdmin && (
          <>
            <Separator />
            <div className="p-4">
              <Button className="w-full" onClick={() => onNavigate("/canhoes/admin")}>
                <Shield className="h-4 w-4 mr-2" /> Admin
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Item({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border bg-background/50 p-3 text-sm hover:bg-muted"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
