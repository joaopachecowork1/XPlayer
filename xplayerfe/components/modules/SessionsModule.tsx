"use client";

import { SessionTimer } from "@/components/session/SessionTimer";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GameSearchDropdown from "../game/GameSearchDropdown";
import { UserProfile } from "@/models/profile";

export function SessionsModule() {
  // TODO: Fetch real profile data from API
  const mockProfile: UserProfile = {
    id: "1",
    username: "Player1",
    level: 5,
    currentXP: 2650,
    xpToNextLevel: 3600,
    totalXP: 2650,
    streak: 4,
    totalSessions: 12,
    totalTimeTracked: 86400 // 24h
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Sessões</h2>
        <p className="text-muted-foreground">
          Trabalha como um dev. Progride como num jogo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionTimer />
        <ProfileCard profile={mockProfile} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sessões</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhuma sessão registada ainda
          </p>
        </CardContent>
      </Card>
    </div>

  );
}
