"use client";

import { useEffect, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { AwardCategoryDto, CanhoesStateDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function CanhoesCategoriesModule() {
  const [state, setState] = useState<CanhoesStateDto | null>(null);
  const [categories, setCategories] = useState<AwardCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [st, cats] = await Promise.all([canhoesRepo.getState(), canhoesRepo.getCategories()]);
      setState(st);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const canPropose = Boolean(name.trim().length >= 3) && state?.phase === "nominations";

  const propose = async () => {
    if (!canPropose) return;
    setBusy(true);
    try {
      await canhoesRepo.createCategoryProposal({ name: name.trim(), description: desc.trim() || null });
      setName("");
      setDesc("");
      // Categories list only shows approved categories; proposal is handled in Admin.
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Categorias
        </div>
        {state ? <Badge variant="outline">Fase: {state.phase}</Badge> : null}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Propor categoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Nome</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Melhor sticker de sempre" />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Descrição (opcional)</div>
              <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Dá contexto ao canhão..." />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Fica pendente até um admin aprovar.</div>
            <Button disabled={!canPropose || busy} onClick={() => void propose()}>
              {state?.phase !== "nominations" ? "Propostas fechadas" : busy ? "A enviar..." : "Propor"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Categorias ativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">A carregar...</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-muted-foreground">Ainda não há categorias.</div>
          ) : (
            categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">Ordem: {c.sortOrder}</div>
                </div>
                <Badge variant="secondary">Ativa</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
