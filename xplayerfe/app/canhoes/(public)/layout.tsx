"use client";

import React from "react";

export default function CanhoesPublicLayout({ children }: { children: React.ReactNode }) {
  // Aqui não há validação de login nem CanhoesAppChrome (menu).
  // Apenas o fundo e o conteúdo (formulário de login).
  return (
    <div data-theme="canhoes" className="min-h-[100svh] bg-gradient-to-b from-emerald-950/35 via-background to-background grid place-items-center p-4">
      {children}
    </div>
  );
}