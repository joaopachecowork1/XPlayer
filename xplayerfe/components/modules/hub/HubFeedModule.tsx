"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import type { HubCommentDto, HubPostDto } from "@/lib/api/types";
import { hubRepo } from "@/lib/repositories/hubRepo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";

import { PostComposer, type PostComposerSubmitData } from "./components/PostComposer";
import { PostHeader } from "./components/PostHeader";
import { CommentsSection } from "./components/CommentsSection";
import { MediaCarousel } from "./components/MediaCarousel";
import { PollBox } from "./components/PollBox";
import { HUB_EMOJIS, ReactionRail } from "./components/ReactionRail";

const EMOJIS = HUB_EMOJIS;

function withUpdatedPost(
  posts: HubPostDto[],
  postId: string,
  updater: (post: HubPostDto) => HubPostDto
) {
  return (posts ?? []).map((post) => {
    if (post?.id !== postId) return post;
    return updater(post);
  });
}

function sortPinnedThenRecent(posts: HubPostDto[]) {
  return [...(posts ?? [])].sort(
    (a, b) =>
      Number(Boolean(b?.isPinned)) - Number(Boolean(a?.isPinned)) ||
      (String(b?.createdAtUtc) > String(a?.createdAtUtc) ? 1 : -1)
  );
}

function reactionCount(post: HubPostDto, emoji: string) {
  return post.reactionCounts?.[emoji] ?? (emoji === "❤️" ? post.likeCount ?? 0 : 0);
}

function prependPostIfMissing(prev: HubPostDto[], created: HubPostDto) {
  const arr = Array.isArray(prev) ? prev : [];
  if (arr.some((p) => p?.id === created.id)) return arr;
  return [created, ...arr];
}

function applyOptimisticPollVote(posts: HubPostDto[], postId: string, optionId: string) {
  return posts.map((post) => {
    if (post.id !== postId || !post.poll) return post;

    const currentPoll = post.poll;
    const previousOptionId = currentPoll.myOptionId ?? null;
    if (previousOptionId === optionId) return post;

    const nextOptions = currentPoll.options.map((option) => {
      if (option.id === optionId) {
        return { ...option, voteCount: option.voteCount + 1 };
      }
      if (previousOptionId && option.id === previousOptionId) {
        return { ...option, voteCount: Math.max(0, option.voteCount - 1) };
      }
      return option;
    });

    const nextTotal = previousOptionId ? currentPoll.totalVotes : currentPoll.totalVotes + 1;
    return {
      ...post,
      poll: {
        ...currentPoll,
        options: nextOptions,
        myOptionId: optionId,
        totalVotes: nextTotal,
      },
    };
  });
}

