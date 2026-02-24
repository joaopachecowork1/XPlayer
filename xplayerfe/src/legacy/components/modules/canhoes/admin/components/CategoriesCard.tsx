"use client";

import { useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { AwardCategoryDto, CreateAwardCategoryRequest, UpdateAwardCategoryRequest } from "@/lib/api/types";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Props = {
  categories: AwardCategoryDto[];
  onRefresh: () => Promise<void>;
};

const KIND_OPTIONS = [
  { value: "Sticker", label: "Sticker" },
  { value: "UserVote", label: "Voto em Pessoa" },
];

export function CategoriesCard({ categories, onRefresh }: Props) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<string>("UserVote");
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)),
    [categories]
  );

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const payload: CreateAwardCategoryRequest = {
        name: name.trim(),
        sortOrder: undefined,
        kind,
        description: null,
        voteQuestion: null,
        voteRules: null,
      };
      await canhoesRepo.adminCreateCategory(payload);
      setName("");
      toast.success("Categoria criada");
      await onRefresh();
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível criar");
    } finally {
      setBusy(false);
    }
  };

  const update = async (id: string, payload: UpdateAwardCategoryRequest) => {
    setBusy(true);
    try {
      await canhoesRepo.adminUpdateCategory(id, payload);
      toast.success("Categoria atualizada");
      await onRefresh();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao atualizar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="font-semibold">Criar categoria</div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_220px_200px]">
          <Input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {KIND_OPTIONS.map((k) => (
                <SelectItem key={k.value} value={k.value}>
                  {k.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={busy || !name.trim()} onClick={create}>
            Criar
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="font-semibold">Categorias</div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sorted.length === 0 && (
            <div className="text-sm text-muted-foreground">Sem categorias.</div>
          )}

          {sorted.map((c) => (
            <CategoryRow key={c.id} cat={c} busy={busy} onSave={update} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryRow({
  cat,
  busy,
  onSave,
}: {
  cat: AwardCategoryDto;
  busy: boolean;
  onSave: (id: string, payload: UpdateAwardCategoryRequest) => Promise<void>;
}) {
  const [draft, setDraft] = useState<UpdateAwardCategoryRequest>({
    name: cat.name,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    kind: cat.kind,
    description: cat.description ?? "",
    voteQuestion: cat.voteQuestion ?? "",
    voteRules: cat.voteRules ?? "",
  });

  const changed = JSON.stringify(draft) !== JSON.stringify({
    name: cat.name,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    kind: cat.kind,
    description: cat.description ?? "",
    voteQuestion: cat.voteQuestion ?? "",
    voteRules: cat.voteRules ?? "",
  });

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <Input
          className="md:max-w-[420px]"
          value={draft.name ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ordem</span>
          <Input
            type="number"
            className="w-24"
            value={String(draft.sortOrder ?? 0)}
            onChange={(e) =>
              setDraft((d) => ({ ...d, sortOrder: Number(e.target.value) }))
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ativa</span>
          <Switch
            checked={Boolean(draft.isActive)}
            onCheckedChange={(v) => setDraft((d) => ({ ...d, isActive: v }))}
          />
        </div>
        <div className="flex-1" />
        <Button
          disabled={busy || !changed}
          onClick={() => onSave(cat.id, normalizeDraft(draft))}
        >
          Guardar
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Pergunta</div>
          <Input
            value={draft.voteQuestion ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, voteQuestion: e.target.value }))}
            placeholder="Ex: Quem merece ganhar?"
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Descrição</div>
          <Input
            value={draft.description ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Regras</div>
        <Textarea
          value={draft.voteRules ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, voteRules: e.target.value }))}
          placeholder="Opcional (ex: 1 voto por pessoa)"
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}

function normalizeDraft(d: UpdateAwardCategoryRequest): UpdateAwardCategoryRequest {
  const clean = { ...d };
  if (clean.name != null) clean.name = clean.name.trim();
  if (clean.description != null) clean.description = clean.description.trim() || null;
  if (clean.voteQuestion != null) clean.voteQuestion = clean.voteQuestion.trim() || null;
  if (clean.voteRules != null) clean.voteRules = clean.voteRules.trim() || null;
  return clean;
}
