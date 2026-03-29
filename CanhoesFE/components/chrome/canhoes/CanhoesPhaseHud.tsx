"use client";

import { Loader2, Sparkles } from "lucide-react";

import type { EventOverviewDto, EventSummaryDto } from "@/lib/api/types";
import { getPhaseLabel } from "@/lib/canhoesEvent";
import { cn } from "@/lib/utils";

export function CanhoesPhaseHud({
  event,
  isLoading = false,
  overview,
}: Readonly<{
  event?: EventSummaryDto | null;
  isLoading?: boolean;
  overview?: EventOverviewDto | null;
}>) {
  if (isLoading) {
    return (
      <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-[var(--beige)]/78">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--neon-green)]" />
        <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em]">
          A ler fase
        </span>
      </div>
    );
  }

  if (!event || !overview) return null;

  const phaseLabel = getPhaseLabel(overview.activePhase?.type);
  const subtitle = overview.nextPhase
    ? `Proxima: ${getPhaseLabel(overview.nextPhase.type)}`
    : overview.permissions.canVote
      ? "Votacao em curso"
      : overview.permissions.canSubmitProposal
        ? "Propostas abertas"
        : "Evento ativo";

  return (
    <div className="inline-flex min-h-11 items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-left shadow-[var(--shadow-panel)]">
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-neon)]/50 bg-[var(--accent)] text-[var(--neon-green)] [text-shadow:var(--glow-green-sm)]"
        )}
      >
        <Sparkles className="h-4 w-4" />
      </span>

      <span className="min-w-0">
        <span className="block font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--beige)]/64">
          {event.name}
        </span>
        <span className="block text-sm font-semibold text-[var(--text-primary)]">
          {phaseLabel}
        </span>
        <span className="block text-xs text-[var(--beige)]/72">{subtitle}</span>
      </span>
    </div>
  );
}
