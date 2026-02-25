"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PostComposer({
  text,
  onTextChange,
  files,
  onPickFiles,
  pollOn,
  onPollOnChange,
  pollQuestion,
  onPollQuestionChange,
  pollOptions,
  onPollOptionChange,
  onAddPollOption,
  onRemovePollOption,
  onSubmit,
  submitting,
}: {
  text: string;
  onTextChange: (v: string) => void;
  files: File[];
  onPickFiles: (list: FileList | null) => void;
  pollOn: boolean;
  onPollOnChange: (on: boolean) => void;
  pollQuestion: string;
  onPollQuestionChange: (v: string) => void;
  pollOptions: string[];
  onPollOptionChange: (idx: number, v: string) => void;
  onAddPollOption: () => void;
  onRemovePollOption: (idx: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="font-medium">Novo post</div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Descrição..."
          className="min-h-[96px]"
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <input type="file" accept="image/*" multiple onChange={(e) => onPickFiles(e.target.files)} />
          <Button onClick={onSubmit} disabled={submitting || !text.trim()}>
            Publicar
          </Button>
        </div>

        <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Votação (poll)</div>
            <Button variant={pollOn ? "default" : "outline"} size="sm" onClick={() => onPollOnChange(!pollOn)}>
              {pollOn ? "Ativa" : "Adicionar"}
            </Button>
          </div>

          {pollOn && (
            <div className="space-y-2">
              <Textarea
                value={pollQuestion}
                onChange={(e) => onPollQuestionChange(e.target.value)}
                placeholder="Pergunta da votação..."
                className="min-h-[64px]"
              />

              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={opt}
                      onChange={(e) => onPollOptionChange(idx, e.target.value)}
                      placeholder={`Opção ${idx + 1}`}
                    />
                    {pollOptions.length > 2 && (
                      <Button variant="ghost" size="sm" onClick={() => onRemovePollOption(idx)}>
                        Remover
                      </Button>
                    )}
                  </div>
                ))}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Single choice (pode trocar de voto).</div>
                  <Button variant="outline" size="sm" onClick={onAddPollOption} disabled={pollOptions.length >= 6}>
                    + Opção
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {files.map((f) => {
              const url = URL.createObjectURL(f);
              return (
                <img
                  key={f.name + f.size}
                  src={url}
                  className="h-24 w-24 object-cover rounded-md border"
                  alt="preview"
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
