"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { NumberTicker } from "./NumberTicker";

interface PodiumItem {
  rank: 1 | 2 | 3;
  name: string;
  score: number;
  imageUrl?: string | null;
}

interface PodiumAnimatedProps {
  items: PodiumItem[];
  className?: string;
}

/**
 * Pódio Animado (Mockup Reference)
 *
 * Gradiente arco-íris pulsante para pódio/ranking:
 * - 3 lugares com alturas diferentes
 * - Gradiente psycho pulsante
 * - NumberTicker nos scores
 * - Imagens/nomes dos vencedores
 *
 * Uso:
 * ```tsx
 * <PodiumAnimated items={[
 *   { rank: 1, name: "Pedro Pescada", score: 4280, imageUrl: "/img.jpg" },
 *   { rank: 2, name: "Carol Chapada", score: 3200 },
 *   { rank: 3, name: "Léo do Fumaço", score: 2850 },
 * ]} />
 * ```
 */
export function PodiumAnimated({ items, className }: PodiumAnimatedProps) {
  // Ordena por rank
  const sorted = [...items].sort((a, b) => a.rank - b.rank);
  
  const first = sorted.find(i => i.rank === 1);
  const second = sorted.find(i => i.rank === 2);
  const third = sorted.find(i => i.rank === 3);

  return (
    <div className={cn("flex items-end justify-center gap-3 sm:gap-6 py-8", className)}>
      {/* 2º Lugar - Esquerda */}
      {second && (
        <PodiumColumn
          item={second}
          height="h-32 sm:h-40"
          gradientFrom="from-[var(--color-brown)]"
          gradientTo="to-[var(--color-brown-dark)]"
        />
      )}

      {/* 1º Lugar - Centro (mais alto) */}
      {first && (
        <PodiumColumn
          item={first}
          height="h-44 sm:h-56"
          gradientFrom="from-[var(--color-psycho-1)]"
          gradientTo="to-[var(--color-psycho-4)]"
          isWinner
        />
      )}

      {/* 3º Lugar - Direita */}
      {third && (
        <PodiumColumn
          item={third}
          height="h-24 sm:h-32"
          gradientFrom="from-[var(--color-brown)]"
          gradientTo="to-[var(--color-brown-dark)]"
        />
      )}
    </div>
  );
}

interface PodiumColumnProps {
  item: PodiumItem;
  height: string;
  gradientFrom: string;
  gradientTo: string;
  isWinner?: boolean;
}

function PodiumColumn({ item, height, gradientFrom, gradientTo, isWinner }: PodiumColumnProps) {
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      {/* Imagem/Nome */}
      <div className="flex flex-col items-center gap-1">
        {item.imageUrl ? (
          <div
            className={cn(
              "rounded-full border-2 overflow-hidden",
              isWinner ? "w-16 h-16 sm:w-20 sm:h-20 border-[var(--color-psycho-1)]" : "w-12 h-12 sm:w-14 sm:h-14 border-[var(--color-brown-light)]"
            )}
          >
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={cn(
              "rounded-full flex items-center justify-center font-bold text-base sm:text-lg",
              isWinner ? "w-16 h-16 sm:w-20 sm:h-20 bg-[var(--color-psycho-1)] text-white" : "w-12 h-12 sm:w-14 sm:h-14 bg-[var(--color-brown)] text-[var(--color-beige)]"
            )}
          >
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Nome */}
        <p className="text-[10px] sm:text-xs font-semibold text-[var(--color-text-primary)] text-center max-w-[80px] sm:max-w-[100px] truncate">
          {item.name}
        </p>
      </div>

      {/* Coluna do pódio */}
      <div
        className={cn(
          "relative w-20 sm:w-28 rounded-t-lg rounded-b-md overflow-hidden",
          height,
          "podium-pulse",
          gradientFrom,
          gradientTo
        )}
      >
        {/* Rank badge */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-black text-sm sm:text-base",
              isWinner ? "bg-white text-[var(--color-psycho-1)]" : "bg-[var(--color-beige-dark)] text-[var(--color-beige)]"
            )}
          >
            {item.rank}º
          </span>
        </div>

        {/* Score */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center">
          <div className="flex items-center gap-1 text-white font-bold">
            <span className="text-xs sm:text-sm">🔥</span>
            <NumberTicker value={item.score} className="text-sm sm:text-base" />
          </div>
        </div>
      </div>
    </div>
  );
}
