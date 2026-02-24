"use client";

import { useEffect, useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { PublicUserDto, WishlistItemDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageOff, Link as LinkIcon, Upload } from "lucide-react";
import { XPLAYER_API_URL } from "@/lib/api/xplayerClient";

function byUser(items: WishlistItemDto[]) {
  const map = new Map<string, WishlistItemDto[]>();
  for (const it of items) {
    const arr = map.get(it.userId) ?? [];
    arr.push(it);
    map.set(it.userId, arr);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => (b.updatedAtUtc || "").localeCompare(a.updatedAtUtc || ""));
  }
  return map;
}

export function CanhoesWishlistModule() {
  const [members, setMembers] = useState<PublicUserDto[]>([]);
  const [items, setItems] = useState<WishlistItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Create form (for current user)
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const canSubmit = useMemo(() => title.trim().length >= 2, [title]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [m, w] = await Promise.all([canhoesRepo.getMembers(), canhoesRepo.getWishlist()]);
      setMembers(Array.isArray(m) ? m : []);
      setItems(Array.isArray(w) ? w : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const onCreate = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const created = await canhoesRepo.createWishlistItem({
        title: title.trim(),
        url: url.trim() || null,
        notes: notes.trim() || null,
      });

      if (file) await canhoesRepo.uploadWishlistImage(created.id, file);

      setTitle(""); setUrl(""); setNotes(""); setFile(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const usersById = useMemo(() => new Map(members.map(m => [m.id, m])), [members]);
  const grouped = useMemo(() => byUser(items), [items]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xl font-semibold">Wishlist 🎁</div>
          <div className="text-sm text-muted-foreground">
            Toda a gente vê a wishlist de toda a gente. Só tu vês o teu amigo secreto.
          </div>
        </div>
        <Badge variant="secondary">{items.length} itens</Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Adicionar item à tua wishlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Mouse sem fios" />
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (opcional)" />
          </div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4" />
              <input type="file" accept="image/png,image/jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <Button disabled={!canSubmit || saving} onClick={onCreate}>
              {saving ? "A guardar..." : "Adicionar"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            TODO: editar/remover itens (quando quiseres).
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-sm text-muted-foreground">A carregar...</div>
      ) : (
        <div className="space-y-4">
          {members.map((m) => {
            const list = grouped.get(m.id) ?? [];
            return (
              <Card key={m.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="truncate">{m.displayName || m.email}</span>
                    {m.isAdmin ? <Badge variant="outline">admin</Badge> : null}
                    <span className="text-xs text-muted-foreground ml-auto">{list.length} itens</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {list.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Ainda sem itens.</div>
                  ) : (
                    list.map((it) => (
                      <div key={it.id} className="flex gap-3 rounded-xl border p-2">
                        <div className="h-12 w-12 overflow-hidden rounded-md bg-muted flex items-center justify-center">
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
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{it.title}</div>
                          {it.notes ? <div className="text-xs text-muted-foreground line-clamp-2">{it.notes}</div> : null}
                          {it.url ? (
                            <a
                              href={it.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <LinkIcon className="h-3 w-3" />
                              abrir link
                            </a>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(it.updatedAtUtc).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
