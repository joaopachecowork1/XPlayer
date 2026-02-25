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

// (helpers moved to lib/time.ts)

type Props = { gameId: string };

/**
 * Backlog Game Detail
 * - PS-inspired: cover + stats + action button.
 * - If a session is started from here, the active session is shown here.
 * - When stopped, session appears immediately in the list below.
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
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/backlog")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Backlog
        </Button>
      </div>

      {/* Header (PS-like) */}
      <Card className="overflow-hidden">
        <div className="flex gap-4 p-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
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
                <p className="text-lg font-semibold truncate">{game?.gameName ?? activeSession?.gameName ?? "Jogo"}</p>
                <p className="text-xs text-muted-foreground">
                  {game?.released ? `Lançamento: ${game.released}` : ""}
                  {game?.lastPlayedAt ? ` • Última sessão: ${new Date(game.lastPlayedAt).toLocaleDateString("pt-PT")}` : ""}
                </p>
              </div>
              <Badge variant={typeof score === "number" ? "secondary" : "outline"} className="font-mono">
                {typeof score === "number" ? score : "—"}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Tempo</p>
                <p className="font-mono">{formatHMS(totals.totalPlaySeconds)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">XP</p>
                <p className="font-mono">{totals.totalXP}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sessões</p>
                <p className="font-mono">{totals.sessionsCount}</p>
              </div>
            </div>

            <div className="mt-3">
              <Progress value={progressInLevel(totals.totalXP)} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t p-4">
          {activeForOtherGame ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Existe uma sessão ativa noutro jogo: <span className="font-medium">{activeSession?.gameName}</span>
              </p>
              <Button variant="secondary" onClick={() => router.push("/sessions")}>Ver sessão ativa</Button>
            </div>
          ) : activeForThisGame ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span className="font-mono text-base">{formatHMS(elapsedSeconds)}</span>
                <Badge variant="secondary" className="ml-2">Ativa</Badge>
              </div>
              <div className="flex gap-2">
                {activeSession?.status === SessionStatus.PAUSED ? (
                  <Button variant="secondary" className="gap-2" onClick={resumeSession}>
                    <Play className="h-4 w-4" />
                    Retomar
                  </Button>
                ) : (
                  <Button variant="secondary" className="gap-2" onClick={pauseSession}>
                    <Pause className="h-4 w-4" />
                    Pausar
                  </Button>
                )}
                <Button className="gap-2" onClick={() => void stopSession()}>
                  <Square className="h-4 w-4" />
                  Terminar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Inicia uma sessão deste jogo diretamente a partir daqui.</p>
              <Button className="gap-2" onClick={() => setCreateOpen(true)} disabled={!game}>
                Nova sessão
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Create Session (preselected game) */}
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

      {/* Sessions list */}
      <div className="rounded-xl border overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            Ainda não há sessões para este jogo.
          </div>
        ) : (
          <ul className="divide-y">
            {sessions.map((s) => (
              <li key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.gameName}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.platform ? `${s.platform} • ` : ""}
                      {new Date(s.startTime).toLocaleString("pt-PT")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono">{formatHMS(s.duration ?? 0)}</p>
                    <p className="text-xs text-muted-foreground">+{s.xpEarned ?? 0} XP</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* TODO
        - Add "platform select" when starting session from detail
        - Add per-session notes/tags
        - When backend exists: fetch sessions/backlog per user and sync
      */}
    </div>
  );
}
