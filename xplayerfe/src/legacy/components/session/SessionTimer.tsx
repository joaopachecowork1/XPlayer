"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Pause } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { XPCalculator } from "@/lib/xp-calculator";
import { CreateSessionSheet } from "@/components/session/CreateSessionSheet";
import { useState } from "react";
import { formatHMS } from "@/lib/time";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessão Atual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CreateSessionSheet
          open={open}
          onOpenChange={setOpen}
          disabled={!!activeSession}
          presetGame={presetGame ?? null}
          onStart={async (payload) => {
            startSession(payload);
          }}
        />

        <div className="text-center">
          <div className="text-5xl font-bold font-mono">
            {formatHMS(elapsedSeconds)}
          </div>
          {activeSession ? (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-medium">
                {activeSession.gameName || "Sessão"}
                {activeSession.platform ? (
                  <span className="text-muted-foreground"> • {activeSession.platform}</span>
                ) : null}
              </p>
              <p className="text-sm text-muted-foreground">
                XP estimado: {XPCalculator.calculateXP(elapsedSeconds, 0)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Nenhuma sessão ativa.
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {!activeSession ? (
            <Button onClick={() => setOpen(true)} size="lg" className="gap-2 w-full sm:w-auto">
              <Play className="h-5 w-5" />
              Iniciar Sessão
            </Button>
          ) : (
            <>
              {isActive ? (
                <Button onClick={pauseSession} variant="outline" size="lg" className="gap-2 flex-1">
                  <Pause className="h-5 w-5" />
                  Pausar
                </Button>
              ) : (
                <Button onClick={resumeSession} size="lg" className="gap-2 flex-1">
                  <Play className="h-5 w-5" />
                  Retomar
                </Button>
              )}
              <Button onClick={() => void stopSession()} variant="destructive" size="lg" className="gap-2 flex-1">
                <Square className="h-5 w-5" />
                Parar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}