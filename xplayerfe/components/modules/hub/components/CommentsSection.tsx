"use client";

import React from "react";
import type { HubCommentDto } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "./hubUtils";

export function CommentsSection({
  comments,
  draft,
  onDraftChange,
  onSubmit,
}: {
  comments: HubCommentDto[];
  draft: string;
  onDraftChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {(comments ?? []).map((c) => (
          <div key={c.id} className="rounded-xl border px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium truncate">{c.userName}</div>
              <div className="text-xs text-muted-foreground">{formatDateTime(c.createdAtUtc)}</div>
            </div>
            <div className="text-sm whitespace-pre-wrap break-words">{c.text}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="Escreve um comentário..."
          className="min-h-[56px]"
        />
        <Button onClick={onSubmit} disabled={!draft.trim()}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
