"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Pause, Gamepad2 } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { XPCalculator } from "@/lib/xp-calculator";
import { CreateSessionSheet } from "@/components/session/CreateSessionSheet";
import { useState } from "react";
import { formatHMS } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { PresetGame } from "@/components/session/CreateSessionSheet";

export function SessionTimer({ presetGame }: { presetGame?: PresetGame | null }) {
  const [open, setOpen] = useState(false);
  const {
    activeSession,
    elapsedSeconds,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    isActive
  } = useSession();

  const estimatedXP = XPCalculator.calculateXP(elapsedSeconds, 0);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gamepad2 className="h-4 w-4 text-primary" />
          Sessão Atual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <CreateSessionSheet
          open={open}
          onOpenChange={setOpen}
          disabled={!!activeSession}
          presetGame={presetGame ?? null}
          onStart={async (payload) => {
            startSession(payload);
          }}
        />

        {/* Timer display */}
        <div className="text-center py-2">
          <div
            className={cn(
              "text-5xl font-bold font-mono tabular-nums tracking-tighter transition-all duration-300",
              activeSession && isActive ? "text-primary animate-glow-pulse" : "",
              activeSession && !isActive ? "text-muted-foreground" : "",
            )}
          >
            {formatHMS(elapsedSeconds)}
          </div>

          {activeSession ? (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-semibold">
                {activeSession.gameName || "Sessão"}
                {activeSession.platform ? (
                  <span className="text-muted-foreground font-normal"> · {activeSession.platform}</span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="text-emerald-400 font-semibold">+{estimatedXP} XP</span>
                {" "}estimado
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Nenhuma sessão ativa.
            </p>
          )}
        </div>

        {/* Action buttons — large, thumb-friendly */}
        <div className="flex gap-2">
          {!activeSession ? (
            <Button
              onClick={() => setOpen(true)}
              className="h-12 gap-2 w-full tap-scale text-sm font-semibold glow-primary-sm"
            >
              <Play className="h-5 w-5" />
              Iniciar Sessão
            </Button>
          ) : (
            <>
              {isActive ? (
                <Button
                  onClick={pauseSession}
                  variant="outline"
                  className="h-12 gap-2 flex-1 tap-scale border-border/60"
                >
                  <Pause className="h-4 w-4" />
                  Pausar
                </Button>
              ) : (
                <Button
                  onClick={resumeSession}
                  className="h-12 gap-2 flex-1 tap-scale glow-primary-sm"
                >
                  <Play className="h-4 w-4" />
                  Retomar
                </Button>
              )}
              <Button
                onClick={() => void stopSession()}
                variant="destructive"
                className="h-12 gap-2 flex-1 tap-scale"
              >
                <Square className="h-4 w-4" />
                Parar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}