"use client";

import { useEffect, useMemo, useState } from "react";
import { Cigarette, ImageOff, Upload } from "lucide-react";

import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { CANHOES_API_URL } from "@/lib/api/canhoesClient";
import type { AwardCategoryDto, CanhoesStateDto, NomineeDto } from "@/lib/api/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export function CanhoesStickerSubmitModule() {
  const [canhoesState, setCanhoesState] = useState<CanhoesStateDto | null>(null);
  const [categoryList, setCategoryList] = useState<AwardCategoryDto[]>([]);
  const [nomineeList, setNomineeList] = useState<NomineeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [stickerTitle, setStickerTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const canSubmit = stickerTitle.trim().length >= 2;

  useEffect(() => {
    const loadStickerData = async () => {
      setIsLoading(true);

      try {
        const [nextState, nextCategories, nextNominees] = await Promise.all([
          canhoesRepo.getState(),
          canhoesRepo.getCategories(),
          canhoesRepo.getNominees(),
        ]);

        setCanhoesState(nextState);
        setCategoryList(Array.isArray(nextCategories) ? nextCategories : []);
        setNomineeList(Array.isArray(nextNominees) ? nextNominees : []);

        const defaultStickerCategory = nextCategories.find((category) =>
          category.name.toLowerCase().includes("sticker")
        );

        setSelectedCategoryId((currentCategoryId) => currentCategoryId || defaultStickerCategory?.id || "");
      } catch (error) {
        console.error(error);
        setCanhoesState(null);
        setCategoryList([]);
        setNomineeList([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadStickerData();
  }, []);

  const isNominationPhase = canhoesState?.phase === "nominations";
  const submitButtonLabel = isNominationPhase
    ? isSubmitting
      ? "A submeter..."
      : "Submeter"
    : "Nomeações fechadas";
  const nomineesWithImage = useMemo(() => nomineeList.filter((nominee) => nominee.imageUrl), [nomineeList]);

  const handleSubmit = async () => {
    if (canhoesState?.phase !== "nominations" || !canSubmit) return;

    setIsSubmitting(true);
    try {
      const createdNominee = await canhoesRepo.createNominee({
        categoryId: selectedCategoryId || null,
        title: stickerTitle.trim(),
      });

      if (selectedFile) {
        await canhoesRepo.uploadNomineeImage(createdNominee.id, selectedFile);
      }

      setStickerTitle("");
      setSelectedFile(null);
      const nextNominees = await canhoesRepo.getNominees();
      setNomineeList(nextNominees);
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
            <Cigarette className="h-4 w-4 text-[var(--color-fire)]" />
            Sticker do Ano
          </h1>
          <p className="body-small text-[var(--color-text-muted)]">
            Sobe a tua imagem sem depender de estilos especiais fora do sistema.
          </p>
        </div>

        {canhoesState ? <Badge variant="outline">Fase: {formatPhaseLabel(canhoesState.phase)}</Badge> : null}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Submeter sticker</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? <p className="body-small text-[var(--color-text-muted)]">A carregar...</p> : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="canhoes-field-label">Categoria</span>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolhe a categoria" />
                </SelectTrigger>
                <SelectContent>
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
                value={stickerTitle}
                onChange={(event) => setStickerTitle(event.target.value)}
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

          <p className="canhoes-helper-text">A submissão começa como pendente até um admin aprovar.</p>
        </CardContent>
      </Card>

      {!isLoading && nomineesWithImage.length > 0 ? (
        <div className="space-y-3">
          <h2 className="heading-3 text-[var(--color-text-primary)]">Stickers submetidos</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nomineesWithImage.map((nominee) => (
              <Card key={nominee.id} className="overflow-hidden">
                <div className="aspect-square bg-white/5">
                  {nominee.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${CANHOES_API_URL}${nominee.imageUrl}`}
                      alt={nominee.title}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
                      <ImageOff className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <CardContent className="space-y-2 pt-4">
                  <p className="truncate font-semibold text-[var(--color-text-primary)]">{nominee.title}</p>
                  <Badge variant={nominee.status === "approved" ? "secondary" : "outline"}>{nominee.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


