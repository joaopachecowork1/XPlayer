"use client";

import React from "react";
import type { HubPollDto } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function PollBox({
  poll,
  onVote,
}: Readonly<{
  poll: HubPollDto;
  onVote: (optionId: string) => void;
}>) {
  const total = Math.max(0, poll.totalVotes || 0);
  return (
    <div className="rounded-xl canhoes-glass p-3 space-y-2">
      <div className="text-sm font-semibold text-jungle-100">{poll.question}</div>
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
                "w-full text-left rounded-xl border border-jungle-300/35 px-3 py-2 relative overflow-hidden canhoes-tap",
                active ? "border-emerald-300/70 shadow-[0_0_16px_rgba(68,255,153,0.2)]" : "hover:bg-jungle-900/50"
              )}
            >
              <div
                className={cn(
                  "absolute inset-y-0 left-0",
                  active ? "bg-emerald-400/28" : "bg-jungle-300/10"
                )}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-jungle-50 truncate">{o.text}</span>
                <span className="text-xs text-jungle-300/75 shrink-0">
                  {o.voteCount} · {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-jungle-300/70">{total} voto(s) — podes trocar o teu voto</div>
    </div>
  );
}
