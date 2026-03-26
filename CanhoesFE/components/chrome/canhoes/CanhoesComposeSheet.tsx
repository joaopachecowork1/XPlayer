"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  GripHorizontal,
  ImagePlus,
  Leaf,
  Loader2,
  PlusCircle,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { hubRepo } from "@/lib/repositories/hubRepo";
import { cn } from "@/lib/utils";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const MAX_MEDIA_FILES = 10;
const MAX_FILE_MB = 15;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const TARGET_UPLOAD_MB = 2.5;
const TARGET_UPLOAD_BYTES = TARGET_UPLOAD_MB * 1024 * 1024;
const TARGET_MAX_DIMENSION = 1600;
const TARGET_QUALITY = 0.8;

const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const ACCEPTED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
]);

const TRANSCODE_IMAGE_TYPES = new Set(["image/heic", "image/heif"]);

function fileExtension(name: string) {
  const extensionStart = name.lastIndexOf(".");
  if (extensionStart < 0) return "";
  return name.slice(extensionStart + 1).toLowerCase();
}

function isAcceptedImage(file: File) {
  const mimeType = (file.type || "").toLowerCase();
  if (mimeType && ACCEPTED_IMAGE_TYPES.has(mimeType)) return true;
  return ACCEPTED_IMAGE_EXTENSIONS.has(fileExtension(file.name));
}

function shouldTranscode(file: File) {
  const mimeType = (file.type || "").toLowerCase();
  if (TRANSCODE_IMAGE_TYPES.has(mimeType)) return true;
  return ["heic", "heif"].includes(fileExtension(file.name));
}

function supportsWebpEncode() {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

async function decodeImage(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    if ("createImageBitmap" in globalThis) {
      const bitmap = await createImageBitmap(file);

      return {
        draw: (context: CanvasRenderingContext2D, width: number, height: number) => {
          context.drawImage(bitmap, 0, 0, width, height);
          bitmap.close();
        },
        height: bitmap.height,
        width: bitmap.width,
      };
    }

    const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImageElement = new Image();
      nextImageElement.onload = () => resolve(nextImageElement);
      nextImageElement.onerror = reject;
      nextImageElement.decoding = "async";
      nextImageElement.src = objectUrl;
    });

    return {
      draw: (context: CanvasRenderingContext2D, width: number, height: number) => {
        context.drawImage(imageElement, 0, 0, width, height);
      },
      height: imageElement.naturalHeight,
      width: imageElement.naturalWidth,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function normalizeUploadImage(file: File) {
  const mustTranscode = shouldTranscode(file);

  if (!mustTranscode && file.size <= TARGET_UPLOAD_BYTES) return file;

  try {
    const sourceImage = await decodeImage(file);
    const scale = Math.min(1, TARGET_MAX_DIMENSION / Math.max(sourceImage.width, sourceImage.height));
    const targetWidth = Math.max(1, Math.round(sourceImage.width * scale));
    const targetHeight = Math.max(1, Math.round(sourceImage.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return file;

    sourceImage.draw(context, targetWidth, targetHeight);

    const mimeType = supportsWebpEncode() ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, TARGET_QUALITY));

    if (!blob) return file;
    if (!mustTranscode && blob.size >= file.size) return file;

    const extension = mimeType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^/.]+$/, "");

    return new File([blob], `${baseName}.${extension}`, {
      lastModified: Date.now(),
      type: mimeType,
    });
  } catch {
    return file;
  }
}

