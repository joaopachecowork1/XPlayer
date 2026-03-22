"use client";

import { useEffect, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { AwardCategoryDto, CanhoesStateDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy } from "lucide-react";

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

  const isNominations = state?.phase === "nominations";
  const canPropose = Boolean(name.trim().length >= 3) && isNominations;
  let proposeLabel = "Propostas fechadas";
  if (isNominations) {
    proposeLabel = busy ? "A enviar..." : "Propor";
  }

  let categoriesBody: React.ReactNode;
  if (loading) {
    categoriesBody = <div className="text-sm text-muted-foreground">A carregar...</div>;
  } else if (categories.length === 0) {
    categoriesBody = <div className="text-sm text-muted-foreground">Ainda não há categorias.</div>;
  } else {
    categoriesBody = categories.map((c) => (
      <div key={c.id} className="canhoes-chip flex items-center justify-between rounded-lg p-2">
        <div className="min-w-0">
          <div className="truncate font-medium">{c.name}</div>
          <div className="text-xs text-muted-foreground">Ordem: {c.sortOrder}</div>
        </div>
        <Badge variant="secondary">Ativa</Badge>
      </div>
    ));
  }

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div
          className="canhoes-title flex items-center gap-2"
          style={{ fontSize: "17px" }}
        >
          <Flame className="h-4 w-4" style={{ color: "#ff8c00" }} /> Categorias
        </div>
        {state ? <Badge variant="outline">Fase: {state.phase}</Badge> : null}
      </div>

      <Card className="canhoes-glass rounded-2xl">
        <CardHeader className="pb-1.5">
          <CardTitle
            className="canhoes-label text-sm flex items-center gap-2"
            style={{ color: "rgba(0,255,68,0.80)" }}
          >
            <Trophy className="h-4 w-4" style={{ color: "#ffe135" }} />Propor categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
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
            <Button className="canhoes-tap h-9" disabled={!canPropose || busy} onClick={() => void propose()}>
              {proposeLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="canhoes-glass rounded-2xl">
        <CardHeader className="pb-1.5">
          <CardTitle className="text-base">Categorias ativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categoriesBody}
        </CardContent>
      </Card>
    </div>
  );
}
