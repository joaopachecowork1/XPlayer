"use client";

import React from "react";

export default function CanhoesPublicLayout({ children }: { children: React.ReactNode }) {
  // Aqui não há validação de login nem CanhoesAppChrome (menu).
  // Apenas o fundo e o conteúdo (formulário de login).
  return (
    <div data-theme="canhoes" className="min-h-[100svh] bg-[linear-gradient(160deg,#1a3320_0%,#0d1f12_100%)] grid place-items-center p-4">
      {children}
    </div>
  );
}