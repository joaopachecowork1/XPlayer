"use client";

import { useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";

import { hubRepo } from "@/lib/repositories/hubRepo";
import type { HubPostDto } from "@/lib/api/types";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PostComposer } from "@/components/modules/hub/components/PostComposer";

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

  const reset = () => {
    setText("");
    setFiles([]);
    setPollOn(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).slice(0, 10);
    setFiles(arr);
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

      const normalizedPollQuestion = pollOn ? pollQuestion.trim() : "";
      const normalizedPollOptions = pollOn
        ? pollOptions.map((o) => o.trim()).filter(Boolean)
        : [];

      const created = await hubRepo.createPost({
        text: trimmed,
        mediaUrls,
        pollQuestion: pollOn && normalizedPollQuestion ? normalizedPollQuestion : null,
        pollOptions: pollOn ? normalizedPollOptions : null,
      });

      if (created && (created as any).id) {
        // Notify any feed instance.
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hub:postCreated", { detail: created as HubPostDto }));
        }
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
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="pb-2">
          <SheetTitle>Novo post</SheetTitle>
        </SheetHeader>

        {!isAuthed ? (
          <div className="p-4 pt-0 space-y-3">
            <div className="text-sm text-muted-foreground">
              Para publicar, inicia sessão.
            </div>
            <Button onClick={() => signIn("google")} className="w-full">
              Entrar com Google
            </Button>
          </div>
        ) : (
          <div className="p-4 pt-0">
            <PostComposer
              text={text}
              onTextChange={setText}
              files={files}
              onPickFiles={onPickFiles}
              pollOn={pollOn}
              onPollOnChange={setPollOn}
              pollQuestion={pollQuestion}
              onPollQuestionChange={setPollQuestion}
              pollOptions={pollOptions}
              onPollOptionChange={(idx, v) =>
                setPollOptions((prev) => prev.map((x, i) => (i === idx ? v : x)))
              }
              onAddPollOption={() =>
                setPollOptions((prev) => (prev.length >= 6 ? prev : [...prev, ""]))
              }
              onRemovePollOption={(idx) =>
                setPollOptions((prev) => prev.filter((_, i) => i !== idx))
              }
              onSubmit={onCreate}
              submitting={submitting}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
