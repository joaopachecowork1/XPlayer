"use client";

import { CanhoesCategoriesModule } from "@/components/modules/canhoes/CanhoesCategoriesModule";
import { CanhoesShell } from "@/components/canhoes/CanhoesShell";

export default function CategoriasPage() {
  return (
    <CanhoesShell>
        <CanhoesCategoriesModule />
      </CanhoesShell>
  );
}
