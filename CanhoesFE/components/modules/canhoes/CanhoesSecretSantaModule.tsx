"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Gift, ImageOff, Link as LinkIcon, Shuffle, User } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";
import { absMediaUrl } from "@/lib/media";
import type { SecretSantaMeDto, WishlistItemDto } from "@/lib/api/types";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CanhoesSecretSantaModule() {
  const isAdmin = useIsAdmin();
  const { user } = useAuth();

  const [secretSantaResult, setSecretSantaResult] = useState<SecretSantaMeDto | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [eventCode, setEventCode] = useState<string>(() => `canhoes${new Date().getFullYear()}`);

  const loadSecretSanta = useCallback(async () => {
    setIsLoading(true);

    try {
      const nextSecretSantaResult = await canhoesRepo.getSecretSantaMe(eventCode);
      const allWishlistItems = await canhoesRepo.getWishlist();

      setSecretSantaResult(nextSecretSantaResult);
      setWishlistItems(Array.isArray(allWishlistItems) ? allWishlistItems : []);
    } catch {
      setSecretSantaResult(null);
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [eventCode]);

  useEffect(() => {
    void loadSecretSanta();
  }, [loadSecretSanta]);

  const assignedWishlistItems = useMemo(() => {
    if (!secretSantaResult) return [];
    return wishlistItems.filter((wishlistItem) => wishlistItem.userId === secretSantaResult.receiver.id);
  }, [secretSantaResult, wishlistItems]);

  const myWishlistItems = useMemo(() => {
    if (!user?.id) return [];
    return wishlistItems.filter((wishlistItem) => wishlistItem.userId === user.id);
  }, [user?.id, wishlistItems]);

  const handleDraw = async () => {
    setIsDrawing(true);

    try {
      await canhoesRepo.adminDrawSecretSanta({ eventCode });
      await loadSecretSanta();
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="canhoes-section-title flex items-center gap-2">
            <Gift className="h-4 w-4 text-[var(--color-fire)]" />
            Amigo Secreto
          </h1>
          <p className="body-small text-[var(--color-text-muted)]">
            O sorteio, a pessoa que te calhou e a wishlist certa vivem no mesmo fluxo.
          </p>
        </div>

        <Badge variant="outline">{eventCode}</Badge>
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Estado do sorteio</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={eventCode}
              onChange={(event) => setEventCode(event.target.value)}
              placeholder="canhoes2026"
              className="sm:max-w-xs"
            />
            <Button variant="secondary" onClick={() => void handleDraw()} disabled={isDrawing}>
              <Shuffle className="h-4 w-4" />
              {isDrawing ? "A sortear..." : "Gerar sorteio"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--color-fire)]" />
              O teu amigo secreto
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="body-small text-[var(--color-text-muted)]">A carregar...</p>
            ) : null}

            {!isLoading && secretSantaResult ? (
              <div className="canhoes-list-item space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-moss)] text-[var(--color-text-primary)]">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--color-text-primary)]">
                      {secretSantaResult.receiver.displayName || secretSantaResult.receiver.email}
                    </p>
                    <p className="body-small text-[var(--color-text-muted)]">
                      {assignedWishlistItems.length} itens na wishlist atribuída
                    </p>
                  </div>

                  <Badge variant="secondary">shhh</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" asChild>
                    <Link href="/canhoes/wishlist">Abrir wishlist</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/canhoes/wishlist">Gerir a tua wishlist</Link>
                  </Button>
                </div>
              </div>
            ) : null}

            {!isLoading && !secretSantaResult ? (
              <div className="canhoes-list-item p-4">
                <p className="body-small text-[var(--color-text-muted)]">
                  Ainda não existe sorteio para este evento.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-[var(--color-fire)]" />
              A tua preparação
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="canhoes-list-item p-4">
              <p className="canhoes-field-label">A tua wishlist</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                {myWishlistItems.length}
              </p>
              <p className="body-small mt-1 text-[var(--color-text-muted)]">
                Quanto mais clara estiver, mais fácil é manter o ritual equilibrado.
              </p>
            </div>

            <Button className="w-full" asChild>
              <Link href="/canhoes/wishlist">Atualizar wishlist</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {secretSantaResult && !isLoading ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-[var(--color-fire)]" />
              Wishlist de {secretSantaResult.receiver.displayName || secretSantaResult.receiver.email}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {assignedWishlistItems.length === 0 ? (
              <p className="body-small text-[var(--color-text-muted)]">
                Ainda não há itens na wishlist. Diz ao teu amigo secreto para adicionar.
              </p>
            ) : null}

            {assignedWishlistItems.map((wishlistItem) => (
              <div key={wishlistItem.id} className="canhoes-list-item flex gap-3 p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                  {wishlistItem.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={absMediaUrl(wishlistItem.imageUrl)}
                      alt={wishlistItem.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <ImageOff className="h-4 w-4 text-[var(--color-text-muted)]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-semibold text-[var(--color-text-primary)]">
                    {wishlistItem.title}
                  </p>
                  {wishlistItem.notes ? (
                    <p className="body-small line-clamp-2 text-[var(--color-text-muted)]">
                      {wishlistItem.notes}
                    </p>
                  ) : null}
                  {wishlistItem.url ? (
                    <a
                      href={wishlistItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="canhoes-link inline-flex items-center gap-1 text-sm"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      Ver produto
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
