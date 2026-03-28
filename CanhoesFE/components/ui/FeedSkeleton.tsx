"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FeedSkeletonProps {
  count?: number;
}

export function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <FeedPostSkeleton key={index} index={index} />
      ))}
    </div>
  );
}

interface FeedPostSkeletonProps {
  index: number;
}

function FeedPostSkeleton({ index }: FeedPostSkeletonProps) {
  return (
    <div
      className="editorial-shell overflow-hidden rounded-[var(--radius-lg-token)] blurfade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--color-moss)]/12 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-[var(--color-moss)]/12 animate-pulse" />
            <div className="h-2.5 w-24 rounded bg-[var(--color-brown)]/10 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-[var(--color-moss)]/10 animate-pulse" />
          <div className="h-3 w-5/6 rounded bg-[var(--color-moss)]/10 animate-pulse" />
          <div className="h-3 w-3/5 rounded bg-[var(--color-brown)]/10 animate-pulse" />
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <div className="aspect-[4/3] w-full rounded-[var(--radius-md-token)] bg-[var(--color-bg-surface)] animate-pulse" />
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <div className="editorial-divider" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, actionIndex) => (
            <div
              key={actionIndex}
              className="h-9 w-20 rounded-full bg-[var(--color-bg-surface)] animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function InlineSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 rounded bg-[var(--color-moss)]/12 animate-pulse",
        className
      )}
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg-token)] border border-[var(--color-moss)]/14 bg-[var(--color-bg-card)] p-4 shadow-[var(--shadow-paper)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[var(--color-moss)]/12 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-[var(--color-moss)]/12 animate-pulse" />
          <div className="h-2.5 w-20 rounded bg-[var(--color-brown)]/10 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-[var(--color-moss)]/10 animate-pulse" />
        <div className="h-3 w-5/6 rounded bg-[var(--color-moss)]/10 animate-pulse" />
      </div>
    </div>
  );
}
