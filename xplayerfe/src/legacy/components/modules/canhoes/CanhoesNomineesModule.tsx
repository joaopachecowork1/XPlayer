"use client";

import { useEffect, useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { XPLAYER_API_URL } from "@/lib/api/xplayerClient";
import type { AwardCategoryDto, NomineeDto, CanhoesStateDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageOff, Upload } from "lucide-react";

function statusVariant(status: NomineeDto["status"]) {
  if (status === "approved") return "secondary";
  if (status === "rejected") return "destructive";
  return "outline";
}

export function CanhoesNomineesModule() {
  const [state, setState] = useState<CanhoesStateDto | null>(null);
  const [categories, setCategories] = useState<AwardCategoryDto[]>([]);
  const [nominees, setNominees] = useState<NomineeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const canSubmit = useMemo(() => Boolean(title.trim().length >= 2), [title]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [st, cats, noms] = await Promise.all([
        canhoesRepo.getState(),
        canhoesRepo.getCategories(),
        canhoesRepo.getNominees(),
      ]);
      setState(st);
      setCategories(cats);
      setNominees(noms);
      // Default: no category selected (admin can assign later).
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    if (!canSubmit || !state) return;
    if (state.phase !== "nominations") return;

    setSaving(true);
    try {
      const created = await canhoesRepo.createNominee({ categoryId: categoryId || null, title: title.trim() });
      if (file) {
        await canhoesRepo.uploadNomineeImage(created.id, file);
      }
      setTitle("");
      setFile(null);
      await refresh();
    } catch (e) {
      // Keep it simple: console only for now.
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const byCategory = useMemo(() => {
    const map = new Map<string, NomineeDto[]>();
    for (const n of nominees) {
      const key = n.categoryId ?? "__uncategorized";
      const arr = map.get(key) ?? [];
      arr.push(n);
      map.set(key, arr);
    }
    return map;
  }, [nominees]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Canhões do Ano</h1>
        {state && (
          <Badge variant="outline">
            Fase: {state.phase === "nominations" ? "Nomeações" : state.phase === "voting" ? "Votação" : state.phase}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Submeter nomeação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Categoria</div>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolhe a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">(Admin decide depois)</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Título</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: O sticker mais lendário" />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <Button disabled={!state || state.phase !== "nominations" || !canSubmit || saving} onClick={onSubmit}>
              {state?.phase !== "nominations" ? "Nomeações fechadas" : saving ? "A submeter..." : "Submeter"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Nota: começa como <b>pendente</b> até um admin aprovar.
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-sm text-muted-foreground">A carregar...</div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const list = (byCategory.get(cat.id) ?? []).slice();
            if (list.length === 0) return null;
            return (
              <Card key={cat.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{cat.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {list.map((n) => (
                    <div key={n.id} className="flex items-center gap-3 rounded-lg border p-2">
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                        {n.imageUrl ? (
                          <img
                            src={`${XPLAYER_API_URL}${n.imageUrl}`}
                            alt={n.title}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{n.title}</div>
                        <div className="text-xs text-muted-foreground">{new Date(n.createdAtUtc).toLocaleString()}</div>
                      </div>
                      <Badge variant={statusVariant(n.status)}>{n.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
