"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Cigarette, ImageOff, Upload } from "lucide-react";
import { toast } from "sonner";

import { absMediaUrl } from "@/lib/media";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type {
  AwardCategoryDto,
  CanhoesStateDto,
  NomineeDto,
} from "@/lib/api/types";

import { Badge } from "@/components/ui/badge";
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

function formatPhaseLabel(phase?: CanhoesStateDto["phase"]) {
  switch (phase) {
    case "nominations":
      return "Nomeacoes";
    case "voting":
      return "Votacao";
    case "gala":
      return "Gala";
    case "locked":
      return "Fechado";
    default:
      return "Desconhecida";
  }
}

function getNomineeBadgeVariant(status: NomineeDto["status"]) {
  if (status === "approved") return "secondary";
  if (status === "rejected") return "destructive";
  return "outline";
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

  const selectedFilePreviewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ""),
    [selectedFile]
  );

  useEffect(() => {
    return () => {
      if (selectedFilePreviewUrl) {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      }
    };
  }, [selectedFilePreviewUrl]);

  const loadStickerData = useCallback(async () => {
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

      const defaultStickerCategory = (nextCategories ?? []).find((category) =>
        category.name.toLowerCase().includes("sticker")
      );

      setSelectedCategoryId(
        (currentCategoryId) => currentCategoryId || defaultStickerCategory?.id || ""
      );
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar stickers");
      setCanhoesState(null);
      setCategoryList([]);
      setNomineeList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStickerData();
  }, [loadStickerData]);

  const isNominationPhase = canhoesState?.phase === "nominations";
  const canSubmit = stickerTitle.trim().length >= 2;
  const submitButtonLabel = isNominationPhase
    ? isSubmitting
      ? "A submeter..."
      : "Submeter sticker"
    : "Nomeacoes fechadas";

  const stickersWithImage = useMemo(
    () => nomineeList.filter((nominee) => nominee.imageUrl),
    [nomineeList]
  );

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("So podes enviar imagens");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("A imagem excede 15MB");
      return;
    }

    setSelectedFile(file);
  };

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
      await loadStickerData();
      toast.success("Sticker submetido");
    } catch (error) {
      console.error(error);
      toast.error("Nao foi possivel submeter o sticker");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="page-hero px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--color-title)]">
              <Cigarette className="h-4 w-4 text-[var(--color-fire)]" />
              <span className="editorial-kicker">Sticker do ano</span>
            </div>
            <div className="space-y-1">
              <h1 className="canhoes-section-title">Arquivo de stickers</h1>
              <p className="body-small max-w-2xl text-[var(--color-text-muted)]">
                O fluxo de upload agora segue a mesma logica do feed: preview
                real, validacao explicita e URLs de imagem normalizadas para
                funcionar em mobile, Vercel e backend remoto.
              </p>
            </div>
          </div>

          {canhoesState ? (
            <Badge variant="outline">
              Fase: {formatPhaseLabel(canhoesState.phase)}
            </Badge>
          ) : null}
        </div>
      </section>

      <Card>
        <CardHeader className="space-y-1">
          <p className="editorial-kicker">Submissao</p>
          <CardTitle>Enviar um novo sticker</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="body-small text-[var(--color-text-muted)]">A carregar...</p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
              <span className="canhoes-field-label">Titulo</span>
              <Input
                value={stickerTitle}
                onChange={(event) => setStickerTitle(event.target.value)}
                placeholder="Ex: O sticker mais lendario"
              />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-3">
              <p className="canhoes-field-label">Imagem</p>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
                <Upload className="h-4 w-4 text-[var(--neon-cyan)]" />
                <span className="truncate">
                  {selectedFile?.name ?? "Adicionar imagem (opcional)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) =>
                    handleFileChange(event.target.files?.[0] ?? null)
                  }
                />
              </label>
              <p className="canhoes-helper-text">
                Preview local antes do submit. O sticker fica pendente ate um
                admin aprovar.
              </p>
            </div>

            <div className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-panel)]">
              <div className="aspect-square overflow-hidden rounded-[calc(var(--radius-md-token)-4px)] bg-[var(--color-bg-surface)]">
                {selectedFilePreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedFilePreviewUrl}
                    alt={selectedFile?.name ?? "Preview do sticker"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="canhoes-helper-text">
              O upload usa o mesmo padrao de media do feed para evitar URLs
              partidas depois de guardar.
            </p>

            <Button
              disabled={!isNominationPhase || !canSubmit || isSubmitting}
              onClick={() => void handleSubmit()}
              className="w-full sm:w-auto"
            >
              {submitButtonLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="editorial-kicker">Galeria</p>
            <h2 className="heading-3 text-[var(--color-text-primary)]">
              Stickers submetidos
            </h2>
          </div>
          <Badge variant="secondary">{stickersWithImage.length}</Badge>
        </div>

        {!isLoading && stickersWithImage.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="body-small text-[var(--color-text-muted)]">
                Ainda nao ha stickers com imagem para mostrar.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stickersWithImage.map((nominee) => (
            <Card key={nominee.id} className="overflow-hidden">
              <div className="aspect-square bg-[var(--color-bg-surface)]">
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
                  <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
              </div>

              <CardContent className="space-y-3 pt-4">
                <div className="space-y-1">
                  <p className="truncate font-semibold text-[var(--color-text-primary)]">
                    {nominee.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {new Date(nominee.createdAtUtc).toLocaleString("pt-PT")}
                  </p>
                </div>

                <Badge variant={getNomineeBadgeVariant(nominee.status)}>
                  {nominee.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
