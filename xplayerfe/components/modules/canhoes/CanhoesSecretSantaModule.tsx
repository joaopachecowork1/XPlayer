"use client";

import { useEffect, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { useAuth } from "@/hooks/useAuth";
import type { SecretSantaMeDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Gift, Shuffle, User } from "lucide-react";

export function CanhoesSecretSantaModule() {
  const { user } = useAuth();
  const [me, setMe] = useState<SecretSantaMeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [eventCode, setEventCode] = useState<string>(() => `canhoes${new Date().getFullYear()}`);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await canhoesRepo.getSecretSantaMe(eventCode);
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, [eventCode]);

  const onDraw = async () => {
    setDrawing(true);
    try {
      await canhoesRepo.adminDrawSecretSanta({ eventCode });
      await refresh();
    } finally {
      setDrawing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xl font-semibold flex items-center gap-2">
            <Gift className="h-5 w-5" /> Amigo Secreto
          </div>
          <div className="text-sm text-muted-foreground">
            Só tu vês quem é o teu amigo secreto. As wishlists são públicas.
          </div>
        </div>
        <Badge variant="outline">{eventCode}</Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Evento</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Input value={eventCode} onChange={(e) => setEventCode(e.target.value)} placeholder="canhoes2026" className="sm:max-w-xs" />
          {user?.isAdmin ? (
            <Button variant="secondary" onClick={onDraw} disabled={drawing}>
              <Shuffle className="h-4 w-4 mr-2" />
              {drawing ? "A sortear..." : "Gerar sorteio (admin)"}
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground">Apenas admins podem gerar o sorteio.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">O teu amigo secreto</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">A carregar...</div>
          ) : me ? (
            <div className="flex items-center gap-3 rounded-xl border p-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{me.receiver.displayName || me.receiver.email}</div>
                <div className="text-xs text-muted-foreground">Agora vai ver a wishlist dele(a) 😄</div>
              </div>
              <Badge variant="secondary">shhh</Badge>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Ainda não existe sorteio para este evento.
            </div>
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            TODO: Bloquear alterações após lock + mostrar histórico de draws.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
