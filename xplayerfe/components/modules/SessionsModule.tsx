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

  const filterGameId = searchParams.get("gameId") ?? undefined;
  const filterGameName = searchParams.get("gameName") ?? undefined;

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
    <div className="space-y-4">
      {filterGameId && (
        <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 bg-background/60 backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Sessões filtradas</p>
            <p className="font-semibold truncate">{filterGameName ?? filterGameId}</p>
          </div>
          <div className="flex items-center gap-2">
            {activeSession && String(activeSession.gameId ?? "") === String(filterGameId) ? (
              <Button
                variant="destructive"
                className="h-9 gap-2"
                onClick={() => void stopSession()}
              >
                <Square className="h-4 w-4" />
                Parar ({formatHMS(elapsedSeconds)})
              </Button>
            ) : null}
            <Button variant="secondary" className="h-9" onClick={() => router.push("/sessions")}>Limpar</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SessionTimer presetGame={presetGame} />
        <ProfileCard profile={profile} />
      </div>

      {/* PS-style session history list */}
      <div className="rounded-xl border overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            {filterGameId ? "Nenhuma sessão para este jogo" : "Nenhuma sessão registada ainda"}
          </div>
        ) : (
          <ul className="divide-y">
            {filteredHistory.slice(0, 100).map((s) => (
              <li key={s.id} className="p-3 sm:p-4">
                <div className="flex gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
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
                        <p className="font-semibold truncate">{s.gameName ?? "Sessão"}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.platform ? `${s.platform} • ` : ""}
                          {new Date(s.startTime).toLocaleString("pt-PT", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-mono text-sm">{formatHMS(s.duration)}</p>
                        <p className="text-xs text-muted-foreground">+{s.xpEarned} XP</p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      {typeof s.score === "number" ? (
                        <Badge variant="secondary" className="font-mono">{s.score}</Badge>
                      ) : (
                        <Badge variant="outline" className="font-mono">—</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* TODO
        - Add per-session "edit" (notes/tags)
        - Add pagination / virtualization for large history
        - When backend exists: server-side filtering + canonical session IDs
      */}
    </div>
  );
}
