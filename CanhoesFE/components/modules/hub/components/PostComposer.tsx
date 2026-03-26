"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  Camera,
  ImagePlus,
  Leaf,
  Loader2,
  PlusCircle,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PostComposerSubmitData {
  text: string;
  files: File[];
  pollOn: boolean;
  pollQuestion: string;
  pollOptions: string[];
}

interface PostComposerProps {
  /** Called when the user clicks "Publicar". Should be an async function that handles upload + post creation. */
  onSubmit: (data: PostComposerSubmitData) => Promise<void>;
}

export function PostComposer({ onSubmit }: PostComposerProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [pollOn, setPollOn] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Stable object URLs – revoked automatically when files change or dialog closes.
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
    setPollOn(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    setOpen(next);
  };

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ text, files, pollOn, pollQuestion, pollOptions });
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* ── Trigger ─────────────────────────────────────────────── */}
      <DialogTrigger asChild>
        <button className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-jungle-900/70 to-moss-900/50 border border-jungle-700/30 hover:border-jungle-600/50 hover:from-jungle-900/90 hover:to-moss-900/70 transition-all duration-200 hover:shadow-lg hover:shadow-jungle-950/30">
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-jungle-700/40 flex items-center justify-center group-hover:bg-jungle-600/50 transition-colors">
            <Leaf className="w-4 h-4 text-jungle-300" />
          </span>
          <span className="flex-1 text-sm text-left text-jungle-400/70 group-hover:text-jungle-300/80 transition-colors">
            Partilha algo com o grupo...
          </span>
          <span className="flex items-center gap-2 text-jungle-500/50 group-hover:text-jungle-400/70 transition-colors">
            <Camera className="w-4 h-4" />
            <BarChart3 className="w-4 h-4" />
          </span>
        </button>
      </DialogTrigger>

      {/* ── Dialog ──────────────────────────────────────────────── */}
      <DialogContent
        showCloseButton={false}
        className="max-w-lg w-full p-0 border-0 overflow-hidden rounded-3xl bg-gradient-to-b from-jungle-950 via-moss-950 to-jungle-950 shadow-2xl shadow-jungle-950/60"
      >
        {/* Header */}
        <DialogHeader className="relative px-5 pt-5 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-jungle-700/40 border border-jungle-600/30 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-jungle-300" />
              </span>
              <DialogTitle className="text-jungle-100 text-base font-semibold tracking-tight">
                Novo Post
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="w-8 h-8 rounded-full bg-jungle-800/50 hover:bg-jungle-700/60 border border-jungle-700/30 flex items-center justify-center text-jungle-400 hover:text-jungle-200 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Divider */}
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-jungle-700/40 to-transparent" />
        </DialogHeader>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Text area */}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que está a acontecer?"
            className="min-h-[120px] bg-jungle-900/40 border-jungle-700/30 text-jungle-50 placeholder:text-jungle-300/85 focus-visible:ring-jungle-600/50 focus-visible:border-jungle-600/60 resize-none rounded-xl transition-colors"
            autoFocus
          />

          {/* Image previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-2 animate-slide-up">
              {files.map((f, idx) => (
                  <div
                    key={`${f.name}-${f.size}-${idx}`}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-jungle-700/30"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrls[idx]} className="w-full h-full object-cover" alt={f.name} />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
              ))}
              {files.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-jungle-700/40 flex flex-col items-center justify-center gap-1 text-jungle-600/70 hover:border-jungle-500/60 hover:text-jungle-400 transition-all duration-150"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span className="text-xs font-medium">Mais</span>
                </button>
              )}
            </div>
          )}

          {/* Poll section */}
          {pollOn && (
            <div className="bg-jungle-900/30 rounded-xl border border-jungle-700/25 p-4 space-y-3 animate-slide-up">
              <div className="flex items-center gap-2 text-jungle-300 text-sm font-medium">
                <BarChart3 className="w-4 h-4" />
                Votação
              </div>
              <Textarea
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Pergunta da votação..."
                className="min-h-[60px] bg-jungle-900/40 border-jungle-700/30 text-jungle-100 placeholder:text-jungle-300/85 focus-visible:ring-jungle-600/50 resize-none rounded-xl text-sm"
              />
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 h-9 rounded-lg border border-jungle-700/30 bg-jungle-900/40 px-3 text-sm text-jungle-100 placeholder:text-jungle-300/85 focus:outline-none focus:ring-1 focus:ring-jungle-600/50 focus:border-jungle-600/50 transition-colors"
                      value={opt}
                      onChange={(e) => updatePollOption(idx, e.target.value)}
                      placeholder={`Opção ${idx + 1}`}
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(idx)}
                        className="w-9 h-9 rounded-lg border border-jungle-700/25 flex items-center justify-center text-jungle-600 hover:text-red-400 hover:border-red-500/30 hover:bg-red-950/20 transition-all"
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
                    className="flex items-center gap-1.5 text-xs text-jungle-500 hover:text-jungle-300 transition-colors py-0.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Adicionar opção
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="px-5 pb-5">
          <div className="h-px bg-gradient-to-r from-transparent via-jungle-700/30 to-transparent mb-4" />
          <div className="flex items-center justify-between">
            {/* Left: media & poll toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                title="Adicionar imagens"
                className={cn(
                  "relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150",
                  files.length > 0
                    ? "bg-jungle-700/50 border-jungle-500/50 text-jungle-300"
                    : "border-jungle-700/30 text-jungle-500 hover:bg-jungle-800/50 hover:text-jungle-300 hover:border-jungle-600/40"
                )}
              >
                <ImagePlus className="w-4 h-4" />
                {files.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-jungle-500 text-[9px] font-bold text-white flex items-center justify-center leading-none">
                    {files.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPollOn((p) => !p)}
                title="Adicionar votação"
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150",
                  pollOn
                    ? "bg-jungle-700/50 border-jungle-500/50 text-jungle-300"
                    : "border-jungle-700/30 text-jungle-500 hover:bg-jungle-800/50 hover:text-jungle-300 hover:border-jungle-600/40"
                )}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>

            {/* Right: publish */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
              className="bg-jungle-600 hover:bg-jungle-500 active:bg-jungle-700 text-white border-0 rounded-xl px-5 gap-2 transition-all duration-150 disabled:opacity-40 shadow-md shadow-jungle-900/40"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publicar
            </Button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </DialogContent>
    </Dialog>
  );
}
