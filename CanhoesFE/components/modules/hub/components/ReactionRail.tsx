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
}: Readonly<{
  emojis?: readonly string[];
  myReactions: string[];
  reactionCounts: Record<string, number> | undefined;
  likeCount: number | undefined;
  commentCount: number | undefined;
  onToggleReaction: (emoji: string) => void;
  onToggleComments: () => void;
}>) {
  const counts = reactionCounts || {};
  const mine = new Set(myReactions || []);

  return (
    <div className="w-14 shrink-0 border-r border-jungle-300/30 bg-[linear-gradient(180deg,rgba(12,24,17,0.86)_0%,rgba(8,15,12,0.9)_100%)] p-2 flex flex-col items-center gap-2">
      {emojis.map((emoji) => {
        const active = mine.has(emoji);
        const count = counts[emoji] ?? (emoji === "❤️" ? likeCount ?? 0 : 0);
        return (
          <button
            key={emoji}
            onClick={() => onToggleReaction(emoji)}
            className={cn(
              "w-full rounded-xl border px-1 py-2 text-xs flex flex-col items-center gap-1 canhoes-tap",
              active
                ? "canhoes-chip border-jungle-200/70 text-jungle-50 shadow-[0_0_18px_rgba(77,255,149,0.22)]"
                : "border-jungle-300/25 text-jungle-300/90 hover:bg-jungle-900/55"
            )}
          >
            <span className="text-base leading-none">{emoji}</span>
            <span className="font-medium">{count}</span>
          </button>
        );
      })}

      <button
        onClick={onToggleComments}
        className="w-full rounded-xl border border-jungle-300/25 px-1 py-2 text-xs flex flex-col items-center gap-1 text-jungle-300/90 hover:bg-jungle-900/55 canhoes-tap"
        title="Comentários"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="font-medium">{commentCount ?? 0}</span>
      </button>
    </div>
  );
}
