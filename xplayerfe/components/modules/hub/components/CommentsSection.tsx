"use client";

import React, { useState } from "react";
import type { HubCommentDto } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDateTime } from "./hubUtils";

const COMMENT_EMOJIS = ["❤️", "🔥", "😂"] as const;

type CommentReactionsProps = {
  comment: HubCommentDto;
  postId: string;
  onToggleReaction: (commentId: string, emoji: string) => void;
};

function CommentReactions({ comment, postId, onToggleReaction }: Readonly<CommentReactionsProps>) {
  const counts = comment.reactionCounts ?? {};
  const mine = new Set(comment.myReactions ?? []);

  return (
    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
      {COMMENT_EMOJIS.map((emoji) => {
        const active = mine.has(emoji);
        const count = counts[emoji] ?? 0;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggleReaction(comment.id, emoji)}
            className={cn(
              "reaction-bounce flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] sm:text-xs border transition-all canhoes-tap",
              active
                ? "canhoes-chip border-jungle-200/70 text-jungle-50 shadow-[0_0_8px_rgba(77,255,149,0.2)]"
                : "border-jungle-300/25 text-jungle-400/70 hover:bg-jungle-900/40"
            )}
          >
            <span className="text-sm leading-none">{emoji}</span>
            {count > 0 && <span className="font-semibold">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function CommentsSection({
  comments,
  postId,
  draft,
  onDraftChange,
  onSubmit,
  onToggleCommentReaction,
}: Readonly<{
  comments: HubCommentDto[];
  postId: string;
  draft: string;
  onDraftChange: (v: string) => void;
  onSubmit: () => void;
  onToggleCommentReaction?: (commentId: string, emoji: string) => void;
}>) {
  return (
    <div className="space-y-2 rounded-xl canhoes-glass p-2.5 sm:p-3">
      <div className="space-y-2">
        {(comments ?? []).map((c) => (
          <div key={c.id} className="rounded-xl canhoes-chip px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[13px] sm:text-sm font-semibold text-jungle-100 truncate">{c.userName}</div>
              <div className="text-xs text-jungle-300/70">{formatDateTime(c.createdAtUtc)}</div>
            </div>
            <div className="text-[13px] sm:text-sm text-jungle-50/95 whitespace-pre-wrap break-words">{c.text}</div>
            {onToggleCommentReaction && (
              <CommentReactions
                comment={c}
                postId={postId}
                onToggleReaction={onToggleCommentReaction}
              />
            )}
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
