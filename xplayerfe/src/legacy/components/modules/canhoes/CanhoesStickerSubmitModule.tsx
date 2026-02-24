"use client";

import { useEffect, useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { AwardCategoryDto, CanhoesStateDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";

/**
 * Sticker do Ano — página simples:
 * - escolhe categoria (default tenta encontrar "Sticker" automaticamente)
 * - titulo + upload
 */
export function CanhoesStickerSubmitModule() {
  const [state, setState] = useState<CanhoesStateDto | null>(null);
  const [categories, setCategories] = useState<AwardCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const canSubmit = useMemo(() => title.trim().length >= 2, [title]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [st, cats] = await Promise.all([
          canhoesRepo.getState(),
          canhoesRepo.getCategories(),
        ]);

        if (cancelled) return;

        setState(st);
        setCategories(Array.isArray(cats) ? cats : []);

        // default: try to pick a "Sticker" category
        const sticker = (Array.isArray(cats) ? cats : []).find((c) =>
          c.name.toLowerCase().includes("sticker")
        );
        if (sticker) setCategoryId(sticker.id);
      } catch (e) {
        // Keep UI resilient: never crash the page because of a fetch.
        // eslint-disable-next-line no-console
        console.error(e);
        if (!cancelled) {
          setState(null);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

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
            <div className="text-sm text-muted-foreground">A carregar...</div>
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
            <label className="inline-flex items-center gap-2 text-sm">
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
            >
              {state?.phase !== "nominations"
                ? "Nomeações fechadas"
                : saving
                ? "A submeter..."
                : "Submeter"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Nota: começa como <b>pendente</b> até um admin aprovar.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
