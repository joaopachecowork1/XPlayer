"use client"

import Link from "next/link"
import { Activity, Calendar, Flame, TrendingUp, Trophy, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Dashboard mock (até existir backend + autenticação real).
 * Este módulo intencionalmente usa dados estáticos para desbloquear a navegação e UX.
 */
export function DashboardModule() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stat cards grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          title="Sessões"
          value="12"
          icon={<Activity className="h-4 w-4" />}
          trend="+2 semana"
          color="emerald"
        />
        <StatCard
          title="XP Total"
          value="1.250"
          icon={<Trophy className="h-4 w-4" />}
          trend="+150 mês"
          color="amber"
        />
        <StatCard
          title="Streak"
          value="4d"
          icon={<Flame className="h-4 w-4" />}
          trend="Rec: 7d"
          color="orange"
        />
      </div>

      {/* Welcome card + CTA */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bem-vindo de volta 👾</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Acompanha as tuas sessões, ganha XP e mantém o teu streak ativo.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="h-11 gap-2 flex-1 sm:flex-none tap-scale glow-primary-sm">
              <Link href="/sessions">
                <Plus className="h-4 w-4" />
                Nova Sessão
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-11 flex-1 sm:flex-none tap-scale border-border/60">
              <Link href="/backlog">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Backlog
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border/40">
            <ActivityItem task="Implementar API" time="2h 30m" xp="+150 XP" date="Hoje" />
            <ActivityItem task="Code Review" time="1h 45m" xp="+105 XP" date="Ontem" />
            <ActivityItem task="Sessão Livre" time="3h 15m" xp="+195 XP" date="Há 2 dias" />
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: string
  color?: "emerald" | "amber" | "orange"
}) {
  const colorMap = {
    emerald: "text-emerald-400",
    amber:   "text-amber-400",
    orange:  "text-orange-400",
  };
  const iconColor = color ? colorMap[color] : "text-muted-foreground";

  return (
    <Card className="border-border/60 bg-card/80 tap-scale">
      <CardContent className="p-3 sm:p-4">
        <div className={cn("mb-1.5", iconColor)}>{icon}</div>
        <div className="text-xl sm:text-2xl font-bold tabular-nums leading-none animate-xp-count">{value}</div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">{title}</p>
        {trend && <p className="text-[10px] text-muted-foreground/70 mt-0.5 leading-tight">{trend}</p>}
      </CardContent>
    </Card>
  )
}

function ActivityItem({
  task,
  time,
  xp,
  date,
}: {
  task: string
  time: string
  xp: string
  date: string
}) {
  return (
    <li className="flex items-center justify-between px-4 py-3 tap-scale hover:bg-accent/30 transition-colors duration-100">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{task}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <div className="text-right shrink-0 ml-3">
        <p className="text-xs font-semibold text-emerald-400">{xp}</p>
        <span className="text-[10px] text-muted-foreground">{date}</span>
      </div>
    </li>
  )
}
