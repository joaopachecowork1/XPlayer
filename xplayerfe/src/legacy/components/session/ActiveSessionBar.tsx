"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { SessionStatus } from "@/models/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatHMS } from "@/lib/time";
import { Pause, Play, Square, Timer } from "lucide-react";

/**
 * Small, global indicator shown across pages when a session is active.
 * Goal: keep it compact and mobile-friendly.
 */
export function ActiveSessionBar() {
  const router = useRouter();
  const { activeSession, elapsedSeconds, pauseSession, resumeSession, stopSession } = useSession();
  const href = useMemo(() => {
    if (!activeSession?.gameId) return "/sessions";
    return `/backlog/${encodeURIComponent(String(activeSession.gameId))}`;
  }, [activeSession?.gameId]);

  if (!activeSession) return null;

  return (
    <div className="px-4 sm:px-6">
      <Card className="mb-4 p-3 sm:p-4 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
            {activeSession.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeSession.coverUrl}
                alt={activeSession.gameName ?? "Jogo"}
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">—</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => router.push(href)}
                className="min-w-0 text-left"
              >
                <p className="font-semibold truncate">{activeSession.gameName ?? "Sessão"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {activeSession.platform ? `${activeSession.platform} • ` : ""}
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Timer className="h-3.5 w-3.5" /> {formatHMS(elapsedSeconds)}
                  </span>
                </p>
              </button>
              <Badge variant="secondary" className="shrink-0">
                {activeSession.status === SessionStatus.PAUSED ? "Pausada" : "Ativa"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSession.status === SessionStatus.PAUSED ? (
              <Button variant="secondary" size="sm" className="gap-2" onClick={resumeSession}>
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Retomar</span>
              </Button>
            ) : (
              <Button variant="secondary" size="sm" className="gap-2" onClick={pauseSession}>
                <Pause className="h-4 w-4" />
                <span className="hidden sm:inline">Pausar</span>
              </Button>
            )}
            <Button size="sm" className="gap-2" onClick={() => void stopSession()}>
              <Square className="h-4 w-4" />
              <span className="hidden sm:inline">Terminar</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
