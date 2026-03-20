"use client";

import { useEffect, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { useAuth } from "@/hooks/useAuth";
import type { SecretSantaMeDto, WishlistItemDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Gift, ImageOff, Link as LinkIcon, Shuffle, User } from "lucide-react";
import { XPLAYER_API_URL } from "@/lib/api/xplayerClient";

export function CanhoesSecretSantaModule() {
  const { user } = useAuth();
  const [me, setMe] = useState<SecretSantaMeDto | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [eventCode, setEventCode] = useState<string>(() => `canhoes${new Date().getFullYear()}`);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await canhoesRepo.getSecretSantaMe(eventCode);
      setMe(data);
      // Load the wishlist and filter for the assigned receiver
      const allItems = await canhoesRepo.getWishlist();
      setWishlist(allItems.filter((it) => it.userId === data.receiver.id));
    } catch {
      setMe(null);
      setWishlist([]);
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

      {user?.isAdmin && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Evento</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              placeholder="canhoes2026"
              className="sm:max-w-xs"
            />
            <Button variant="secondary" onClick={onDraw} disabled={drawing}>
              <Shuffle className="h-4 w-4 mr-2" />
              {drawing ? "A sortear..." : "Gerar sorteio"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> O teu amigo secreto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              A carregar...
            </div>
          ) : me ? (
            <div className="flex items-center gap-3 rounded-xl border p-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{me.receiver.displayName || me.receiver.email}</div>
                <div className="text-xs text-muted-foreground">Vai à wishlist abaixo 🎁</div>
              </div>
              <Badge variant="secondary">shhh</Badge>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Ainda não existe sorteio para este evento.
            </div>
          )}
        </CardContent>
      </Card>

      {me && !loading && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Wishlist de {me.receiver.displayName || me.receiver.email}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {wishlist.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Ainda não há itens na wishlist. Diz ao teu amigo secreto para adicionar! 😅
              </div>
            ) : (
              wishlist.map((it) => (
                <div key={it.id} className="flex gap-3 rounded-xl border p-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                    {it.imageUrl ? (
                      <img
                        src={`${XPLAYER_API_URL}${it.imageUrl}`}
                        alt={it.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ImageOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="font-medium truncate">{it.title}</div>
                    {it.notes && (
                      <div className="text-xs text-muted-foreground line-clamp-2">{it.notes}</div>
                    )}
                    {it.url && (
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <LinkIcon className="h-3 w-3" /> ver produto
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
