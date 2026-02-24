"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Canhões do Ano shell
 * - Aplica um "accent" próprio (via CSS variables em globals.css)
 * - Fundo com "party vibe" muito leve (sem rebentar temas)
 */
export function CanhoesShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-theme="canhoes"
      className={cn(
        "relative -m-4 sm:-m-6 p-4 sm:p-6 rounded-2xl",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
      >
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}
