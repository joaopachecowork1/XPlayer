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
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="text-3xl font-bold tabular-nums text-foreground">{profile.level}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">XP Total</p>
            <p className="text-2xl font-semibold tabular-nums text-emerald-400">
              {profile.totalXP.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progresso nível</span>
            <span className="font-medium tabular-nums">
              {xpInCurrentLevel} / {xpNeededForLevel} XP
            </span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <Flame className="h-4 w-4 text-orange-400 shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground leading-tight">Streak</p>
              <p className="text-lg font-bold tabular-nums leading-tight">{profile.streak} dias</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground leading-tight">Sessões</p>
              <p className="text-lg font-bold tabular-nums leading-tight">{profile.totalSessions}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}