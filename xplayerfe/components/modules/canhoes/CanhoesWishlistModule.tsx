"use client";

import { useEffect, useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { useAuth } from "@/hooks/useAuth";
import type { PublicUserDto, WishlistItemDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Gift, ImageOff, Link as LinkIcon, Trash2, Upload } from "lucide-react";
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
  const { user } = useAuth();
  const [members, setMembers] = useState<PublicUserDto[]>([]);
  const [items, setItems] = useState<WishlistItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const onDelete = async (id: string) => {
    setDeleting(id);
    try {
      await canhoesRepo.deleteWishlistItem(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const grouped = useMemo(() => byUser(items), [items]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div
            className="canhoes-title inline-flex items-center gap-2"
            style={{ fontSize: "17px" }}
          >
            <Gift className="h-5 w-5" style={{ color: "#ffe135" }} />Wishlist
          </div>
          <div className="text-sm text-muted-foreground">
            Toda a gente vê a wishlist de toda a gente. Só tu vês o teu amigo secreto.
          </div>
        </div>
        <Badge variant="secondary">{items.length} itens</Badge>
      </div>

      <Card className="canhoes-glass rounded-2xl">
        <CardHeader className="pb-1.5">
          <CardTitle className="text-base">Adicionar item à tua wishlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Mouse sem fios" />
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (opcional)" />
          </div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <Upload className="h-4 w-4" />
              <input type="file" accept="image/png,image/jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <Button disabled={!canSubmit || saving} onClick={onCreate} className="canhoes-tap h-9 sm:w-auto w-full">
              {saving ? "A guardar..." : "Adicionar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          A carregar...
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m) => {
            const list = grouped.get(m.id) ?? [];
            const isMe = m.id === user?.id;
            return (
              <Card key={m.id} className="canhoes-glass rounded-2xl">
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="truncate">{m.displayName || m.email}</span>
                    {isMe && <Badge variant="outline" className="text-xs">tu</Badge>}
                    {m.isAdmin && !isMe ? <Badge variant="outline" className="text-xs">admin</Badge> : null}
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">{list.length} itens</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {list.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Ainda sem itens.</div>
                  ) : (
                    list.map((it) => (
                      <div key={it.id} className="canhoes-chip flex gap-3 rounded-xl p-2">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
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
                        <div className="flex flex-col items-end justify-between gap-1 shrink-0">
                          <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {new Date(it.updatedAtUtc).toLocaleDateString()}
                          </div>
                          {isMe && (
                            <button
                              onClick={() => void onDelete(it.id)}
                              disabled={deleting === it.id}
                              className="canhoes-tap text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                              aria-label="Apagar item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
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
