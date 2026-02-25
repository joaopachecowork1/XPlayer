"use client";

import React from "react";
import type { HubPollDto } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function PollBox({
  poll,
  onVote,
}: {
  poll: HubPollDto;
  onVote: (optionId: string) => void;
}) {
  const total = Math.max(0, poll.totalVotes || 0);
  return (
    <div className="rounded-xl border bg-background/60 p-3 space-y-2">
      <div className="text-sm font-medium">{poll.question}</div>
      <div className="space-y-2">
        {poll.options.map((o) => {
          const active = poll.myOptionId === o.id;
          const pct = total > 0 ? Math.round((o.voteCount / total) * 100) : 0;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onVote(o.id)}
              className={cn(
                "w-full text-left rounded-lg border px-3 py-2 relative overflow-hidden",
                active ? "border-emerald-500" : "hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "absolute inset-y-0 left-0",
                  active ? "bg-emerald-500/20" : "bg-muted/30"
                )}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{o.text}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {o.voteCount} · {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-muted-foreground">{total} voto(s) — podes trocar o teu voto</div>
    </div>
  );
}
