"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const HUB_EMOJIS = ["❤️", "🔥", "😂"] as const;

export function ReactionRail({
  emojis = HUB_EMOJIS,
  myReactions,
  reactionCounts,
  likeCount,
  commentCount,
  onToggleReaction,
  onToggleComments,
}: {
  emojis?: readonly string[];
  myReactions: string[];
  reactionCounts: Record<string, number> | undefined;
  likeCount: number | undefined;
  commentCount: number | undefined;
  onToggleReaction: (emoji: string) => void;
  onToggleComments: () => void;
}) {
  const counts = reactionCounts || {};
  const mine = new Set(myReactions || []);

  return (
    <div className="w-14 shrink-0 border-r bg-muted/30 p-2 flex flex-col items-center gap-2">
      {emojis.map((emoji) => {
        const active = mine.has(emoji);
        const count = counts[emoji] ?? (emoji === "❤️" ? likeCount ?? 0 : 0);
        return (
          <button
            key={emoji}
            onClick={() => onToggleReaction(emoji)}
            className={cn(
              "w-full rounded-xl border px-1 py-2 text-xs flex flex-col items-center gap-1",
              active ? "bg-primary text-primary-foreground" : "hover:bg-background"
            )}
          >
            <span className="text-base leading-none">{emoji}</span>
            <span className="font-medium">{count}</span>
          </button>
        );
      })}

      <button
        onClick={onToggleComments}
        className="w-full rounded-xl border px-1 py-2 text-xs flex flex-col items-center gap-1 hover:bg-background"
        title="Comentários"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="font-medium">{commentCount ?? 0}</span>
      </button>
    </div>
  );
}
