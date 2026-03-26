"use client";

import { useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";

import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { AwardCategoryDto, CanhoesStateDto } from "@/lib/api/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function formatPhaseLabel(phase?: CanhoesStateDto["phase"]) {
  switch (phase) {
    case "nominations":
      return "Nomeações";
    case "voting":
      return "Votação";
    case "gala":
      return "Gala";
    case "locked":
      return "Fechado";
    default:
      return "Desconhecida";
  }
}

export function CanhoesCategoriesModule() {
  const [canhoesState, setCanhoesState] = useState<CanhoesStateDto | null>(null);
  const [categoryList, setCategoryList] = useState<AwardCategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);

    try {
      const [nextState, nextCategories] = await Promise.all([
        canhoesRepo.getState(),
        canhoesRepo.getCategories(),
      ]);

      setCanhoesState(nextState);
      setCategoryList(nextCategories);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const isNominationPhase = canhoesState?.phase === "nominations";
  const canSubmitProposal = categoryName.trim().length >= 3 && isNominationPhase;
  const submitButtonLabel = isNominationPhase
    ? isSubmitting
      ? "A enviar..."
      : "Propor"
    : "Propostas fechadas";

  const handleProposalSubmit = async () => {
    if (!canSubmitProposal) return;

    setIsSubmitting(true);
    try {
      await canhoesRepo.createCategoryProposal({
        description: categoryDescription.trim() || null,
        name: categoryName.trim(),
      });

      setCategoryName("");
      setCategoryDescription("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="canhoes-section-title flex items-center gap-2">
            <Flame className="h-4 w-4 text-[var(--color-fire)]" />
            Categorias
          </h1>
          <p className="body-small text-[var(--color-text-muted)]">
            Propõe novas categorias enquanto as nomeações estiverem abertas.
          </p>
        </div>

        {canhoesState ? <Badge variant="outline">Fase: {formatPhaseLabel(canhoesState.phase)}</Badge> : null}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[var(--color-fire)]" />
            Propor categoria
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="canhoes-field-label">Nome</span>
              <Input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Ex.: Melhor sticker de sempre"
              />
            </label>

            <label className="space-y-2">
              <span className="canhoes-field-label">Descrição</span>
              <Textarea
                value={categoryDescription}
                onChange={(event) => setCategoryDescription(event.target.value)}
                placeholder="Dá contexto ao canhão..."
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="canhoes-helper-text">A proposta fica pendente até aprovação de um admin.</p>
            <Button disabled={!canSubmitProposal || isSubmitting} onClick={() => void handleProposalSubmit()}>
              {submitButtonLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Categorias ativas</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? <p className="body-small text-[var(--color-text-muted)]">A carregar...</p> : null}

          {!isLoading && categoryList.length === 0 ? (
            <p className="body-small text-[var(--color-text-muted)]">Ainda não há categorias.</p>
          ) : null}

          {!isLoading
            ? categoryList.map((category) => (
                <div key={category.id} className="canhoes-list-item flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--color-text-primary)]">{category.name}</p>
                    <p className="body-small text-[var(--color-text-muted)]">Ordem: {category.sortOrder}</p>
                  </div>
                  <Badge variant="secondary">{category.isActive ? "Ativa" : "Inativa"}</Badge>
                </div>
              ))
            : null}
        </CardContent>
      </Card>
    </div>
  );
}
