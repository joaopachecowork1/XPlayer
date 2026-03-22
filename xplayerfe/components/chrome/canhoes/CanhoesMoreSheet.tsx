"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Gift, ScrollText, Ruler, Sticker, Medal, Shield } from "lucide-react";

/**
 * CanhoesMoreSheet — slide-up sheet for secondary navigation.
 *
 * Access note: the Admin button is always shown here.
 * The destination page (/canhoes/admin) handles its own
 * access guard and shows "Acesso Negado" for non-admins.
 */
export function CanhoesMoreSheet({
  open,
  onOpenChange,
  onNavigate,
}: Readonly<{
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onNavigate: (href: string) => void;
}>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(9,22,15,0.98) 0%, rgba(5,10,7,0.99) 100%)",
          borderTop: "1px solid rgba(0,255,68,0.18)",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        <SheetHeader className="pb-2">
          <SheetTitle
            className="canhoes-title text-left"
            style={{ fontSize: "18px" }}
          >
            Mais 🌿
          </SheetTitle>
        </SheetHeader>

        {/* Secondary navigation grid */}
        <div className="grid grid-cols-2 gap-2 p-3 pt-0 sm:gap-2.5 sm:p-4 sm:pt-0">
          <Item label="Stickers"      icon={<Sticker   className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/stickers")}      />
          <Item label="Wishlist"      icon={<Gift      className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/wishlist")}       />
          <Item label="Amigo Secreto" icon={<Gift      className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/amigo-secreto")} />
          <Item label="Gala"          icon={<Medal     className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/gala")}          />
          <Item label="Medidas"       icon={<Ruler     className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/medidas")}       />
          <Item label="Nomeações"     icon={<ScrollText className="h-4 w-4" />} onClick={() => onNavigate("/canhoes/nomeacoes")}    />
        </div>

        {/* Admin — always present; page shows "Acesso Negado" for non-admins */}
        <Separator style={{ borderColor: "rgba(0,255,68,0.10)" }} />
        <div className="p-3 pb-0 sm:p-4 sm:pb-0">
          <button
            className="canhoes-tap w-full h-10 flex items-center justify-center gap-2 rounded-xl font-bold text-sm"
            style={{
              background: "linear-gradient(90deg, rgba(255,225,53,0.12), rgba(255,225,53,0.06))",
              border: "1px solid rgba(255,225,53,0.28)",
              color: "#ffe135",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
            }}
            onClick={() => onNavigate("/canhoes/admin")}
          >
            <Shield className="h-4 w-4" /> Admin
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Item({
  label,
  icon,
  onClick,
}: Readonly<{
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      className="canhoes-chip canhoes-tap flex items-center gap-2 rounded-xl px-3 py-3 text-[13px] sm:text-sm transition-all hover:brightness-110"
      style={{ color: "rgba(224,255,224,0.90)", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
    >
      {icon}
      <span className="font-semibold truncate">{label}</span>
    </button>
  );
}
