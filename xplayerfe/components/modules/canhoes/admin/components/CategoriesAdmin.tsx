"use client";

import { useMemo, useState } from "react";
import type { AwardCategoryDto, CategoryProposalDto, MeasureProposalDto } from "@/lib/api/types";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Switch } from "@radix-ui/react-switch";

type Props = {
  categories: AwardCategoryDto[];
  categoryProposals: CategoryProposalDto[];
  measureProposals: MeasureProposalDto[];
  loading: boolean;
  onUpdate: () => void;
};

type Draft = {
  id: string;
  name: string;
  sortOrder: string;
  kind: string;
  isActive: boolean;
};

export function CategoriesAdmin({ categories, categoryProposals, measureProposals, loading, onUpdate }: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<"Sticker" | "UserVote">("Sticker");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const rows = useMemo(() => {
    return categories
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => {
        const d = drafts[c.id];
        return (
          d ?? {
            id: c.id,
            name: c.name,
            sortOrder: String(c.sortOrder),
            kind: c.kind,
            isActive: c.isActive,
          }
        );
      });
  }, [categories, drafts]);

  const setDraft = (id: string, patch: Partial<Draft>) => {
    setDrafts((prev) => {
      const base = prev[id] ?? {
        id,
        name: categories.find((c) => c.id === id)?.name ?? "",
        sortOrder: String(categories.find((c) => c.id === id)?.sortOrder ?? 0),
        kind: categories.find((c) => c.id === id)?.kind ?? "Sticker",
        isActive: categories.find((c) => c.id === id)?.isActive ?? true,
      };
      return { ...prev, [id]: { ...base, ...patch } };
    });
  };

  const save = async (id: string) => {
    const d = drafts[id];
    if (!d) return;

    const sort = Number(d.sortOrder);
    if (!Number.isFinite(sort)) {
      toast.error("SortOrder inválido");
      return;
    }

    try {
      await canhoesRepo.adminUpdateCategory(id, {
        name: d.name,
        sortOrder: sort,
        isActive: d.isActive,
        kind: d.kind,
      });
      toast.success("Categoria atualizada");
      setDrafts((p) => {
        const { [id]: _, ...rest } = p;
        return rest;
      });
      onUpdate();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao guardar");
    }
  };

  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await canhoesRepo.adminCreateCategory({ name: newName.trim(), sortOrder: null, kind: newKind });
      setNewName("");
      toast.success("Categoria criada");
      onUpdate();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao criar categoria");
    } finally {
      setCreating(false);
    }
  };

  const proposalsSummary = useMemo(() => {
    const cat = {
      pending: categoryProposals.filter((p) => p.status === "pending").length,
      approved: categoryProposals.filter((p) => p.status === "approved").length,
      rejected: categoryProposals.filter((p) => p.status === "rejected").length,
    };
    const meas = {
      pending: measureProposals.filter((p) => p.status === "pending").length,
      approved: measureProposals.filter((p) => p.status === "approved").length,
      rejected: measureProposals.filter((p) => p.status === "rejected").length,
    };
    return { cat, meas };
  }, [categoryProposals, measureProposals]);

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="font-semibold">Criar categoria</div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome" />
            <Select value={newKind} onValueChange={(v) => setNewKind(v as any)}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Sticker">Sticker</SelectItem>
                <SelectItem value="UserVote">Votar num utilizador</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={create} disabled={creating || !newName.trim()}>
              Criar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Categorias</div>
            <Badge variant="outline">{categories.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            {rows.map((r) => (
              <div key={r.id} className="rounded-lg border p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <div className="md:col-span-5">
                    <Input value={r.name} onChange={(e) => setDraft(r.id, { name: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      value={r.sortOrder}
                      onChange={(e) => setDraft(r.id, { sortOrder: e.target.value })}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Select value={r.kind} onValueChange={(v) => setDraft(r.id, { kind: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sticker">Sticker</SelectItem>
                        <SelectItem value="UserVote">Votar num utilizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1 flex items-center gap-2">
                    <Switch checked={r.isActive} onCheckedChange={(v) => setDraft(r.id, { isActive: v })} />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <Button size="sm" onClick={() => save(r.id)} disabled={loading}>
                      Guardar
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  id: {r.id}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="font-semibold">Histórico de propostas</div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Categorias — pendentes: {proposalsSummary.cat.pending}</Badge>
              <Badge variant="outline">aprovadas: {proposalsSummary.cat.approved}</Badge>
              <Badge variant="outline">rejeitadas: {proposalsSummary.cat.rejected}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">Medidas — pendentes: {proposalsSummary.meas.pending}</Badge>
              <Badge variant="outline">aprovadas: {proposalsSummary.meas.approved}</Badge>
              <Badge variant="outline">rejeitadas: {proposalsSummary.meas.rejected}</Badge>
            </div>
          </div>

          <div className="grid gap-2">
            {categoryProposals.slice(0, 30).map((p) => (
              <div key={p.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{p.name}</div>
                  <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>
                    {p.status}
                  </Badge>
                </div>
                {p.description && <div className="text-sm text-muted-foreground">{p.description}</div>}
                <div className="text-xs text-muted-foreground">{new Date(p.createdAtUtc).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