export function HubFeedModule({
  variant = "instagram",
  showComposer = true,
}: Readonly<{
  variant?: "instagram" | "reddit" | "cards";
  /**
   * When false, hides the inline composer so outer chrome can open a bottom-sheet composer (mobile first).
   */
  showComposer?: boolean;
}>) {
  const { data: session, status } = useSession();
  const { user } = useAuth();

  // useIsAdmin() reads from AuthContext (which calls /api/me to get DB isAdmin).
  // This is correct — session?.user?.isAdmin is always false for Google OAuth
  // because NextAuth does not populate it from the JWT at sign-in time.
  const isAdmin = useIsAdmin();

  const [posts, setPosts] = useState<HubPostDto[]>([]);
  const safePosts = useMemo(() => {
    const arr = Array.isArray(posts) ? posts : [];
    // Defensive: backend/dev bugs can briefly produce null entries (e.g. optimistic insert).
    return arr.filter((p): p is HubPostDto => Boolean(p?.id));
  }, [posts]);

  const [loading, setLoading] = useState(true);

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, HubCommentDto[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  // Auto-heal old sessions that don't carry idToken (common outside incognito)
  useEffect(() => {
    const run = async () => {
      if (status === "loading") return;
      if (status === "authenticated" && !session?.idToken) {
        await signOut({ redirect: false });
        await signIn("google");
      }
    };
    void run();
  }, [status, session]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await hubRepo.getPosts(50);
      setPosts((data ?? []).filter(Boolean));
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar o feed");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // Allow outer shells (e.g. Canhões mobile bottom-sheet composer) to inject newly created posts.
  useEffect(() => {
    const handler = (evt: Event) => {
      const created = (evt as CustomEvent).detail as HubPostDto | undefined;
      if (!created?.id) return;
      setPosts((prev: HubPostDto[]) => prependPostIfMissing(prev, created));
    };

    if (globalThis.window !== undefined) {
      globalThis.window.addEventListener("hub:postCreated", handler);
      return () => globalThis.window.removeEventListener("hub:postCreated", handler);
    }
  }, []);

  const onCreate = async (data: PostComposerSubmitData) => {
    const trimmed = data.text.trim();
    if (!trimmed) return;

    try {
      let mediaUrls: string[] = [];
      if (data.files.length > 0) {
        mediaUrls = await hubRepo.uploadImages(data.files);
      }

      const pollQuestion = data.pollOn ? data.pollQuestion.trim() : "";
      const pollOptions = data.pollOn
        ? data.pollOptions.map((o) => o.trim()).filter(Boolean)
        : [];

      const created = await hubRepo.createPost({
        text: trimmed,
        mediaUrls,
        pollQuestion: data.pollOn && pollQuestion ? pollQuestion : null,
        pollOptions: data.pollOn ? pollOptions : null,
      });

      if (created?.id) {
        setPosts((p: HubPostDto[]) => [created, ...(p ?? [])]);
      } else {
        await load();
      }
      toast.success("Post publicado");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível publicar");
      throw e; // re-throw so PostComposer keeps the dialog open
    }
  };

  const toggleReaction = async (postId: string, emoji: string) => {
    // optimistic UI
    setPosts((prev: HubPostDto[]) =>
      (prev ?? []).map((p: HubPostDto) => {
        if (p?.id !== postId) return p;
        const mine = new Set(p.myReactions || []);
        const wasActive = mine.has(emoji);
        if (wasActive) mine.delete(emoji);
        else mine.add(emoji);

        const nextCounts = { ...p.reactionCounts };
        nextCounts[emoji] = Math.max(0, (nextCounts[emoji] ?? 0) + (wasActive ? -1 : 1));

        let nextLikeCount = p.likeCount ?? 0;
        if (emoji === "❤️") {
          nextLikeCount = nextLikeCount + (wasActive ? -1 : 1);
        }
        const likeCount = Math.max(0, nextLikeCount);

        return {
          ...p,
          myReactions: Array.from(mine),
          reactionCounts: nextCounts,
          likedByMe: emoji === "❤️" ? !wasActive : p.likedByMe,
          likeCount,
        };
      })
    );

    try {
      if (emoji === "❤️") {
        const r = await hubRepo.toggleLike(postId);
        // reconcile likedByMe + likeCount (server truth)
        setPosts((prev: HubPostDto[]) =>
          (prev ?? []).map((p: HubPostDto) => {
            if (p?.id !== postId) return p;
            const mine = new Set(p.myReactions || []);
            if (r.liked) mine.add("❤️");
            else mine.delete("❤️");
            return { ...p, likedByMe: r.liked, myReactions: Array.from(mine) };
          })
        );
      } else {
        await hubRepo.toggleReaction(postId, emoji);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar reação");
      void load(); // safest: reload from server
    }
  };

  const votePoll = async (postId: string, optionId: string) => {
    // optimistic update
    setPosts((prev: HubPostDto[]) => applyOptimisticPollVote(prev, postId, optionId));

    try {
      await hubRepo.votePoll(postId, optionId);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao votar");
      void load();
    }
  };

  const toggleComments = async (postId: string) => {
    setOpenComments((m: Record<string, boolean>) => ({ ...m, [postId]: !m[postId] }));
    if (!comments[postId]) {
      try {
        const list = await hubRepo.getComments(postId);
        setComments((c: Record<string, HubCommentDto[]>) => ({ ...c, [postId]: (list ?? []).filter(Boolean) }));
      } catch (e) {
        console.error(e);
        toast.error("Erro ao carregar comentários");
      }
    }
  };

  const addComment = async (postId: string) => {
    const draft = (commentDrafts[postId] ?? "").trim();
    if (!draft) return;
    try {
      const c = await hubRepo.createComment(postId, { text: draft });
      setCommentDrafts((d: Record<string, string>) => ({ ...d, [postId]: "" }));
      setComments((prev: Record<string, HubCommentDto[]>) => ({ ...prev, [postId]: [...(prev[postId] ?? []), ...(c ? [c] : [])] }));
      setPosts((prev: HubPostDto[]) =>
        (prev ?? []).map((p: HubPostDto) =>
          p?.id === postId ? { ...p, commentCount: (p.commentCount ?? 0) + 1 } : p
        )
      );
    } catch (e) {
      console.error(e);
      toast.error("Erro ao comentar");
    }
  };

  const adminPin = async (postId: string) => {
    try {
      const r = await hubRepo.adminTogglePin(postId);
      setPosts((prev: HubPostDto[]) =>
        [...(prev ?? [])]
          .map((p: HubPostDto) => (p?.id === postId ? { ...p, isPinned: r.pinned } : p))
          .sort((a: HubPostDto, b: HubPostDto) => Number(Boolean(b?.isPinned)) - Number(Boolean(a?.isPinned)) || (String(b?.createdAtUtc) > String(a?.createdAtUtc) ? 1 : -1))
      );
    } catch (e) {
      console.error(e);
      toast.error("Erro ao fixar post");
    }
  };

  const adminDelete = async (postId: string) => {
    try {
      await hubRepo.adminDeletePost(postId);
      setPosts((prev: HubPostDto[]) => (prev ?? []).filter((p: HubPostDto) => p?.id !== postId));
      toast.success("Post removido");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover post");
    }
  };

  return (
    <div className="space-y-0 sm:space-y-3">
      {/* Feed header */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 sm:px-0 sm:py-0 sm:mb-2"
      >
        <div
          className="canhoes-title text-base"
          style={{ fontSize: "16px" }}
        >
          🌿 Feed
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="canhoes-tap h-8 w-8 p-0 rounded-xl"
          onClick={() => void load()}
          disabled={loading}
          style={{ color: "rgba(0,255,68,0.60)", background: "rgba(0,255,68,0.06)", border: "1px solid rgba(0,255,68,0.12)" }}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {showComposer && <PostComposer onSubmit={onCreate} />}

      <div className="space-y-3">
        {safePosts.map((p: HubPostDto) => {
          if (!p) return null;
          const media = (p.mediaUrls ?? []).filter(Boolean);

          if (variant === "reddit") {
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border bg-background/70">
                <div className="flex">
                  <ReactionRail
                    myReactions={p.myReactions ?? []}
                    reactionCounts={p.reactionCounts}
                    likeCount={p.likeCount}
                    commentCount={p.commentCount}
                    onToggleReaction={(emoji) => void toggleReaction(p.id, emoji)}
                    onToggleComments={() => void toggleComments(p.id)}
                  />

                  <div className="min-w-0 flex-1 p-4 space-y-3">
                    <PostHeader
                      authorName={p.authorName}
                      createdAtUtc={p.createdAtUtc}
                      isPinned={p.isPinned}
                      isAdmin={isAdmin}
                      onAdminPin={() => void adminPin(p.id)}
                      onAdminDelete={() => void adminDelete(p.id)}
                    />

                    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{p.text}</div>

                    <MediaCarousel urls={media} />

                    {p.poll && (
                      <div className="mt-3">
                        <PollBox poll={p.poll} onVote={(optionId) => votePoll(p.id, optionId)} />
                      </div>
                    )}

                    {openComments[p.id] && (
                      <CommentsSection
                        comments={comments[p.id] ?? []}
                        draft={commentDrafts[p.id] ?? ""}
                        onDraftChange={(v) => setCommentDrafts((d: Record<string, string>) => ({ ...d, [p.id]: v }))}
                        onSubmit={() => void addComment(p.id)}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (variant === "instagram") {
            const counts = p.reactionCounts || {};
            return (
              // "canhao-card" visual — dark glass card with neon-green border and glow.
              // On mobile: full-bleed (no border-x). On sm+: rounded card with border.
              <div
                key={p.id}
                className="overflow-hidden rounded-none sm:rounded-2xl"
                style={{
                  background: "linear-gradient(145deg, #0f2018, #0a1510)",
                  border: "0px solid transparent",
                  borderTop: "1px solid rgba(0,255,68,0.12)",
                  borderBottom: "1px solid rgba(0,255,68,0.08)",
                }}
              >
                <div
                  className="sm:rounded-2xl sm:m-0"
                  style={{
                    borderRadius: "inherit",
                    boxShadow: "0 0 0 1px rgba(0,255,68,0.10), 0 0 20px rgba(0,170,51,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Post header — isPinned not passed here; handled below in reaction bar */}
                  <div className="px-3 pt-3 pb-2.5 sm:p-4">
                    <PostHeader
                      authorName={p.authorName}
                      createdAtUtc={p.createdAtUtc}
                      isAdmin={isAdmin}
                      onAdminPin={() => void adminPin(p.id)}
                      onAdminDelete={() => void adminDelete(p.id)}
                    />
                    {!!p.text && (
                      <div
                        className="mt-2.5 whitespace-pre-wrap break-words text-[13px] sm:text-sm leading-relaxed"
                        style={{ color: "#d0f0d0", fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}
                      >
                        {p.text}
                      </div>
                    )}
                  </div>

                  {media.length > 0 && (
                    <div className="px-0 sm:px-4 pb-2.5 sm:pb-3">
                      <MediaCarousel urls={media} />
                    </div>
                  )}

                  {p.poll && (
                    <div className={`px-3 sm:px-4 pb-2.5 sm:pb-3 ${media.length > 0 ? "pt-0" : ""}`}>
                      <PollBox poll={p.poll} onVote={(optionId) => votePoll(p.id, optionId)} />
                    </div>
                  )}

                  <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pr-1">
                        {EMOJIS.map((emoji) => {
                          const active = (p.myReactions ?? []).includes(emoji);
                          const count = counts[emoji] ?? reactionCount(p, emoji);
                          return (
                            <Button
                              key={emoji}
                              variant={active ? "default" : "outline"}
                              size="sm"
                              onClick={() => void toggleReaction(p.id, emoji)}
                              className="canhoes-tap h-8 gap-1.5 rounded-full px-2.5 shrink-0"
                              style={active ? {
                                background: "linear-gradient(90deg, #00cc44, #008833)",
                                border: "1.5px solid rgba(0,255,68,0.40)",
                                color: "white",
                              } : {
                                background: "rgba(0,20,10,0.6)",
                                border: "1px solid rgba(0,255,68,0.18)",
                                color: "rgba(0,255,68,0.80)",
                              }}
                            >
                              <span className="text-sm leading-none">{emoji}</span>
                              <span className="tabular-nums text-xs">{count}</span>
                            </Button>
                          );
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void toggleComments(p.id)}
                          className="canhoes-tap h-8 gap-1.5 rounded-full px-2.5 shrink-0"
                          style={{
                            background: "rgba(0,20,10,0.6)",
                            border: "1px solid rgba(0,255,68,0.18)",
                            color: "rgba(0,255,68,0.80)",
                          }}
                        >
                          <span className="text-sm leading-none">💬</span>
                          <span className="tabular-nums text-xs">{p.commentCount ?? 0}</span>
                        </Button>
                      </div>

                      {p.isPinned && (
                        <Badge
                          variant="secondary"
                          style={{
                            background: "rgba(255,225,53,0.10)",
                            border: "1px solid rgba(255,225,53,0.35)",
                            color: "#ffe135",
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 700,
                            fontSize: "11px",
                          }}
                        >
                          📌 Fixado
                        </Badge>
                      )}
                    </div>

                    {openComments[p.id] && (
                      <div className="mt-4">
                        <CommentsSection
                          comments={comments[p.id] ?? []}
                          draft={commentDrafts[p.id] ?? ""}
                          onDraftChange={(v) => setCommentDrafts((d: Record<string, string>) => ({ ...d, [p.id]: v }))}
                          onSubmit={() => void addComment(p.id)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // "cards" variant
          return (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <PostHeader
                      authorName={p.authorName}
                      createdAtUtc={p.createdAtUtc}
                      isPinned={p.isPinned}
                      isAdmin={isAdmin}
                      onAdminPin={() => void adminPin(p.id)}
                      onAdminDelete={() => void adminDelete(p.id)}
                    />
                  </div>
                  {p.isPinned && <Badge variant="secondary">Fixado</Badge>}
                </div>

                <div className="whitespace-pre-wrap break-words">{p.text}</div>

                {media.length > 0 && <MediaCarousel urls={media} />}

                {p.poll && (
                  <div className="mt-3">
                    <PollBox poll={p.poll} onVote={(optionId) => votePoll(p.id, optionId)} />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {EMOJIS.map((emoji) => {
                    const active = (p.myReactions ?? []).includes(emoji);
                    const count = reactionCount(p, emoji);
                    return (
                      <Button
                        key={emoji}
                        variant={active ? "default" : "outline"}
                        size="sm"
                        onClick={() => void toggleReaction(p.id, emoji)}
                        className="gap-2"
                      >
                        <span className="text-base leading-none">{emoji}</span>
                        {count}
                      </Button>
                    );
                  })}
                  <Button variant="outline" size="sm" onClick={() => void toggleComments(p.id)} className="gap-2">
                    💬 {p.commentCount ?? 0}
                  </Button>
                </div>

                {openComments[p.id] && (
                  <CommentsSection
                    comments={comments[p.id] ?? []}
                    draft={commentDrafts[p.id] ?? ""}
                    onDraftChange={(v) => setCommentDrafts((d) => ({ ...d, [p.id]: v }))}
                    onSubmit={() => void addComment(p.id)}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}

        {!loading && safePosts.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8">Sem posts ainda.</div>
        )}
      </div>
    </div>
  );
}
