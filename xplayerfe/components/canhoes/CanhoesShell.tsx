"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function CanhoesShell({ children, className }: { children: React.ReactNode; className?: string; }) {
  return (
    <div
      data-theme="canhoes"
      className={cn(
        "relative rounded-2xl overflow-hidden", // overflow-hidden impede que os blurs alarguem o ecrã
        className
      )}
    >
      {/* Background Party Vibe Seguro */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-[80px] opacity-70" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-[80px] opacity-70" />
      </div>

      {/* z-10 garante que o teu conteúdo fica por cima da decoração e funciona bem */}
      <div className="relative z-10 p-1 sm:p-2">
        {children}
      </div>
    </div>
  );
}