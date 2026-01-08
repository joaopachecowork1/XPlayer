"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap, Flame } from "lucide-react";
import { XPCalculator } from "@/lib/xp-calculator";
import { UserProfile } from "@/models/profile";

interface ProfileCardProps {
  profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const xpInCurrentLevel = profile.currentXP - XPCalculator.calculateXPForCurrentLevel(profile.level);
  const xpNeededForLevel = XPCalculator.calculateXPToNextLevel(profile.level) - XPCalculator.calculateXPForCurrentLevel(profile.level);
  const progressPercent = (xpInCurrentLevel / xpNeededForLevel) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-3xl font-bold">{profile.level}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">XP Total</p>
            <p className="text-2xl font-semibold">{profile.totalXP.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {xpInCurrentLevel} / {xpNeededForLevel} XP
            </span>
          </div>
          <Progress value={progressPercent} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Streak</p>
              <p className="text-xl font-bold">{profile.streak} dias</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Sessões</p>
              <p className="text-xl font-bold">{profile.totalSessions}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}