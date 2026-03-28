"use client";

import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/animations/BlurFade";
import { NumberTicker } from "@/components/animations/NumberTicker";
import type { HubCommentDto, HubPostDto } from "@/lib/api/types";

import { CommentsSection } from "./components/CommentsSection";
import { HUB_EMOJIS } from "./components/ReactionRail";
import { MediaCarousel } from "./components/MediaCarousel";
import { PollBox } from "./components/PollBox";
import { PostHeader } from "./components/PostHeader";

const HUB_EMOJI_LABELS = ["\u2764\uFE0F", "\uD83D\uDD25", "\uD83D\uDE02"] as const;

interface HubPostCardProps {
  post: HubPostDto;
  index: number;
  isAdmin: boolean;
  openComments: boolean;
  commentDraft: string;
  comments?: HubCommentDto[];
  onToggleReaction: (postId: string, emoji: string) => void;
  onToggleComments: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onAddComment: (postId: string) => void;
  onCommentDraftChange: (postId: string, text: string) => void;
  onToggleCommentReaction: (
    postId: string,
    commentId: string,
    emoji: string
  ) => void;
  onAdminPin: (postId: string) => void;
  onAdminDelete: (postId: string) => void;
}

export function HubPostCard({
  post,
  index,
  isAdmin,
  openComments,
  commentDraft,
  comments = [],
  onToggleReaction,
  onToggleComments,
  onVotePoll,
  onAddComment,
  onCommentDraftChange,
  onToggleCommentReaction,
  onAdminPin,
  onAdminDelete,
}: Readonly<HubPostCardProps>) {
  const mediaUrls = (post.mediaUrls ?? []).filter(Boolean);
  const reactionCounts = post.reactionCounts || {};
  const reactionCountTotal =
    Object.keys(reactionCounts).length > 0
      ? Object.values(reactionCounts).reduce(
          (total, currentValue) => total + currentValue,
          0
        )
      : (post.likeCount ?? 0);

  return (
    <BlurFade delay={index * 50}>
      <article className="editorial-shell rounded-[var(--radius-lg-token)]">
        <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          <PostHeader
            authorName={post.authorName}
            createdAtUtc={post.createdAtUtc}
            isPinned={post.isPinned}
            isAdmin={isAdmin}
            onAdminPin={() => onAdminPin(post.id)}
            onAdminDelete={() => onAdminDelete(post.id)}
          />

          {post.text ? (
            <p className="body-base whitespace-pre-wrap break-words text-[var(--color-text-dark)]">
              {post.text}
            </p>
          ) : null}
        </div>

        {mediaUrls.length > 0 ? (
          <div className="px-4 pb-4 sm:px-5">
            <MediaCarousel urls={mediaUrls} />
          </div>
        ) : null}

        {post.poll ? (
          <div className="px-4 pb-4 sm:px-5">
            <PollBox
              poll={post.poll}
              onVote={(optionId) => onVotePoll(post.id, optionId)}
            />
          </div>
        ) : null}

        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="editorial-divider" />

          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {HUB_EMOJIS.map((emoji, emojiIndex) => {
                const isActive = (post.myReactions ?? []).includes(emoji);
                const reactionCount =
                  reactionCounts[emoji] ?? (emojiIndex === 0 ? post.likeCount ?? 0 : 0);

                return (
                  <Button
                    key={emoji}
                    type="button"
                    variant={isActive ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onToggleReaction(post.id, emoji)}
                    className="rounded-full px-3"
                  >
                    <span className="text-sm leading-none">
                      {HUB_EMOJI_LABELS[emojiIndex]}
                    </span>
                    <NumberTicker value={reactionCount} className="text-xs" />
                  </Button>
                );
              })}

              <Button
                type="button"
                variant={openComments ? "secondary" : "outline"}
                size="sm"
                onClick={() => onToggleComments(post.id)}
                className="rounded-full px-3"
              >
                <span className="text-sm leading-none">
                  {"\uD83D\uDCAC"}
                </span>
                <NumberTicker value={post.commentCount ?? 0} className="text-xs" />
                <span className="text-xs font-semibold">
                  {openComments ? "Fechar" : "Comentarios"}
                </span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <span className="rounded-full bg-[var(--color-bg-surface)] px-2.5 py-1">
                {post.commentCount ?? 0} comentarios
              </span>
              <span className="rounded-full bg-[var(--color-bg-surface)] px-2.5 py-1">
                {reactionCountTotal} reacoes
              </span>
              {post.isPinned ? (
                <Badge variant="secondary">Arquivo em destaque</Badge>
              ) : null}
            </div>
          </div>

          {openComments ? (
            <div className="mt-4">
              <CommentsSection
                comments={comments}
                draft={commentDraft}
                onDraftChange={(text) => onCommentDraftChange(post.id, text)}
                onSubmit={() => onAddComment(post.id)}
                onToggleReaction={(commentId, emoji) =>
                  onToggleCommentReaction(post.id, commentId, emoji)
                }
              />
            </div>
          ) : null}
        </div>
      </article>
    </BlurFade>
  );
}
