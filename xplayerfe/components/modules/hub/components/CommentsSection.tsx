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
  onToggleReaction,
}: Readonly<{
  comments: HubCommentDto[];
  draft: string;
  onDraftChange: (v: string) => void;
  onSubmit: () => void;
  onToggleReaction: (commentId: string, emoji: string) => void;
}>) {
  const emojis = ["❤️", "🔥", "😂"];

  return (
    <div className="space-y-2 rounded-xl canhoes-glass p-2.5 sm:p-3">
      <div className="space-y-2">
        {(comments ?? []).map((c) => (
          <div key={c.id} className="rounded-xl canhoes-chip px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[13px] sm:text-sm font-bold text-white truncate">{c.userName}</div>
              <div className="text-xs text-slate-400">{formatDateTime(c.createdAtUtc)}</div>
            </div>
            <div className="text-[13px] sm:text-sm text-slate-100 whitespace-pre-wrap break-words">{c.text}</div>
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {emojis.map((emoji) => {
                const active = (c.myReactions ?? []).includes(emoji);
                const count = c.reactionCounts?.[emoji] ?? 0;
                return (
                  <Button
                    key={`${c.id}-${emoji}`}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    className="h-7 rounded-full px-2 text-xs"
                    onClick={() => onToggleReaction(c.id, emoji)}
                  >
                    <span className="leading-none">{emoji}</span>
                    <span className="tabular-nums">{count}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="Escreve um comentário..."
          className="min-h-[52px] sm:min-h-[56px] text-[13px] sm:text-sm bg-jungle-900/45 border-jungle-500/35 text-jungle-50 placeholder:text-jungle-400/60"
        />
        <Button className="canhoes-chip canhoes-tap h-9 text-jungle-100 border-jungle-300/45" onClick={onSubmit} disabled={!draft.trim()}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
