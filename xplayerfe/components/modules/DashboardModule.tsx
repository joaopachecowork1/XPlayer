"use client"

import Link from "next/link"
import { Activity, Calendar, Flame, TrendingUp, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Dashboard mock (até existir backend + autenticação real).
 * Este módulo intencionalmente usa dados estáticos para desbloquear a navegação e UX.
 */
export function DashboardModule() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total de Sessões"
          value="12"
          icon={<Activity className="h-5 w-5 text-muted-foreground" />}
          trend="+2 esta semana"
        />
        <StatCard
          title="XP Total"
          value="1,250"
          icon={<Trophy className="h-5 w-5 text-muted-foreground" />}
          trend="+150 este mês"
        />
        <StatCard
          title="Streak"
          value="4 dias"
          icon={<Flame className="h-5 w-5 text-muted-foreground" />}
          trend="Record: 7 dias"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo de volta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Acompanha as tuas sessões, ganha XP e mantém o teu streak ativo.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/sessions">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Sessões
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/friends">Amigos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ActivityItem task="Implementar API" time="2h 30m" xp="+150 XP" date="Hoje" />
            <ActivityItem task="Code Review" time="1h 45m" xp="+105 XP" date="Ontem" />
            <ActivityItem task="Sessão Livre" time="3h 15m" xp="+195 XP" date="Há 2 dias" />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
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
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <p className="font-medium">{task}</p>
        <p className="text-sm text-muted-foreground">{time}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-green-600">{xp}</p>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
    </div>
  )
}
