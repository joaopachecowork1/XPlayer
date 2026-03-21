"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatHM, formatHMS, progressInLevel } from "@/lib/time";
import { Clock, Gamepad2, Square, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Backlog (PS-style list) — mobile-first redesign.
 * Clean game rows with cover art, compact stats, clear CTAs.
 */
export function BacklogModule() {
  const { backlog, history, totals, activeSession, elapsedSeconds, stopSession } = useSession();
  const router = useRouter();

  const sessionsByGame = useMemo(() => {
    const map = new Map<string, { count: number }>();
    for (const s of history) {
      if (!s.gameId) continue;
      const cur = map.get(s.gameId) ?? { count: 0 };
      cur.count += 1;
      map.set(s.gameId, cur);
    }
    return map;
  }, [history]);

  const rows = useMemo(() => {
    return [...backlog].sort((a, b) => (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0));
  }, [backlog]);

  const headerProgress = progressInLevel(totals.totalXP);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary strip */}
      <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-foreground">Biblioteca</p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Gamepad2 className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">{rows.length} jogos</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">{formatHM(totals.totalPlaySeconds)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="font-mono text-xs font-semibold">Lv {totals.level}</span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
            <span>{totals.totalXP} XP total</span>
            <span>{totals.xpToNext} XP p/ próximo</span>
          </div>
          <Progress value={headerProgress} className="h-1.5" />
        </div>
      </div>

      {/* Game list */}
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card/60">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Ainda não tens jogos no backlog.
            <br />
            Inicia uma sessão para adicionar automaticamente.
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {rows.map((g) => {
              const detailHref = `/backlog/${encodeURIComponent(g.gameId)}`;
              const href = `/sessions?gameId=${encodeURIComponent(g.gameId)}&gameName=${encodeURIComponent(g.gameName)}`;
              const sessionsCount = sessionsByGame.get(g.gameId)?.count ?? 0;
              const gameProgress = progressInLevel(g.totalXP ?? 0);
              const activeForThisGame = !!activeSession && String(activeSession?.gameId ?? "") === String(g.gameId);

              return (
                <li key={g.gameId}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(detailHref)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") router.push(detailHref);
                    }}
                    className={cn(
                      "w-full text-left block p-3.5",
                      "tap-scale hover:bg-accent/30 active:bg-accent/50",
                      "transition-colors duration-100 focus:outline-none focus:bg-accent/30",
                      activeForThisGame && "bg-primary/5",
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Cover image */}
                      <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm">
                        {g.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={g.coverUrl}
                            alt={g.gameName}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">—</div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate leading-tight">
                              {g.gameName}
                              {activeForThisGame && (
                                <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                  Ativa
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {g.lastPlayedAt
                                ? new Date(g.lastPlayedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "2-digit" })
                                : "Sem sessões"}
                              {g.released ? ` · ${g.released}` : ""}
                            </p>
                          </div>
                          {typeof g.score === "number" && (
                            <Badge
                              variant="secondary"
                              className="font-mono text-[10px] px-1.5 py-0.5 h-5 shrink-0"
                            >
                              {g.score}
                            </Badge>
                          )}
                        </div>

                        {/* Stats row */}
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="font-mono">{formatHMS(g.totalPlaySeconds ?? 0)}</span>
                          <span className="text-emerald-400 font-semibold">{g.totalXP ?? 0} XP</span>
                          <span>{sessionsCount}× sessões</span>
                          {activeForThisGame && (
                            <span className="font-mono text-primary ml-auto">{formatHMS(elapsedSeconds)}</span>
                          )}
                        </div>

                        {/* XP progress bar */}
                        <Progress value={gameProgress} className="mt-2 h-1" />

                        {/* Action buttons */}
                        <div className="mt-2.5 flex items-center gap-2">
                          {activeForThisGame && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 gap-1.5 text-xs tap-scale"
                              onClick={(e) => {
                                e.stopPropagation();
                                void stopSession();
                              }}
                            >
                              <Square className="h-3.5 w-3.5" />
                              Parar
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs tap-scale border-border/60"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(href);
                            }}
                          >
                            Sessões
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
