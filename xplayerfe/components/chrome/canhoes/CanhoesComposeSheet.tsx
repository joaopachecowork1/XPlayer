"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, BarChart3, GripHorizontal, ImagePlus, Leaf, Loader2, PlusCircle, Send, Trash2, X } from "lucide-react";

import { hubRepo } from "@/lib/repositories/hubRepo";
import { cn } from "@/lib/utils";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

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
        width: bitmap.width,
        height: bitmap.height,
        draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
          ctx.drawImage(bitmap, 0, 0, w, h);
          bitmap.close();
        },
      };
    }

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.decoding = "async";
      el.src = objectUrl;
    });

    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
        ctx.drawImage(img, 0, 0, w, h);
      },
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function normalizeUploadImage(file: File) {
  // Keep tiny files untouched for speed.
  if (file.size <= TARGET_UPLOAD_BYTES) return file;

  try {
    const source = await decodeImage(file);
    const scale = Math.min(1, TARGET_MAX_DIMENSION / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return file;

    source.draw(ctx, width, height);

    const mime = supportsWebpEncode() ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, TARGET_QUALITY)
    );

    if (!blob || blob.size >= file.size) return file;

    const nextExt = mime === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const nextName = `${baseName}.${nextExt}`;
    return new File([blob], nextName, {
      type: mime,
      lastModified: Date.now(),
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
  onOpenChange: (o: boolean) => void;
  onDone?: () => void;
}>) {
  const { status } = useSession();
  const isAuthed = useMemo(() => status === "authenticated", [status]);

  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");
  const [pollOn, setPollOn] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Stable object URLs – revoked when files change or sheet closes.
  const previewUrls = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files]
  );
  useEffect(() => {
    return () => previewUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [previewUrls]);

  const reset = useCallback(() => {
    setText("");
    setFiles([]);
    setUploadProgress(0);
    setUploadLabel("");
    setPollOn(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  }, []);

  const handleFiles = async (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);

    const next = [...files];
    const existingKeys = new Set(next.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
    let compressedCount = 0;

    for (const original of incoming) {
      const key = `${original.name}-${original.size}-${original.lastModified}`;
      if (existingKeys.has(key)) continue;
      if (!ACCEPTED_IMAGE_TYPES.has(original.type)) {
        toast.error(`${original.name}: formato não suportado`);
        continue;
      }
      if (original.size > MAX_FILE_BYTES) {
        toast.error(`${original.name}: máximo ${MAX_FILE_MB}MB`);
        continue;
      }
      if (next.length >= MAX_MEDIA_FILES) {
        toast.error(`Máximo de ${MAX_MEDIA_FILES} imagens por post`);
        break;
      }

      const prepared = await normalizeUploadImage(original);
      if (prepared.size < original.size) compressedCount++;
      next.push(prepared);
      existingKeys.add(key);
    }

    setFiles(next);

    if (compressedCount > 0) {
      toast.success(`${compressedCount} imagem(ns) otimizadas para upload rápido`);
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const moveFile = (idx: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [picked] = next.splice(idx, 1);
      next.splice(target, 0, picked);
      return next;
    });
  };

  const updatePollOption = (idx: number, val: string) =>
    setPollOptions((prev) => prev.map((x, i) => (i === idx ? val : x)));

  const addPollOption = () => {
    if (pollOptions.length < 6) setPollOptions((p) => [...p, ""]);
  };

  const removePollOption = (idx: number) => {
    if (pollOptions.length > 2) setPollOptions((p) => p.filter((_, i) => i !== idx));
  };

  const onCreate = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setUploadProgress(0);
    setUploadLabel("");
    try {
      let mediaUrls: string[] = [];
      if (files.length > 0) {
        setUploadLabel("A enviar imagens...");
        const uploaded: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const urls = await hubRepo.uploadImages([file]);
          const url = urls?.[0];
          if (!url) {
            throw new Error(`Falha ao enviar ${file.name}`);
          }
          uploaded.push(url);
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
          setUploadLabel(`A enviar imagens... ${i + 1}/${files.length}`);
        }
        mediaUrls = uploaded;
      }

      const pollQ = pollOn ? pollQuestion.trim() : "";
      const pollOpts = pollOn ? pollOptions.map((o) => o.trim()).filter(Boolean) : [];

      const created = await hubRepo.createPost({
        text: trimmed,
        mediaUrls,
        pollQuestion: pollOn && pollQ ? pollQ : null,
        pollOptions: pollOn ? pollOpts : null,
      });

      if (created?.id && globalThis.window !== undefined) {
        globalThis.window.dispatchEvent(new CustomEvent("hub:postCreated", { detail: created }));
      }

      toast.success("Post publicado");
      reset();
      onDone?.();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível publicar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t"
        style={{
          background: "linear-gradient(145deg, #0d1f12, #091508)",
          borderColor: "#2aaa44",
        }}
      >
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,255,68,0.12)", border: "1px solid rgba(0,255,68,0.3)" }}>
              <Leaf className="w-4 h-4" style={{ color: "#00ff44" }} />
            </span>
            <SheetTitle style={{ fontFamily: "'Fredoka One', cursive", color: "#ffe135", fontSize: "18px" }}>Novo Post</SheetTitle>
          </div>
          <div className="h-px mt-1" style={{ background: "linear-gradient(90deg, transparent, #00ff4430, transparent)" }} />
        </SheetHeader>

        {isAuthed ? (
          <div className="space-y-3 px-0.5 sm:px-1">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="O que está a acontecer?"
              className="min-h-[88px] sm:min-h-[100px] resize-none rounded-xl focus-visible:ring-0"
              style={{
                background: "#091508",
                border: "1.5px solid #2aaa44",
                color: "#c8f5c8",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: "14px",
              }}
              autoFocus
            />

            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]" style={{ color: "#7abf7a" }}>
                  <span className="inline-flex items-center gap-1">
                    <GripHorizontal className="h-3.5 w-3.5" />
                    Ordem das fotos no post
                  </span>
                  <span>{files.length}/{MAX_MEDIA_FILES}</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
                {files.map((f, idx) => (
                    <div key={`${f.name}-${f.size}-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border bg-black/10" style={{ borderColor: "#2aaa44" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrls[idx]} className="h-full w-full object-cover" alt={f.name} loading="lazy" decoding="async" />
                      <div className="absolute left-1 top-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {idx + 1}
                      </div>
                      <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 opacity-100 sm:opacity-0 transition-opacity sm:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => moveFile(idx, -1)}
                          disabled={idx === 0}
                          className="canhoes-tap h-6 w-6 rounded-md bg-black/60 text-white disabled:opacity-40"
                          aria-label="Mover para a esquerda"
                        >
                          <ArrowLeft className="mx-auto h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFile(idx, 1)}
                          disabled={idx === files.length - 1}
                          className="canhoes-tap h-6 w-6 rounded-md bg-black/60 text-white disabled:opacity-40"
                          aria-label="Mover para a direita"
                        >
                          <ArrowRight className="mx-auto h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="canhoes-tap absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                ))}
                </div>
              </div>
            )}

            {submitting && files.length > 0 && (
              <div className="space-y-1.5 rounded-xl p-3" style={{ border: "1px solid #2aaa44", background: "#091508" }}>
                <div className="flex items-center justify-between text-xs" style={{ color: "#7abf7a" }}>
                  <span>{uploadLabel || "A enviar..."}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5 bg-jungle-950/70" />
              </div>
            )}

            {pollOn && (
              <div className="rounded-xl p-3 space-y-2" style={{ background: "#091508", border: "1.5px solid #2aaa44" }}>
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#7abf7a" }}>
                  <BarChart3 className="w-4 h-4" /> Votação
                </div>
                <Textarea
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Pergunta da votação..."
                  className="min-h-[56px] resize-none rounded-xl text-sm focus-visible:ring-0"
                  style={{
                    background: "#091508",
                    border: "1.5px solid #2aaa44",
                    color: "#c8f5c8",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                  }}
                />
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={`poll-${idx}-${opt.length}`} className="flex gap-2">
                      <input
                        className="flex-1 h-9 rounded-lg px-3 text-sm focus:outline-none"
                        style={{
                          background: "#091508",
                          border: "1.5px solid #2aaa44",
                          color: "#c8f5c8",
                          fontFamily: "'Nunito', sans-serif",
                          fontWeight: 700,
                        }}
                        value={opt}
                        onChange={(e) => updatePollOption(idx, e.target.value)}
                        placeholder={`Opção ${idx + 1}`}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(idx)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                          style={{ border: "1.5px solid #2aaa44", color: "#7abf7a" }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: "#7abf7a" }}
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Adicionar opção
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  title="Imagens"
                  disabled={submitting || files.length >= MAX_MEDIA_FILES}
                  className={cn(
                    "canhoes-tap relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  style={{
                    border: "1.5px solid #2aaa44",
                    background: files.length > 0 ? "rgba(0,255,68,0.12)" : "transparent",
                    color: files.length > 0 ? "#00ff44" : "#7abf7a",
                  }}
                >
                  <ImagePlus className="w-4 h-4" />
                  {files.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: "#00cc44" }}>
                      {files.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPollOn((p) => !p)}
                  title="Votação"
                  disabled={submitting}
                  className={cn(
                    "canhoes-tap w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  style={{
                    border: "1.5px solid #2aaa44",
                    background: pollOn ? "rgba(0,255,68,0.12)" : "transparent",
                    color: pollOn ? "#00ff44" : "#7abf7a",
                  }}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={onCreate}
                disabled={submitting || !text.trim()}
                className="canhoes-tap min-w-[102px] h-9 sm:min-w-[118px] sm:h-10 rounded-full px-4 sm:px-5 gap-2 transition-all disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #00dd44 0%, #009933 50%, #007722 100%)",
                  border: "1.5px solid #00ff44",
                  color: "#ffffff",
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: "15px",
                  boxShadow: "0 4px 20px #00ff4455",
                }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publicar
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 pt-0 space-y-3">
            <div className="text-sm" style={{ color: "#7abf7a" }}>Para publicar, inicia sessão.</div>
            <Button
              onClick={() => signIn("google")}
              className="w-full rounded-xl"
              style={{
                background: "linear-gradient(135deg, #00dd44 0%, #009933 100%)",
                border: "1.5px solid #00ff44",
                color: "#ffffff",
                fontFamily: "'Fredoka One', cursive",
              }}
            >
              Entrar com Google
            </Button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </SheetContent>
    </Sheet>
  );
}
