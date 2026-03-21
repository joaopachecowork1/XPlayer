"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { SessionStatus } from "@/models/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { CreateSessionSheet } from "@/components/session/CreateSessionSheet";
import { formatHMS, progressInLevel } from "@/lib/time";
import { ArrowLeft, Pause, Play, Square, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

// (helpers moved to lib/time.ts)

type Props = { gameId: string };

/**
 * Backlog Game Detail — mobile-first redesign.
 * PS-inspired: cover + stats + action button.
 */
export function BacklogGameDetailModule({ gameId }: Props) {
  const router = useRouter();
  const { backlog, history, activeSession, elapsedSeconds, startSession, pauseSession, resumeSession, stopSession } = useSession();
  const [createOpen, setCreateOpen] = useState(false);

  const game = backlog.find((g) => g.gameId === gameId);

  const sessions = useMemo(
    () => history.filter((s) => String(s.gameId ?? "") === String(gameId)),
    [history, gameId]
  );

  const totals = useMemo(() => {
    const totalPlaySeconds = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
    const totalXP = sessions.reduce((sum, s) => sum + (s.xpEarned ?? 0), 0);
    return { totalPlaySeconds, totalXP, sessionsCount: sessions.length };
  }, [sessions]);

  const activeForThisGame = !!activeSession && String(activeSession?.gameId ?? "") === String(gameId);
  const activeForOtherGame = !!activeSession && !activeForThisGame;

  const coverUrl = game?.coverUrl ?? activeSession?.coverUrl;
  const score = game?.score ?? null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/backlog")}
        className="gap-2 tap-scale -ml-1 h-9 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Backlog
      </Button>

      {/* Header card */}
      <Card className="overflow-hidden border-border/60 bg-card/80">
        <div className="flex gap-4 p-4">
          {/* Cover */}
          <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt={game?.gameName ?? "Jogo"}
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">—</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold truncate leading-tight">
                  {game?.gameName ?? activeSession?.gameName ?? "Jogo"}
                  {activeForThisGame && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      Ativa
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {game?.released ? `${game.released}` : ""}
                  {game?.lastPlayedAt
                    ? ` · Última: ${new Date(game.lastPlayedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "2-digit" })}`
                    : ""}
                </p>
              </div>
              {typeof score === "number" && (
                <Badge variant="secondary" className="font-mono text-[11px] shrink-0">
                  {score}
                </Badge>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground">Tempo</p>
                <p className="font-mono text-xs">{formatHMS(totals.totalPlaySeconds)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">XP</p>
                <p className="font-mono text-xs text-emerald-400">{totals.totalXP}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Sessões</p>
                <p className="font-mono text-xs">{totals.sessionsCount}</p>
              </div>
            </div>

            <div className="mt-2.5">
              <Progress value={progressInLevel(totals.totalXP)} className="h-1" />
            </div>
          </div>
        </div>

        {/* Session controls */}
        <div className="border-t border-border/50 p-4">
          {activeForOtherGame ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Sessão ativa: <span className="font-medium text-foreground">{activeSession?.gameName}</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-9 tap-scale border-border/60"
                onClick={() => router.push("/sessions")}
              >
                Ver sessão
              </Button>
            </div>
          ) : activeForThisGame ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm text-primary">{formatHMS(elapsedSeconds)}</span>
              </div>
              <div className="flex gap-2">
                {activeSession?.status === SessionStatus.PAUSED ? (
                  <Button
                    variant="outline"
                    className="h-10 gap-2 flex-1 sm:flex-none tap-scale border-border/60"
                    onClick={resumeSession}
                  >
                    <Play className="h-4 w-4" />
                    Retomar
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-10 gap-2 flex-1 sm:flex-none tap-scale border-border/60"
                    onClick={pauseSession}
                  >
                    <Pause className="h-4 w-4" />
                    Pausar
                  </Button>
                )}
                <Button
                  variant="destructive"
                  className="h-10 gap-2 flex-1 sm:flex-none tap-scale"
                  onClick={() => void stopSession()}
                >
                  <Square className="h-4 w-4" />
                  Terminar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Inicia uma sessão deste jogo.</p>
              <Button
                className="h-10 gap-2 tap-scale glow-primary-sm"
                onClick={() => setCreateOpen(true)}
                disabled={!game}
              >
                <Play className="h-4 w-4" />
                Nova sessão
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Create Session sheet */}
      <CreateSessionSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        disabled={!!activeSession}
        presetGame={
          game
            ? {
                gameId: game.gameId,
                gameName: game.gameName,
                coverUrl: game.coverUrl ?? null,
                released: game.released ?? null,
                score: game.score ?? null,
              }
            : null
        }
        onStart={async (result) => {
          await startSession(result);
        }}
      />

      {/* Session history for this game */}
      <div className={cn("rounded-xl border border-border/60 overflow-hidden bg-card/60")}>
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Ainda não há sessões para este jogo.
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {sessions.map((s) => (
              <li key={s.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
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
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-semibold">{formatHMS(s.duration ?? 0)}</p>
                    <p className="text-[11px] text-emerald-400">+{s.xpEarned ?? 0} XP</p>
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
