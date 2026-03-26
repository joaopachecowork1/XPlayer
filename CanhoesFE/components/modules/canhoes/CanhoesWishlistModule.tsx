"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, ImageOff, Link as LinkIcon, Trash2, Upload } from "lucide-react";

import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { CANHOES_API_URL } from "@/lib/api/canhoesClient";
import type { PublicUserDto, WishlistItemDto } from "@/lib/api/types";
import { useAuth } from "@/hooks/useAuth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function groupWishlistItemsByUser(items: WishlistItemDto[]) {
  const wishlistByUser = new Map<string, WishlistItemDto[]>();

  for (const wishlistItem of items) {
    const itemsForUser = wishlistByUser.get(wishlistItem.userId) ?? [];
    itemsForUser.push(wishlistItem);
    wishlistByUser.set(wishlistItem.userId, itemsForUser);
  }

  for (const itemsForUser of wishlistByUser.values()) {
    itemsForUser.sort((leftItem, rightItem) => (rightItem.updatedAtUtc || "").localeCompare(leftItem.updatedAtUtc || ""));
  }

  return wishlistByUser;
}

export function CanhoesWishlistModule() {
  const { user } = useAuth();

  const [memberList, setMemberList] = useState<PublicUserDto[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [wishlistTitle, setWishlistTitle] = useState("");
  const [wishlistUrl, setWishlistUrl] = useState("");
  const [wishlistNotes, setWishlistNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const canSubmit = wishlistTitle.trim().length >= 2;
  const wishlistByUser = useMemo(() => groupWishlistItemsByUser(wishlistItems), [wishlistItems]);

  const loadWishlist = async () => {
    setIsLoading(true);

    try {
      const [nextMembers, nextWishlistItems] = await Promise.all([
        canhoesRepo.getMembers(),
        canhoesRepo.getWishlist(),
      ]);

      setMemberList(Array.isArray(nextMembers) ? nextMembers : []);
      setWishlistItems(Array.isArray(nextWishlistItems) ? nextWishlistItems : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadWishlist();
  }, []);

  const handleCreate = async () => {
    if (!canSubmit) return;

    setIsSaving(true);
    try {
      const createdItem = await canhoesRepo.createWishlistItem({
        notes: wishlistNotes.trim() || null,
        title: wishlistTitle.trim(),
        url: wishlistUrl.trim() || null,
      });

      if (selectedFile) {
        await canhoesRepo.uploadWishlistImage(createdItem.id, selectedFile);
      }

      setWishlistTitle("");
      setWishlistUrl("");
      setWishlistNotes("");
      setSelectedFile(null);
      await loadWishlist();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (wishlistItemId: string) => {
    setDeletingItemId(wishlistItemId);

    try {
      await canhoesRepo.deleteWishlistItem(wishlistItemId);
      setWishlistItems((currentItems) => currentItems.filter((wishlistItem) => wishlistItem.id !== wishlistItemId));
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="canhoes-section-title flex items-center gap-2">
            <Gift className="h-4 w-4 text-[var(--color-fire)]" />
            Wishlist
          </h1>
          <p className="body-small text-[var(--color-text-muted)]">
            Toda a gente vê a wishlist de toda a gente. Só tu vês o teu amigo secreto.
          </p>
        </div>

        <Badge variant="secondary">{wishlistItems.length} itens</Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Adicionar item à tua wishlist</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="canhoes-field-label">Título</span>
              <Input
                value={wishlistTitle}
                onChange={(event) => setWishlistTitle(event.target.value)}
                placeholder="Ex.: Mouse sem fios"
              />
            </label>

            <label className="space-y-2">
              <span className="canhoes-field-label">URL</span>
              <Input
                value={wishlistUrl}
                onChange={(event) => setWishlistUrl(event.target.value)}
                placeholder="URL opcional"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="canhoes-field-label">Notas</span>
            <Textarea
              value={wishlistNotes}
              onChange={(event) => setWishlistNotes(event.target.value)}
              placeholder="Notas opcionais"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-moss)]/20 px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]">
              <Upload className="h-4 w-4 text-[var(--color-beige)]" />
              <span className="truncate">{selectedFile?.name ?? "Adicionar imagem (opcional)"}</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <Button disabled={!canSubmit || isSaving} onClick={() => void handleCreate()}>
              {isSaving ? "A guardar..." : "Adicionar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? <p className="body-small text-[var(--color-text-muted)]">A carregar...</p> : null}

      {!isLoading ? (
        <div className="space-y-4">
          {memberList.map((member) => {
            const itemsForMember = wishlistByUser.get(member.id) ?? [];
            const isCurrentUser = member.id === user?.id;

            return (
              <Card key={member.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    <span className="truncate">{member.displayName || member.email}</span>
                    {isCurrentUser ? <Badge variant="outline">tu</Badge> : null}
                    {member.isAdmin && !isCurrentUser ? <Badge variant="outline">admin</Badge> : null}
                    <span className="body-small ml-auto text-[var(--color-text-muted)]">{itemsForMember.length} itens</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {itemsForMember.length === 0 ? (
                    <p className="body-small text-[var(--color-text-muted)]">Ainda sem itens.</p>
                  ) : null}

                  {itemsForMember.map((wishlistItem) => (
                    <div key={wishlistItem.id} className="canhoes-list-item flex gap-3 p-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                        {wishlistItem.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${CANHOES_API_URL}${wishlistItem.imageUrl}`}
                            alt={wishlistItem.title}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <ImageOff className="h-4 w-4 text-[var(--color-text-muted)]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[var(--color-text-primary)]">{wishlistItem.title}</p>
                        {wishlistItem.notes ? (
                          <p className="body-small line-clamp-2 text-[var(--color-text-muted)]">{wishlistItem.notes}</p>
                        ) : null}
                        {wishlistItem.url ? (
                          <a href={wishlistItem.url} target="_blank" rel="noreferrer" className="canhoes-link mt-2 inline-flex items-center gap-1 text-sm">
                            <LinkIcon className="h-3.5 w-3.5" />
                            Abrir link
                          </a>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          {new Date(wishlistItem.updatedAtUtc).toLocaleDateString()}
                        </p>

                        {isCurrentUser ? (
                          <button
                            type="button"
                            onClick={() => void handleDelete(wishlistItem.id)}
                            disabled={deletingItemId === wishlistItem.id}
                            className="canhoes-tap rounded-full border border-transparent p-2 text-[var(--color-text-muted)] hover:border-[var(--color-danger)]/30 hover:text-[var(--color-danger)] disabled:opacity-50"
                            aria-label="Apagar item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}


