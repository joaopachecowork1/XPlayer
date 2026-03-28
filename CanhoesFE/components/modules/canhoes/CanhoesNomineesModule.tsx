"use client";

import { useEffect, useMemo, useState } from "react";
import { Cigarette, ImageOff, Upload } from "lucide-react";
import { toast } from "sonner";

import { absMediaUrl } from "@/lib/media";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { AwardCategoryDto, CanhoesStateDto, NomineeDto } from "@/lib/api/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NO_CATEGORY = "__none__";

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

function getNomineeStatusVariant(status: NomineeDto["status"]) {
  if (status === "approved") return "secondary";
  if (status === "rejected") return "destructive";
  return "outline";
}

export function CanhoesNomineesModule() {
  const [canhoesState, setCanhoesState] = useState<CanhoesStateDto | null>(null);
  const [categoryList, setCategoryList] = useState<AwardCategoryDto[]>([]);
  const [nomineeList, setNomineeList] = useState<NomineeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(NO_CATEGORY);
  const [nomineeTitle, setNomineeTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const canSubmit = nomineeTitle.trim().length >= 2;

  const loadNominees = async () => {
    setIsLoading(true);

    try {
      const [nextState, nextCategories, nextNominees] = await Promise.all([
        canhoesRepo.getState(),
        canhoesRepo.getCategories(),
        canhoesRepo.getNominees(),
      ]);

      setCanhoesState(nextState);
      setCategoryList(nextCategories);
      setNomineeList(nextNominees);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNominees();
  }, []);

  const nomineesByCategory = useMemo(() => {
    const nomineesMap = new Map<string, NomineeDto[]>();

    for (const nominee of nomineeList) {
      const categoryKey = nominee.categoryId ?? "__uncategorized";
      const nomineesForCategory = nomineesMap.get(categoryKey) ?? [];

      nomineesForCategory.push(nominee);
      nomineesMap.set(categoryKey, nomineesForCategory);
    }

    return nomineesMap;
  }, [nomineeList]);

  const isNominationPhase = canhoesState?.phase === "nominations";
  const submitButtonLabel = isNominationPhase
    ? isSubmitting
      ? "A submeter..."
      : "Submeter"
    : "Nomeações fechadas";

  const handleSubmit = async () => {
    if (!canSubmit || canhoesState?.phase !== "nominations") return;

    if (selectedFile && !selectedFile.type.startsWith("image/")) {
      toast.error("Só é permitido upload de imagens.");
      return;
    }

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      toast.error("A imagem excede 10MB.");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdNominee = await canhoesRepo.createNominee({
        categoryId: selectedCategoryId === NO_CATEGORY ? null : selectedCategoryId,
        title: nomineeTitle.trim(),
      });

      if (selectedFile) {
        await canhoesRepo.uploadNomineeImage(createdNominee.id, selectedFile);
      }

      setNomineeTitle("");
      setSelectedCategoryId(NO_CATEGORY);
      setSelectedFile(null);
      await loadNominees();
      toast.success("Nomeação submetida com sucesso.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível submeter a nomeação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="canhoes-section-title flex items-center gap-2">
            <Cigarette className="h-4 w-4 text-[var(--color-fire)]" />
            Canhões do Ano
          </h1>
          <p className="body-small text-[var(--color-text-muted)]">
            Submete uma nomeação com layout simples e controlos legíveis em mobile.
          </p>
        </div>

        {canhoesState ? <Badge variant="outline">Fase: {formatPhaseLabel(canhoesState.phase)}</Badge> : null}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Submeter nomeação</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="canhoes-field-label">Categoria</span>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolhe a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>(Admin decide depois)</SelectItem>
                  {categoryList.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2">
              <span className="canhoes-field-label">Título</span>
              <Input
                value={nomineeTitle}
                onChange={(event) => setNomineeTitle(event.target.value)}
                placeholder="Ex.: O sticker mais lendário"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-moss)]/20 px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]">
              <Upload className="h-4 w-4 text-[var(--color-beige)]" />
              <span className="truncate">{selectedFile?.name ?? "Adicionar imagem (opcional)"}</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <Button disabled={!isNominationPhase || !canSubmit || isSubmitting} onClick={() => void handleSubmit()}>
              {submitButtonLabel}
            </Button>
          </div>

          <p className="canhoes-helper-text">A nomeação começa como pendente até aprovação de um admin.</p>
        </CardContent>
      </Card>

      {isLoading ? <p className="body-small text-[var(--color-text-muted)]">A carregar nomeações...</p> : null}

      {!isLoading ? (
        <div className="space-y-4">
          {categoryList.map((category) => {
            const nomineesForCategory = nomineesByCategory.get(category.id) ?? [];
            if (nomineesForCategory.length === 0) return null;

            return (
              <Card key={category.id}>
                <CardHeader className="pb-2">
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {nomineesForCategory.map((nominee) => (
                    <div key={nominee.id} className="canhoes-list-item flex items-center gap-3 p-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                        {nominee.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={absMediaUrl(nominee.imageUrl)}
                            alt={nominee.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <ImageOff className="h-4 w-4 text-[var(--color-text-muted)]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[var(--color-text-primary)]">{nominee.title}</p>
                        <p className="body-small text-[var(--color-text-muted)]">
                          {new Date(nominee.createdAtUtc).toLocaleString()}
                        </p>
                      </div>

                      <Badge variant={getNomineeStatusVariant(nominee.status)}>{nominee.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}


