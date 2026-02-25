
'use client';
import React from 'react';
import Carousel from './ui/Carousel';
import type { Post } from '../domain/types';
import { useVote } from '../hooks/usePosts';

export default function PostCard({ post }: { post: Post }) {
  const vote = useVote(post.id);
  const poll = post.poll ?? null;

  return (
    <article className="bg-emerald-900/30 border border-emerald-700/30 rounded-2xl p-3 mb-3 text-emerald-50 shadow">
      <header className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-full bg-emerald-700" />
        <div className="text-sm leading-tight">
          <div className="font-semibold">{post.authorName}</div>
          <div className="opacity-70">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
      </header>

      {post.text && <p className="mb-3 whitespace-pre-wrap">{post.text}</p>}

      {post.media?.length ? <Carousel items={post.media} /> : null}

      {/* POLL (single, pretty) */}
      {poll ? (
        <div className="mt-3 rounded-xl bg-emerald-800/50 p-3 border border-emerald-700/40">
          <div className="font-semibold mb-2">{poll.question}</div>
          <ul className="grid gap-2">
            {poll.options.map((opt) => {
              const total = poll.options.reduce((a, b) => a + (b.votes ?? 0), 0) || 1;
              const pct = Math.round(((opt.votes ?? 0) / total) * 100);
              const selected = poll.userVotedOptionId === opt.id;
              return (
                <li key={String(opt.id)}>
                  <button
                    onClick={() => vote.mutate(String(opt.id))}
                    className={"w-full text-left text-sm rounded-lg border px-3 py-2 transition " + 
                      (selected ? "border-emerald-400 bg-emerald-700/60" : "border-emerald-700/50 hover:bg-emerald-800/40")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{opt.text}</span>
                      <span className="opacity-80">{pct}%</span>
                    </div>
                    <div className="h-1 mt-2 rounded bg-emerald-700/40 overflow-hidden">
                      <div className="h-1 bg-emerald-400" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {poll.endsAt ? (
            <div className="text-xs opacity-70 mt-2">Termina: {new Date(poll.endsAt).toLocaleString()}</div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
