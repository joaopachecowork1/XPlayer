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
import { Cigarette, ImageOff, Upload } from "lucide-react";
import { toast } from "sonner";

const UNCATEGORIZED_VALUE = "__uncategorized__";

const PHASE_LABELS: Record<string, string> = {
  nominations: "nomeações",
  voting: "votação",
  gala: "gala",
};

// Sentinel for "no category selected yet" — Radix UI Select does NOT
// accept value="" so we use a non-empty placeholder value instead.
const NO_CATEGORY = "__none__";

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

  // Form — categoryId defaults to sentinel "no category"
  const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY);
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
  }, []);

  const isNominations = state?.phase === "nominations";
  let phaseLabel: string | undefined = state?.phase;
  if (state?.phase === "nominations") {
    phaseLabel = "Nomeações";
  } else if (state?.phase === "voting") {
    phaseLabel = "Votação";
  }

  let submitLabel = "Nomeações fechadas";
  if (isNominations) {
    submitLabel = saving ? "A submeter..." : "Submeter";
  }

  const onSubmit = async () => {
    if (!canSubmit || !state) return;
    if (state.phase !== "nominations") return;

    if (file && !file.type.startsWith("image/")) {
      toast.error("Só é permitido upload de imagens.");
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      toast.error("A imagem excede 10MB.");
      return;
    }

    setSaving(true);
    try {
      const created = await canhoesRepo.createNominee({
        // Convert sentinel back to null (no category).
        categoryId: categoryId === NO_CATEGORY ? null : (categoryId || null),
        title: title.trim(),
      });
      if (file) {
        await canhoesRepo.uploadNomineeImage(created.id, file);
      }
      setTitle("");
      setCategoryId("");
      setFile(null);
      setCategoryId(NO_CATEGORY);
      await refresh();
      toast.success("Nomeação submetida com sucesso.");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível submeter a nomeação.");
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
    <div className="space-y-3">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between px-1">
        <h1
          className="canhoes-title inline-flex items-center gap-2"
          style={{ fontSize: "18px" }}
        >
          <Cigarette className="h-5 w-5" style={{ color: "#ff8c00" }} />
          Canhões do Ano
        </h1>
        {state && (
          <Badge
            variant="outline"
            style={{
              border: "1px solid rgba(0,255,68,0.35)",
              color: "#00ff44",
              background: "rgba(0,255,68,0.06)",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: "11px",
            }}
          >
            Fase: {phaseLabel}
          </Badge>
        )}
      </div>

      {/* ── Submission form ── */}
      <Card className="canhoes-glass rounded-2xl">
        <CardHeader className="pb-1.5">
          <CardTitle
            className="canhoes-label text-sm"
            style={{ color: "rgba(0,255,68,0.80)" }}
          >
            Submeter nomeação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground canhoes-label">Categoria</div>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger
                  style={{
                    background: "rgba(0,10,5,0.7)",
                    border: "1px solid rgba(0,255,68,0.20)",
                  }}
                >
                  <SelectValue placeholder="Escolhe a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">(Admin decide depois)</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground canhoes-label">Título</div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: O sticker mais lendário"
                style={{
                  background: "rgba(0,10,5,0.7)",
                  border: "1px solid rgba(0,255,68,0.20)",
                  color: "#e0ffe0",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label
              className="inline-flex items-center gap-2 text-sm cursor-pointer"
              style={{ color: "rgba(0,255,68,0.65)" }}
            >
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <span style={{ color: "#ffe135", fontWeight: 700 }}>{file.name}</span>
              ) : (
                <span>Adicionar imagem (opcional)</span>
              )}
            </label>

            <Button
              className="canhoes-tap h-9 px-6 font-bold rounded-full"
              disabled={!isNominations || !canSubmit || saving}
              onClick={onSubmit}
              style={{
                background: isNominations && canSubmit
                  ? "linear-gradient(90deg, #00cc44, #008833)"
                  : undefined,
                border: "1.5px solid rgba(0,255,68,0.40)",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {submitLabel}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Nota: começa como <b style={{ color: "#ffe135" }}>pendente</b> até um admin aprovar.
          </div>
        </CardContent>
      </Card>

      {/* ── Nominees list by category ── */}
      {loading ? (
        <div className="flex items-center gap-2 py-4 px-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          A carregar nomeações…
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const list = (byCategory.get(cat.id) ?? []).slice();
            if (list.length === 0) return null;
            return (
              <Card key={cat.id} className="canhoes-glass rounded-2xl">
                <CardHeader className="pb-1.5">
                  <CardTitle
                    className="canhoes-label text-sm"
                    style={{ color: "rgba(0,255,68,0.80)" }}
                  >
                    {cat.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {list.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-center gap-3 rounded-xl p-2"
                      style={{
                        background: "rgba(0,255,68,0.04)",
                        border: "1px solid rgba(0,255,68,0.12)",
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        className="h-12 w-12 overflow-hidden rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(0,20,10,0.8)", border: "1px solid rgba(0,255,68,0.15)" }}
                      >
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

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-semibold text-sm" style={{ color: "#e0ffe0" }}>
                          {n.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(n.createdAtUtc).toLocaleString()}
                        </div>
                      </div>

                      {/* Status badge */}
                      <Badge
                        variant={statusVariant(n.status)}
                        style={
                          n.status === "approved"
                            ? { border: "1px solid #00ff44", color: "#00ff44", background: "rgba(0,255,68,0.08)" }
                            : n.status === "rejected"
                            ? { border: "1px solid #ff2d75", color: "#ff2d75", background: "rgba(255,45,117,0.08)" }
                            : { border: "1px solid rgba(255,225,53,0.40)", color: "#ffe135", background: "rgba(255,225,53,0.06)" }
                        }
                      >
                        {n.status}
                      </Badge>
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
