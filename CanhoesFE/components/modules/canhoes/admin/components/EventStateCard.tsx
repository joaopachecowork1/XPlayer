"use client";

import { useState } from "react";
import { Eye, Lightbulb, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IS_LOCAL_MODE } from "@/lib/mock";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { AwardCategoryDto, CanhoesPhase, CanhoesStateDto } from "@/lib/api/types";
import { toast } from "sonner";

type EventStateCardProps = {
  state: CanhoesStateDto | null;
  categories: AwardCategoryDto[];
  onUpdate: () => Promise<void>;
};

type CategoryKind = "Sticker" | "UserVote";

const PHASE_OPTIONS: Array<{ value: CanhoesPhase; label: string }> = [
  { value: "nominations", label: "Nomeacoes" },
  { value: "voting", label: "Votacao" },
  { value: "locked", label: "Fechado" },
  { value: "gala", label: "Gala" },
];

export function EventStateCard({
  state,
  categories,
  onUpdate,
}: Readonly<EventStateCardProps>) {
  const [isBusy, setIsBusy] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryKind, setCategoryKind] = useState<CategoryKind>("UserVote");
  const phaseOptions = IS_LOCAL_MODE
    ? PHASE_OPTIONS.filter((phase) => phase.value !== "gala")
    : PHASE_OPTIONS;

  const updateState = async (patch: Partial<CanhoesStateDto>) => {
    if (!state) return;

    setIsBusy(true);
    try {
      await canhoesRepo.updateState({
        phase: (patch.phase ?? state.phase) as CanhoesPhase,
        nominationsVisible:
          patch.nominationsVisible ?? state.nominationsVisible,
        resultsVisible: patch.resultsVisible ?? state.resultsVisible,
      });
      await onUpdate();
      toast.success("Estado atualizado");
    } catch (error) {
      console.error("Update state error:", error);
      toast.error("Erro ao atualizar estado");
    } finally {
      setIsBusy(false);
    }
  };

  const createCategory = async () => {
    const normalizedName = categoryName.trim();

    if (!normalizedName) {
      toast.error("Nome da categoria e obrigatorio");
      return;
    }

    if (normalizedName.length < 3) {
      toast.error("O nome deve ter pelo menos 3 caracteres");
      return;
    }

    if (
      categories.some(
        (category) =>
          category.name.toLowerCase() === normalizedName.toLowerCase()
      )
    ) {
      toast.error("Ja existe uma categoria com esse nome");
      return;
    }

    setIsBusy(true);
    try {
      await canhoesRepo.adminCreateCategory({
        name: normalizedName,
        kind: categoryKind,
        sortOrder: null,
      });
      setCategoryName("");
      await onUpdate();
      toast.success("Categoria criada");
    } catch (error) {
      console.error("Create category error:", error);
      toast.error("Erro ao criar categoria");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-[var(--color-moss)]/20">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2 text-[var(--color-title)]">
            <PlusCircle className="h-4 w-4" />
            <span className="label">Categorias</span>
          </div>
          <CardTitle className="text-base">Criar categoria</CardTitle>
          <p className="body-small text-[var(--color-text-muted)]">
            Mantem o formulario solto e legivel em mobile. Primeiro o nome,
            depois o tipo, por fim a acao.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <div className="space-y-2">
            <label
              htmlFor="admin-category-name"
              className="label text-[var(--color-text-muted)]"
            >
              Nome da categoria
            </label>
            <Input
              id="admin-category-name"
              placeholder="Ex: Melhor meme do ano"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  createCategory();
                }
              }}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
            <div className="space-y-2">
              <label className="label text-[var(--color-text-muted)]">
                Tipo de voto
              </label>
              <Select
                value={categoryKind}
                onValueChange={(value) => setCategoryKind(value as CategoryKind)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UserVote">Voto em pessoa</SelectItem>
                  <SelectItem value="Sticker">Sticker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                disabled={isBusy}
                onClick={createCategory}
                className="w-full lg:w-auto"
              >
                Criar categoria
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--color-moss)]/20">
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Estado do evento</CardTitle>
          <p className="body-small text-[var(--color-text-muted)]">
            Cada controlo fica no seu proprio bloco para evitar uma fila apertada
            de inputs e botoes.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4 md:grid-cols-3">
          <div className="space-y-2 rounded-[var(--radius-md-token)] border border-[var(--color-moss)]/15 bg-[var(--color-bg-surface)]/85 p-3">
            <p className="label text-[var(--color-text-muted)]">Fase atual</p>
            <Select
              value={state?.phase ?? "nominations"}
              onValueChange={(value) =>
                updateState({ phase: value as CanhoesPhase })
              }
              disabled={isBusy}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {phaseOptions.map((phase) => (
                  <SelectItem key={phase.value} value={phase.value}>
                    {phase.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 rounded-[var(--radius-md-token)] border border-[var(--color-moss)]/15 bg-[var(--color-bg-surface)]/85 p-3">
            <p className="label text-[var(--color-text-muted)]">
              Nomeacoes visiveis
            </p>
            <Button
              variant={state?.nominationsVisible ? "default" : "outline"}
              className="w-full justify-between"
              disabled={isBusy}
              onClick={() =>
                updateState({
                  nominationsVisible: !state?.nominationsVisible,
                })
              }
            >
              <span>{state?.nominationsVisible ? "Ativas" : "Escondidas"}</span>
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 rounded-[var(--radius-md-token)] border border-[var(--color-moss)]/15 bg-[var(--color-bg-surface)]/85 p-3">
            <p className="label text-[var(--color-text-muted)]">
              Resultados visiveis
            </p>
            <Button
              variant={state?.resultsVisible ? "default" : "outline"}
              className="w-full justify-between"
              disabled={isBusy}
              onClick={() =>
                updateState({ resultsVisible: !state?.resultsVisible })
              }
            >
              <span>{state?.resultsVisible ? "Ativos" : "Escondidos"}</span>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 rounded-[var(--radius-md-token)] border border-[var(--color-beige-dark)]/30 bg-[var(--color-bg-surface)]/85 p-4">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-fire)]" />
        <p className="body-small text-[var(--color-text-primary)]">
          A votacao so funciona em <strong>voting</strong>. Os resultados aparecem
          quando <strong>resultsVisible</strong> esta ativo ou quando a fase entra
          em <strong>gala</strong>.
          {IS_LOCAL_MODE ? " Em modo local, a fase Gala fica escondida." : ""}
        </p>
      </div>
    </div>
  );
}
