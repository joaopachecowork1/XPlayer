"use client";

import { useEffect, useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { AwardCategoryDto, CanhoesStateDto, NomineeDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageOff, Upload } from "lucide-react";
import { XPLAYER_API_URL } from "@/lib/api/xplayerClient";

/**
 * Sticker do Ano — submit form + gallery of submitted stickers.
 */
export function CanhoesStickerSubmitModule() {
  const [state, setState] = useState<CanhoesStateDto | null>(null);
  const [categories, setCategories] = useState<AwardCategoryDto[]>([]);
  const [nominees, setNominees] = useState<NomineeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const canSubmit = useMemo(() => title.trim().length >= 2, [title]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [st, cats, noms] = await Promise.all([
        canhoesRepo.getState(),
        canhoesRepo.getCategories(),
        canhoesRepo.getNominees(),
      ]);

      setState(st);
      setCategories(Array.isArray(cats) ? cats : []);
      setNominees(Array.isArray(noms) ? noms : []);

      // Default: try to pick a "Sticker" category
      const sticker = (Array.isArray(cats) ? cats : []).find((c) =>
        c.name.toLowerCase().includes("sticker")
      );
      if (sticker && !categoryId) setCategoryId(sticker.id);
    } catch (e) {
      console.error(e);
      setState(null);
      setCategories([]);
      setNominees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    if (!state || state.phase !== "nominations") return;
    if (!canSubmit) return;

    setSaving(true);
    try {
      const created = await canhoesRepo.createNominee({
        categoryId: categoryId || null,
        title: title.trim(),
      });

      if (file) {
        await canhoesRepo.uploadNomineeImage(created.id, file);
      }

      setTitle("");
      setFile(null);
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const withImage = nominees.filter((n) => n.imageUrl);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sticker do Ano</h1>
        {state && (
          <Badge variant="outline">
            Fase: {state.phase === "nominations" ? "Nomeações" : state.phase}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Submeter sticker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              A carregar...
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Categoria</div>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolhe a categoria" />
                </SelectTrigger>
                <SelectContent>
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
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: O sticker mais lendário"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <Button
              disabled={!state || state.phase !== "nominations" || !canSubmit || saving}
              onClick={onSubmit}
              className="sm:w-auto w-full"
            >
              {state?.phase !== "nominations"
                ? "Nomeações fechadas"
                : saving
                ? "A submeter..."
                : "Submeter"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Começa como <b>pendente</b> até um admin aprovar.
          </div>
        </CardContent>
      </Card>

      {!loading && withImage.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Stickers submetidos</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {withImage.map((n) => (
              <Card key={n.id} className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <img
                    src={`${XPLAYER_API_URL}${n.imageUrl}`}
                    alt={n.title}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <CardContent className="p-2">
                  <div className="text-xs font-medium truncate">{n.title}</div>
                  <Badge variant={n.status === "approved" ? "secondary" : "outline"} className="text-[10px] mt-1">
                    {n.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
