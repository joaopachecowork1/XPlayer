"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatHM, formatHMS, progressInLevel } from "@/lib/time";
import { Clock, Gamepad2, Square, TrendingUp } from "lucide-react";

/**
 * Backlog (PS-style list)
 * - Mobile-first: single-column list
 * - Desktop: slightly wider but same structure
 * - Keeps CSS minimal; avoids heavy theming.
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
    <div className="space-y-4">
      {/* PS-like summary strip */}
      <div className="rounded-xl border bg-background/60 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Perfil</p>
            <p className="font-semibold truncate">Jogos e sessões</p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span className="font-mono">{rows.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatHM(totals.totalPlaySeconds)}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="font-mono">Lvl {totals.level}</span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{totals.totalXP} XP total</span>
            <span>{totals.xpToNext} XP p/ próximo</span>
          </div>
          <Progress value={headerProgress} className="mt-2" />
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            Ainda não tens jogos no backlog. Inicia uma sessão para adicionar automaticamente.
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((g) => {
              const detailHref = `/backlog/${encodeURIComponent(g.gameId)}`;
              const href = `/sessions?gameId=${encodeURIComponent(g.gameId)}&gameName=${encodeURIComponent(g.gameName)}`;
              const sessionsCount = sessionsByGame.get(g.gameId)?.count ?? 0;

              // Small "trophy-like" progress using XP towards next level (per game)
              const gameProgress = progressInLevel(g.totalXP ?? 0);

              const activeForThisGame = !!activeSession && String(activeSession?.gameId ?? "") === String(g.gameId);

              return (
                <li key={g.gameId} className="p-0">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(detailHref)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") router.push(detailHref);
                    }}
                    className="w-full text-left block p-3 sm:p-4 hover:bg-muted/30 active:bg-muted/40 transition-colors focus:outline-none"
                  >
                    <div className="flex gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
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
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{g.gameName}</p>
                            <p className="text-xs text-muted-foreground">
                              {g.lastPlayedAt
                                ? `Última sessão: ${new Date(g.lastPlayedAt).toLocaleDateString("pt-PT")}`
                                : "Sem sessões"}
                              {g.released ? ` • ${g.released}` : ""}
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {typeof g.score === "number" ? (
                              <Badge variant="secondary" className="font-mono">{g.score}</Badge>
                            ) : (
                              <Badge variant="outline" className="font-mono">—</Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Tempo</p>
                            <p className="font-mono">{formatHMS(g.totalPlaySeconds ?? 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">XP</p>
                            <p className="font-mono">{g.totalXP ?? 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Sessões</p>
                            <p className="font-mono">{sessionsCount}</p>
                          </div>
                          <div className="flex items-end justify-end gap-2">
                            {activeForThisGame ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-9 gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void stopSession();
                                }}
                              >
                                <Square className="h-4 w-4" />
                                Parar
                              </Button>
                            ) : null}
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(href);
                              }}
                            >
                              Sessões
                            </Button>
                          </div>
                        </div>

                        <div className="mt-2">
                          <Progress value={gameProgress} />
                        </div>

                        {activeForThisGame ? (
                          <div className="mt-2 text-xs text-muted-foreground font-mono">
                            Sessão ativa • {formatHMS(elapsedSeconds)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* TODO (feature roadmap)
         - Add game detail view (click row) with per-session timeline
         - Replace score badge with platform badges + icons
         - When backend exists: sync backlog + sessions and resolve conflicts
      */}
    </div>
  );
}
