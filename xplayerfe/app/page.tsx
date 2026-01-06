import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      
      {/* Profile */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="text-xl font-bold">5</p>
            </div>
            <Badge variant="secondary">🔥 3 dias</Badge>
          </div>

          <Progress value={65} />
          <p className="text-xs text-muted-foreground">
            650 / 1000 XP
          </p>
        </CardContent>
      </Card>

      {/* Timer */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <p className="font-medium">Sessão atual</p>
          <p className="text-3xl font-mono text-center">00:25:12</p>

          <Button className="w-full">
            Iniciar Sessão
          </Button>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="font-medium">Tasks de hoje</p>

          <div className="flex justify-between items-center">
            <span>Estudar EF Core</span>
            <Badge>ACTIVE</Badge>
          </div>

          <div className="flex justify-between items-center">
            <span>Setup PWA</span>
            <Badge variant="outline">STALE</Badge>
          </div>

          <Button variant="outline" className="w-full">
            + Nova Task
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
