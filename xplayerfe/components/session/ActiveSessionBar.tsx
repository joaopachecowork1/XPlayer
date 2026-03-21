"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { SessionStatus } from "@/models/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatHMS } from "@/lib/time";
import { Pause, Play, Square, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small, global indicator shown across pages when a session is active.
 * Mobile-first: compact, thumb-reachable controls, clear active state.
 */
export function ActiveSessionBar() {
  const router = useRouter();
  const { activeSession, elapsedSeconds, pauseSession, resumeSession, stopSession } = useSession();
  const href = useMemo(() => {
    if (!activeSession?.gameId) return "/sessions";
    return `/backlog/${encodeURIComponent(String(activeSession.gameId))}`;
  }, [activeSession?.gameId]);

  if (!activeSession) return null;

  const isPaused = activeSession.status === SessionStatus.PAUSED;

  return (
    <div className="px-3 sm:px-4 pt-3">
      <div
        className={cn(
          "rounded-xl border border-border/60 p-3",
          "bg-card/80 backdrop-blur-sm",
          "flex items-center gap-3",
          "animate-slide-up",
        )}
      >
        {/* Cover thumbnail */}
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
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

        {/* Game info — clickable to go to detail */}
        <button
          type="button"
          onClick={() => router.push(href)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-sm font-semibold truncate leading-tight">{activeSession.gameName ?? "Sessão"}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Timer className="h-3 w-3 text-primary" />
            <span className="font-mono text-primary">{formatHMS(elapsedSeconds)}</span>
            {activeSession.platform && (
              <span className="text-muted-foreground/60">· {activeSession.platform}</span>
            )}
          </p>
        </button>

        {/* Status badge */}
        <Badge
          variant="secondary"
          className={cn(
            "shrink-0 text-[10px] px-1.5 py-0.5 h-5",
            isPaused ? "text-amber-400 bg-amber-400/10" : "text-emerald-400 bg-emerald-400/10",
          )}
        >
          {isPaused ? "Pausada" : "Ativa"}
        </Badge>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isPaused ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 tap-scale text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
              onClick={resumeSession}
              aria-label="Retomar sessão"
            >
              <Play className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 tap-scale text-muted-foreground hover:text-foreground hover:bg-accent/60"
              onClick={pauseSession}
              aria-label="Pausar sessão"
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 tap-scale text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => void stopSession()}
            aria-label="Terminar sessão"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
