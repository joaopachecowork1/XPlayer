"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";

import type { HubCommentDto, HubPostDto } from "@/lib/api/types";
import { hubRepo } from "@/lib/repositories/hubRepo";

/**
 * Hook para gerir estado e ações do Feed/Hub
 *
 * Separa a lógica complexa do HubFeedModule para um hook reutilizável
 *
 * Uso:
 * ```tsx
 * const {
 *   posts,
 *   loading,
 *   comments,
 *   openComments,
 *   votePoll,
 *   toggleReaction,
 *   toggleComments,
 *   addComment,
 *   adminPin,
 *   adminDelete,
 *   refresh,
 * } = useHubFeed();
 * ```
 */
export function useHubFeed() {
  const [posts, setPosts] = useState<HubPostDto[]>([]);
  const safePosts = useMemo(() => {
    const arr = Array.isArray(posts) ? posts : [];
    return arr.filter((p): p is HubPostDto => Boolean(p?.id));
  }, [posts]);

  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, HubCommentDto[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  // Particles effect ao votar
  const [showParticles, setShowParticles] = useState<{ postId: string; x: number; y: number } | null>(null);

  /** Carregar posts */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      console.log("[useHubFeed] Loading posts...");
      const data = await hubRepo.getPosts(50);
      console.log("[useHubFeed] Posts loaded:", data?.length ?? 0);
      setPosts((data ?? []).filter(Boolean));
    } catch (e) {
      console.error("[useHubFeed] Error loading posts:", e);
      toast.error("Erro ao carregar o feed");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Toggle reaction (emoji) num post */
  const toggleReaction = useCallback(async (postId: string, emoji: string) => {
    // Optimistic UI update
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
      void load();
    }
  }, [load]);

  /** Votar numa poll */
  const votePoll = useCallback(async (postId: string, optionId: string) => {
    // Trigger particles effect
    setShowParticles({ postId, x: 50, y: 50 });

    // Optimistic update
    setPosts((prev: HubPostDto[]) => {
      return prev.map((post) => {
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
    });

    try {
      await hubRepo.votePoll(postId, optionId);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao votar");
      void load();
    }
  }, [load]);

  /** Toggle visibilidade dos comentários */
  const toggleComments = useCallback(async (postId: string) => {
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
  }, [comments]);

  /** Adicionar comentário */
  const addComment = useCallback(async (postId: string) => {
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
  }, [commentDrafts]);

  /** Toggle reação num comentário */
  const toggleCommentReaction = useCallback(async (postId: string, commentId: string, emoji: string) => {
    setComments((prev) => {
      const list = prev[postId] ?? [];
      return {
        ...prev,
        [postId]: list.map((comment) => {
          if (comment.id !== commentId) return comment;

          const mine = new Set(comment.myReactions ?? []);
          const wasActive = mine.has(emoji);
          if (wasActive) mine.delete(emoji);
          else mine.add(emoji);

          const nextCounts = { ...comment.reactionCounts };
          nextCounts[emoji] = Math.max(0, (nextCounts[emoji] ?? 0) + (wasActive ? -1 : 1));

          return {
            ...comment,
            myReactions: Array.from(mine),
            reactionCounts: nextCounts,
          };
        }),
      };
    });

    try {
      await hubRepo.toggleCommentReaction(postId, commentId, emoji);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar reação do comentário");
      try {
        const list = await hubRepo.getComments(postId);
        setComments((prev) => ({ ...prev, [postId]: (list ?? []).filter(Boolean) }));
      } catch {
        // ignore
      }
    }
  }, []);

  /** Admin: Fixar post */
  const adminPin = useCallback(async (postId: string) => {
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
  }, []);

  /** Admin: Eliminar post */
  const adminDelete = useCallback(async (postId: string) => {
    try {
      await hubRepo.adminDeletePost(postId);
      setPosts((prev: HubPostDto[]) => (prev ?? []).filter((p: HubPostDto) => p?.id !== postId));
      toast.success("Post removido");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover post");
    }
  }, []);

  /** Update draft de comentário */
  const setCommentDraft = useCallback((postId: string, text: string) => {
    setCommentDrafts((d: Record<string, string>) => ({ ...d, [postId]: text }));
  }, []);

  return {
    posts: safePosts,
    loading,
    comments,
    openComments,
    commentDrafts,
    showParticles,
    setShowParticles,
    refresh: load,
    toggleReaction,
    votePoll,
    toggleComments,
    addComment,
    toggleCommentReaction,
    adminPin,
    adminDelete,
    setCommentDraft,
  };
}
