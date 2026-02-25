"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

import type { HubCommentDto, HubPostDto } from "@/lib/api/types";
import { hubRepo } from "@/lib/repositories/hubRepo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { PostComposer } from "./components/PostComposer";
import { PostHeader } from "./components/PostHeader";
import { CommentsSection } from "./components/CommentsSection";
import { MediaCarousel } from "./components/MediaCarousel";
import { PollBox } from "./components/PollBox";
import { HUB_EMOJIS, ReactionRail } from "./components/ReactionRail";

const EMOJIS = HUB_EMOJIS;

export function HubFeedModule({
  variant = "instagram",
  showComposer = true,
}: {
  variant?: "instagram" | "reddit" | "cards";
  /**
   * When false, hides the inline composer so outer chrome can open a bottom-sheet composer (mobile first).
   */
  showComposer?: boolean;
}) {
  const { data: session, status } = useSession();

  // NOTE: isAdmin is also enforced server-side; this only toggles UI affordances.
  const isAdmin = useMemo(() => Boolean((session as any)?.user?.isAdmin), [session]);

  const [posts, setPosts] = useState<HubPostDto[]>([]);
  const safePosts = useMemo(() => {
    const arr = Array.isArray(posts) ? posts : [];
    // Defensive: backend/dev bugs can briefly produce null entries (e.g. optimistic insert).
    return arr.filter((p): p is HubPostDto => Boolean(p && (p as any).id));
  }, [posts]);

  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [pollOn, setPollOn] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, HubCommentDto[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  // Auto-heal old sessions that don't carry idToken (common outside incognito)
  useEffect(() => {
    const run = async () => {
      if (status === "loading") return;
      if (status === "authenticated" && !(session as any)?.idToken) {
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
      if (!created || !(created as any).id) return;
      setPosts((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        // De-dupe by id (in case the feed reloaded).
        if (arr.some((p) => p?.id === created.id)) return arr;
        return [created, ...arr];
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("hub:postCreated", handler as any);
      return () => window.removeEventListener("hub:postCreated", handler as any);
    }
  }, []);

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).slice(0, 10);
    setFiles(arr);
  };

  const onCreate = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      let mediaUrls: string[] = [];
      if (files.length > 0) {
        mediaUrls = await hubRepo.uploadImages(files);
      }

      const normalizedPollQuestion = pollOn ? pollQuestion.trim() : "";
      const normalizedPollOptions = pollOn
        ? pollOptions.map((o) => o.trim()).filter(Boolean)
        : [];

      const created = await hubRepo.createPost({
        text: trimmed,
        mediaUrls,
        pollQuestion: pollOn && normalizedPollQuestion ? normalizedPollQuestion : null,
        pollOptions: pollOn ? normalizedPollOptions : null,
      });

      setText("");
      setFiles([]);
      setPollOn(false);
      setPollQuestion("");
      setPollOptions(["", ""]);

      // Be defensive: if the backend returns null/invalid, don't poison the list
      if (created && (created as any).id) {
        setPosts((p) => [created, ...(p ?? [])]);
      } else {
        await load();
      }
      toast.success("Post publicado");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível publicar");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReaction = async (postId: string, emoji: string) => {
    // optimistic UI
    setPosts((prev) =>
      (prev ?? []).map((p) => {
        if (!p || p.id !== postId) return p;
        const mine = new Set(p.myReactions || []);
        const wasActive = mine.has(emoji);
        if (wasActive) mine.delete(emoji);
        else mine.add(emoji);

        const nextCounts = { ...(p.reactionCounts || {}) };
        nextCounts[emoji] = Math.max(0, (nextCounts[emoji] ?? 0) + (wasActive ? -1 : 1));

        const likeCount = Math.max(
          0,
          emoji === "❤️" ? (p.likeCount ?? 0) + (wasActive ? -1 : 1) : p.likeCount ?? 0
        );

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
        setPosts((prev) =>
          (prev ?? []).map((p) => {
            if (!p || p.id !== postId) return p;
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
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.poll) return p;
        const cur = p.poll;
        const prevOpt = cur.myOptionId ?? null;
        if (prevOpt === optionId) return p;

        const nextOptions = cur.options.map((o) => {
          if (o.id === optionId) return { ...o, voteCount: o.voteCount + 1 };
          if (prevOpt && o.id === prevOpt) return { ...o, voteCount: Math.max(0, o.voteCount - 1) };
          return o;
        });

        const nextTotal = prevOpt ? cur.totalVotes : cur.totalVotes + 1;
        return { ...p, poll: { ...cur, options: nextOptions, myOptionId: optionId, totalVotes: nextTotal } };
      })
    );

    try {
      await hubRepo.votePoll(postId, optionId);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao votar");
      load();
    }
  };

  const toggleComments = async (postId: string) => {
    setOpenComments((m) => ({ ...m, [postId]: !m[postId] }));
    if (!comments[postId]) {
      try {
        const list = await hubRepo.getComments(postId);
        setComments((c) => ({ ...c, [postId]: (list ?? []).filter(Boolean) }));
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
      setCommentDrafts((d) => ({ ...d, [postId]: "" }));
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), ...(c ? [c] : [])] }));
      setPosts((prev) =>
        (prev ?? []).map((p) =>
          p && p.id === postId ? { ...p, commentCount: (p.commentCount ?? 0) + 1 } : p
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
      setPosts((prev) =>
        [...(prev ?? [])]
          .map((p) => (p && p.id === postId ? { ...p, isPinned: r.pinned } : p))
          .sort((a, b) => Number(Boolean(b?.isPinned)) - Number(Boolean(a?.isPinned)) || (String(b?.createdAtUtc) > String(a?.createdAtUtc) ? 1 : -1))
      );
    } catch (e) {
      console.error(e);
      toast.error("Erro ao fixar post");
    }
  };

  const adminDelete = async (postId: string) => {
    try {
      await hubRepo.adminDeletePost(postId);
      setPosts((prev) => (prev ?? []).filter((p) => p?.id !== postId));
      toast.success("Post removido");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover post");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-semibold">Feed</div>
        <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {showComposer && (
        <PostComposer
          text={text}
          onTextChange={setText}
          files={files}
          onPickFiles={onPickFiles}
          pollOn={pollOn}
          onPollOnChange={setPollOn}
          pollQuestion={pollQuestion}
          onPollQuestionChange={setPollQuestion}
          pollOptions={pollOptions}
          onPollOptionChange={(idx, v) =>
            setPollOptions((prev) => prev.map((x, i) => (i === idx ? v : x)))
          }
          onAddPollOption={() =>
            setPollOptions((prev) => (prev.length >= 6 ? prev : [...prev, ""]))
          }
          onRemovePollOption={(idx) =>
            setPollOptions((prev) => prev.filter((_, i) => i !== idx))
          }
          onSubmit={onCreate}
          submitting={submitting}
        />
      )}

      <div className="space-y-4">
        {safePosts.map((p) => {
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
                        onDraftChange={(v) => setCommentDrafts((d) => ({ ...d, [p.id]: v }))}
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
              <Card key={p.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <PostHeader
                      authorName={p.authorName}
                      createdAtUtc={p.createdAtUtc}
                      isPinned={p.isPinned}
                      isAdmin={isAdmin}
                      onAdminPin={() => void adminPin(p.id)}
                      onAdminDelete={() => void adminDelete(p.id)}
                    />
                    {!!p.text && <div className="mt-3 whitespace-pre-wrap break-words text-sm">{p.text}</div>}
                  </div>

                  {media.length > 0 && (
                    <div className="px-4 pb-3">
                      <MediaCarousel urls={media} />

                      {p.poll && (
                        <div className="mt-3">
                          <PollBox poll={p.poll} onVote={(optionId) => votePoll(p.id, optionId)} />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {EMOJIS.map((emoji) => {
                          const active = (p.myReactions ?? []).includes(emoji);
                          const count = counts[emoji] ?? (emoji === "❤️" ? p.likeCount ?? 0 : 0);
                          return (
                            <Button
                              key={emoji}
                              variant={active ? "default" : "outline"}
                              size="sm"
                              onClick={() => void toggleReaction(p.id, emoji)}
                              className="gap-2"
                            >
                              <span className="text-base leading-none">{emoji}</span>
                              <span className="tabular-nums">{count}</span>
                            </Button>
                          );
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void toggleComments(p.id)}
                          className="gap-2"
                        >
                          💬 <span className="tabular-nums">{p.commentCount ?? 0}</span>
                        </Button>
                      </div>

                      {p.isPinned && <Badge variant="secondary">Fixado</Badge>}
                    </div>

                    {openComments[p.id] && (
                      <div className="mt-4">
                        <CommentsSection
                          comments={comments[p.id] ?? []}
                          draft={commentDrafts[p.id] ?? ""}
                          onDraftChange={(v) => setCommentDrafts((d) => ({ ...d, [p.id]: v }))}
                          onSubmit={() => void addComment(p.id)}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
                    const count = p.reactionCounts?.[emoji] ?? (emoji === "❤️" ? p.likeCount ?? 0 : 0);
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
