"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SessionTimer } from "@/components/session/SessionTimer";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { formatHMS } from "@/lib/time";
import { Square } from "lucide-react";
import { UserProfile } from "@/models/profile";

// (format helpers moved to lib/time.ts)

export function SessionsModule() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { history, totals, backlog, activeSession, elapsedSeconds, stopSession } = useSession();

  const filterGameId = searchParams?.get("gameId") ?? undefined;
  const filterGameName = searchParams?.get("gameName") ?? undefined;

  const presetGame = useMemo(() => {
    if (!filterGameId) return null;
    const g = backlog.find((b) => String(b.gameId) === String(filterGameId));
    return {
      gameId: filterGameId,
      gameName: g?.gameName ?? filterGameName ?? filterGameId,
      coverUrl: g?.coverUrl ?? null,
      released: g?.released ?? null,
      score: g?.score ?? null,
    };
  }, [backlog, filterGameId, filterGameName]);

  const filteredHistory = useMemo(() => {
    return filterGameId ? history.filter((s) => s.gameId === filterGameId) : history;
  }, [history, filterGameId]);

  const profile: UserProfile = {
    id: "local",
    username: "Player",
    level: totals.level,
    currentXP: totals.totalXP,
    xpToNextLevel: totals.totalXP + totals.xpToNext,
    totalXP: totals.totalXP,
    streak: 0,
    totalSessions: history.length,
    totalTimeTracked: totals.totalPlaySeconds,
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {filterGameId && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3 bg-card/60">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Sessões filtradas</p>
            <p className="text-sm font-semibold truncate">{filterGameName ?? filterGameId}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeSession && String(activeSession.gameId ?? "") === String(filterGameId) ? (
              <Button
                variant="destructive"
                className="h-9 gap-2 text-xs tap-scale"
                onClick={() => void stopSession()}
              >
                <Square className="h-3.5 w-3.5" />
                Parar ({formatHMS(elapsedSeconds)})
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="h-9 text-xs tap-scale border-border/60"
              onClick={() => router.push("/sessions")}
            >
              Limpar
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SessionTimer presetGame={presetGame} />
        <ProfileCard profile={profile} />
      </div>

      {/* Session history list */}
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card/60">
        {filteredHistory.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {filterGameId ? "Nenhuma sessão para este jogo" : "Nenhuma sessão registada ainda"}
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {filteredHistory.slice(0, 100).map((s) => (
              <li key={s.id} className="p-3.5">
                <div className="flex gap-3">
                  <div className="h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {s.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.coverUrl}
                        alt={s.gameName ?? "Sessão"}
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
                        <p className="text-sm font-semibold truncate leading-tight">{s.gameName ?? "Sessão"}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.platform ? `${s.platform} · ` : ""}
                          {new Date(s.startTime).toLocaleString("pt-PT", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-mono text-xs font-semibold">{formatHMS(s.duration)}</p>
                        <p className="text-[11px] text-emerald-400 font-medium">+{s.xpEarned} XP</p>
                      </div>
                    </div>

                    {typeof s.score === "number" && (
                      <div className="mt-1.5">
                        <Badge variant="secondary" className="font-mono text-[10px] h-4 px-1.5">{s.score}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