export function CanhoesComposeSheet({
  open,
  onOpenChange,
  onDone,
}: Readonly<{
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDone?: () => void;
}>) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [postText, setPostText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");
  const [isPollEnabled, setIsPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles]
  );

  useEffect(() => {
    return () => previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
  }, [previewUrls]);

  const resetComposer = useCallback(() => {
    setPostText("");
    setSelectedFiles([]);
    setUploadProgress(0);
    setUploadLabel("");
    setIsPollEnabled(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  }, []);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const incomingFiles = Array.from(fileList);
    const nextFiles = [...selectedFiles];
    const existingKeys = new Set(
      nextFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
    );
    let optimizedFileCount = 0;

    for (const incomingFile of incomingFiles) {
      const fileKey = `${incomingFile.name}-${incomingFile.size}-${incomingFile.lastModified}`;

      if (existingKeys.has(fileKey)) continue;
      if (!isAcceptedImage(incomingFile)) {
        toast.error(`${incomingFile.name}: formato não suportado`);
        continue;
      }
      if (incomingFile.size > MAX_FILE_BYTES) {
        toast.error(`${incomingFile.name}: máximo ${MAX_FILE_MB}MB`);
        continue;
      }
      if (nextFiles.length >= MAX_MEDIA_FILES) {
        toast.error(`Máximo de ${MAX_MEDIA_FILES} imagens por post`);
        break;
      }

      const preparedFile = await normalizeUploadImage(incomingFile);
      if (preparedFile.size < incomingFile.size) optimizedFileCount++;

      nextFiles.push(preparedFile);
      existingKeys.add(fileKey);
    }

    setSelectedFiles(nextFiles);

    if (optimizedFileCount > 0) {
      toast.success(`${optimizedFileCount} imagem(ns) otimizadas para upload rápido`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const handleMoveFile = (index: number, direction: -1 | 1) => {
    setSelectedFiles((currentFiles) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= currentFiles.length) return currentFiles;

      const reorderedFiles = [...currentFiles];
      const [pickedFile] = reorderedFiles.splice(index, 1);
      reorderedFiles.splice(targetIndex, 0, pickedFile);
      return reorderedFiles;
    });
  };

  const handlePollOptionChange = (index: number, value: string) => {
    setPollOptions((currentOptions) =>
      currentOptions.map((option, currentIndex) => (currentIndex === index ? value : option))
    );
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions((currentOptions) => [...currentOptions, ""]);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions((currentOptions) =>
        currentOptions.filter((_, currentIndex) => currentIndex !== index)
      );
    }
  };

  const handleCreatePost = async () => {
    const trimmedPostText = postText.trim();
    if (!trimmedPostText) return;

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadLabel("");

    try {
      let mediaUrls: string[] = [];

      if (selectedFiles.length > 0) {
        setUploadLabel("A enviar imagens...");
        const uploadedUrls: string[] = [];

        for (let index = 0; index < selectedFiles.length; index++) {
          const selectedFile = selectedFiles[index];
          const urls = await hubRepo.uploadImages([selectedFile]);
          const uploadedUrl = urls?.[0];

          if (!uploadedUrl) {
            throw new Error(`Falha ao enviar ${selectedFile.name}`);
          }

          uploadedUrls.push(uploadedUrl);
          setUploadProgress(Math.round(((index + 1) / selectedFiles.length) * 100));
          setUploadLabel(`A enviar imagens... ${index + 1}/${selectedFiles.length}`);
        }

        mediaUrls = uploadedUrls;
      }

      const trimmedPollQuestion = isPollEnabled ? pollQuestion.trim() : "";
      const trimmedPollOptions = isPollEnabled
        ? pollOptions.map((option) => option.trim()).filter(Boolean)
        : [];

      const createdPost = await hubRepo.createPost({
        mediaUrls,
        pollOptions: isPollEnabled ? trimmedPollOptions : null,
        pollQuestion: isPollEnabled && trimmedPollQuestion ? trimmedPollQuestion : null,
        text: trimmedPostText,
      });

      if (createdPost?.id && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hub:postCreated", { detail: createdPost }));
      }

      toast.success("Post publicado");
      resetComposer();
      onDone?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      const errorSuffix =
        error instanceof Error && error.message ? `: ${error.message.slice(0, 160)}` : "";
      toast.error(`Não foi possível publicar${errorSuffix}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="pb-safe">
        <SheetHeader className="pb-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-moss)] text-[var(--color-text-primary)]">
              <Leaf className="h-4 w-4" />
            </span>

            <div className="space-y-1">
              <SheetTitle>Novo Post</SheetTitle>
              <p className="body-small text-[var(--color-text-muted)]">
                Partilha uma foto, um texto ou uma votação.
              </p>
            </div>
          </div>
        </SheetHeader>

        {isAuthenticated ? (
          <div className="space-y-4 px-4 pb-4">
            <Textarea
              value={postText}
              onChange={(event) => setPostText(event.target.value)}
              placeholder="O que está a acontecer?"
              className="min-h-24 resize-none"
              autoFocus
            />

            {selectedFiles.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-medium text-[var(--color-text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <GripHorizontal className="h-3.5 w-3.5" />
                    Ordem das fotos no post
                  </span>
                  <span>
                    {selectedFiles.length}/{MAX_MEDIA_FILES}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {selectedFiles.map((selectedFile, index) => (
                    <div
                      key={`${selectedFile.name}-${selectedFile.size}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--color-beige-dark)]/25 bg-[var(--color-bg-surface-alt)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrls[index]}
                        className="h-full w-full object-cover"
                        alt={selectedFile.name}
                        loading="lazy"
                        decoding="async"
                      />

                      <div className="absolute left-1 top-1 rounded-md bg-[rgba(26,31,20,0.8)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-text-primary)]">
                        {index + 1}
                      </div>

                      <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleMoveFile(index, -1)}
                          disabled={index === 0}
                          className="canhoes-tap flex h-7 w-7 items-center justify-center rounded-md bg-[rgba(26,31,20,0.8)] text-[var(--color-text-primary)] disabled:opacity-40"
                          aria-label="Mover para a esquerda"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMoveFile(index, 1)}
                          disabled={index === selectedFiles.length - 1}
                          className="canhoes-tap flex h-7 w-7 items-center justify-center rounded-md bg-[rgba(26,31,20,0.8)] text-[var(--color-text-primary)] disabled:opacity-40"
                          aria-label="Mover para a direita"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="canhoes-tap absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(26,31,20,0.8)] text-[var(--color-text-primary)] opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Remover imagem"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {isSubmitting && selectedFiles.length > 0 ? (
              <div className="space-y-2 rounded-2xl border border-[var(--color-beige-dark)]/25 bg-[var(--color-bg-surface-alt)] p-3">
                <div className="flex items-center justify-between text-xs font-medium text-[var(--color-text-dark)]">
                  <span>{uploadLabel || "A enviar..."}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5 bg-[rgba(61,43,24,0.16)]" />
              </div>
            ) : null}

            {isPollEnabled ? (
              <div className="space-y-3 rounded-2xl border border-[var(--color-beige-dark)]/25 bg-[var(--color-bg-surface-alt)] p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-dark)]">
                  <BarChart3 className="h-4 w-4 text-[var(--color-fire)]" />
                  Votação
                </div>

                <Textarea
                  value={pollQuestion}
                  onChange={(event) => setPollQuestion(event.target.value)}
                  placeholder="Pergunta da votação..."
                  className="min-h-16 resize-none"
                />

                <div className="space-y-2">
                  {pollOptions.map((pollOption, index) => (
                    <div key={`poll-${index}-${pollOption.length}`} className="flex gap-2">
                      <Input
                        value={pollOption}
                        onChange={(event) => handlePollOptionChange(index, event.target.value)}
                        placeholder={`Opção ${index + 1}`}
                      />

                      {pollOptions.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(index)}
                          className="canhoes-tap flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-beige-dark)]/25 bg-transparent text-[var(--color-danger)]"
                          aria-label={`Remover opção ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  ))}

                  {pollOptions.length < 6 ? (
                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="canhoes-tap inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-[var(--color-brown)]"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Adicionar opção
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Imagens"
                  disabled={isSubmitting || selectedFiles.length >= MAX_MEDIA_FILES}
                  className={cn(
                    "canhoes-tap relative flex h-11 w-11 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-50",
                    selectedFiles.length > 0
                      ? "border-[var(--color-moss)] bg-[var(--color-moss)] text-[var(--color-text-primary)]"
                      : "border-[var(--color-beige-dark)]/25 bg-transparent text-[var(--color-brown)]"
                  )}
                >
                  <ImagePlus className="h-4 w-4" />
                  {selectedFiles.length > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-fire)] text-[9px] font-bold text-white">
                      {selectedFiles.length}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => setIsPollEnabled((currentValue) => !currentValue)}
                  title="Votação"
                  disabled={isSubmitting}
                  className={cn(
                    "canhoes-tap flex h-11 w-11 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-50",
                    isPollEnabled
                      ? "border-[var(--color-brown)] bg-[var(--color-brown)] text-[var(--color-text-primary)]"
                      : "border-[var(--color-beige-dark)]/25 bg-transparent text-[var(--color-brown)]"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={() => void handleCreatePost()}
                disabled={isSubmitting || !postText.trim()}
                className="min-w-[120px]"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Publicar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 px-4 pb-4">
            <p className="body-small text-[var(--color-text-muted)]">Para publicar, inicia sessão.</p>
            <Button onClick={() => signIn("google")} className="w-full">
              Entrar com Google
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </SheetContent>
    </Sheet>
  );
}
