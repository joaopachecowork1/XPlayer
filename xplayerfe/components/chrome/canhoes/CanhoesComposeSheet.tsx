"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { BarChart3, ImagePlus, Leaf, Loader2, PlusCircle, Send, Trash2, X } from "lucide-react";

import { hubRepo } from "@/lib/repositories/hubRepo";
import type { HubPostDto } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CanhoesComposeSheet({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDone?: () => void;
}) {
  const { status } = useSession();
  const isAuthed = useMemo(() => status === "authenticated", [status]);

  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pollOn, setPollOn] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Stable object URLs – revoked when files change or sheet closes.
  const previewUrls = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files]
  );
  useEffect(() => {
    return () => previewUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [previewUrls]);

  const reset = useCallback(() => {
    setText("");
    setFiles([]);
    setPollOn(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  }, []);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 10));
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

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
    try {
      let mediaUrls: string[] = [];
      if (files.length > 0) {
        mediaUrls = await hubRepo.uploadImages(files);
      }

      const pollQ = pollOn ? pollQuestion.trim() : "";
      const pollOpts = pollOn ? pollOptions.map((o) => o.trim()).filter(Boolean) : [];

      const created = await hubRepo.createPost({
        text: trimmed,
        mediaUrls,
        pollQuestion: pollOn && pollQ ? pollQ : null,
        pollOptions: pollOn ? pollOpts : null,
      });

      if (created?.id && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hub:postCreated", { detail: created as HubPostDto }));
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
      <SheetContent side="bottom" className="rounded-t-2xl bg-gradient-to-b from-jungle-950 to-moss-950 border-t border-jungle-700/30">
        <SheetHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-jungle-700/40 border border-jungle-600/30 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-jungle-300" />
            </span>
            <SheetTitle className="text-jungle-100 text-base">Novo Post</SheetTitle>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-jungle-700/40 to-transparent mt-1" />
        </SheetHeader>

        {!isAuthed ? (
          <div className="p-4 pt-0 space-y-3">
            <div className="text-sm text-jungle-400/80">Para publicar, inicia sessão.</div>
            <Button onClick={() => signIn("google")} className="w-full bg-jungle-600 hover:bg-jungle-500 text-white border-0 rounded-xl">
              Entrar com Google
            </Button>
          </div>
        ) : (
          <div className="space-y-4 px-1">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="O que está a acontecer?"
              className="min-h-[100px] bg-jungle-900/40 border-jungle-700/30 text-jungle-50 placeholder:text-jungle-600/70 focus-visible:ring-jungle-600/50 resize-none rounded-xl"
              autoFocus
            />

            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {files.map((f, idx) => (
                    <div key={`${f.name}-${f.size}-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-jungle-700/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrls[idx]} className="w-full h-full object-cover" alt={f.name} />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                ))}
              </div>
            )}

            {pollOn && (
              <div className="bg-jungle-900/30 rounded-xl border border-jungle-700/25 p-3 space-y-2">
                <div className="flex items-center gap-2 text-jungle-300 text-sm font-medium">
                  <BarChart3 className="w-4 h-4" /> Votação
                </div>
                <Textarea
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Pergunta da votação..."
                  className="min-h-[56px] bg-jungle-900/40 border-jungle-700/30 text-jungle-100 placeholder:text-jungle-600/70 resize-none rounded-xl text-sm"
                />
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        className="flex-1 h-9 rounded-lg border border-jungle-700/30 bg-jungle-900/40 px-3 text-sm text-jungle-100 placeholder:text-jungle-600/70 focus:outline-none focus:ring-1 focus:ring-jungle-600/50"
                        value={opt}
                        onChange={(e) => updatePollOption(idx, e.target.value)}
                        placeholder={`Opção ${idx + 1}`}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(idx)}
                          className="w-9 h-9 rounded-lg border border-jungle-700/25 flex items-center justify-center text-jungle-600 hover:text-red-400 hover:border-red-500/30 transition-all"
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
                      className="flex items-center gap-1.5 text-xs text-jungle-500 hover:text-jungle-300 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Adicionar opção
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  title="Imagens"
                  className={cn(
                    "relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
                    files.length > 0
                      ? "bg-jungle-700/50 border-jungle-500/50 text-jungle-300"
                      : "border-jungle-700/30 text-jungle-500 hover:bg-jungle-800/50 hover:text-jungle-300"
                  )}
                >
                  <ImagePlus className="w-4 h-4" />
                  {files.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-jungle-500 text-[9px] font-bold text-white flex items-center justify-center">
                      {files.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPollOn((p) => !p)}
                  title="Votação"
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
                    pollOn
                      ? "bg-jungle-700/50 border-jungle-500/50 text-jungle-300"
                      : "border-jungle-700/30 text-jungle-500 hover:bg-jungle-800/50 hover:text-jungle-300"
                  )}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={onCreate}
                disabled={submitting || !text.trim()}
                className="bg-jungle-600 hover:bg-jungle-500 text-white border-0 rounded-xl px-5 gap-2 transition-all disabled:opacity-40 shadow-md shadow-jungle-900/40"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publicar
              </Button>
            </div>
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
