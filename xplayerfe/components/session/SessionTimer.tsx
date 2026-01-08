"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Pause } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { XPCalculator } from "@/lib/xp-calculator";

export function SessionTimer() {
  const { 
    activeSession, 
    elapsedTime, 
    startSession, 
    stopSession, 
    pauseSession, 
    resumeSession,
    isActive 
  } = useSession();

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessão Atual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold font-mono">
            {formatTime(elapsedTime)}
          </div>
          {activeSession && (
            <p className="text-sm text-muted-foreground mt-2">
              XP estimado: {XPCalculator.calculateXP(elapsedTime, 0)}
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {!activeSession ? (
            <Button onClick={() => startSession()} size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Iniciar Sessão
            </Button>
          ) : (
            <>
              {isActive ? (
                <Button onClick={pauseSession} variant="outline" size="lg" className="gap-2">
                  <Pause className="h-5 w-5" />
                  Pausar
                </Button>
              ) : (
                <Button onClick={resumeSession} size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Retomar
                </Button>
              )}
              <Button onClick={stopSession} variant="destructive" size="lg" className="gap-2">
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