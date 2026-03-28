"use client";

import { useEffect, type ReactNode } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Camera, Pin, RefreshCw, ScrollText, Vote } from "lucide-react";
import { toast } from "sonner";

import { Particles } from "@/components/animations/Particles";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { Button } from "@/components/ui/button";
import { useHubFeed } from "@/hooks/useHubFeed";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";
import { cn } from "@/lib/utils";

import { HubPostCard } from "./HubPostCard";
import {
  PostComposer,
  type PostComposerSubmitData,
} from "./components/PostComposer";

function FeedInsightCard({
  label,
  value,
  description,
  icon,
}: Readonly<{
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
}>) {
  return (
    <section className="editorial-shell rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="editorial-kicker">{label}</p>
            <p className="heading-2 text-[var(--color-text-primary)]">{value}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-moss)]/20 bg-[var(--color-bg-surface)] text-[var(--color-title)]">
            {icon}
          </span>
        </div>

        <p className="body-small text-[var(--color-text-muted)]">{description}</p>
      </div>
    </section>
  );
}

export function HubFeedModule({
  showComposer = true,
}: Readonly<{
  showComposer?: boolean;
}>) {
  const { data: session, status } = useSession();
  const isAdmin = useIsAdmin();

  const {
    posts,
    loading,
    comments,
    openComments,
    commentDrafts,
    showParticles,
    setShowParticles,
    refresh,
    toggleReaction,
    votePoll,
    toggleComments,
    addComment,
    setCommentDraft,
    toggleCommentReaction,
    adminPin,
    adminDelete,
  } = useHubFeed();

  useEffect(() => {
    if (status === "authenticated" && !session?.idToken) {
      void signOut({ redirect: false }).then(() => signIn("google"));
    }
  }, [session?.idToken, status]);

  const handleCreatePost = async (data: PostComposerSubmitData) => {
    const trimmedText = data.text.trim();
    if (!trimmedText) return;

    try {
      let mediaUrls: string[] = [];
      if (data.files.length > 0) {
        const { hubRepo } = await import("@/lib/repositories/hubRepo");
        mediaUrls = await hubRepo.uploadImages(data.files);
      }

      const { hubRepo } = await import("@/lib/repositories/hubRepo");
      const pollQuestion = data.pollOn ? data.pollQuestion.trim() : "";
      const pollOptions = data.pollOn
        ? data.pollOptions.map((option) => option.trim()).filter(Boolean)
        : [];

      const createdPost = await hubRepo.createPost({
        text: trimmedText,
        mediaUrls,
        pollQuestion: data.pollOn && pollQuestion ? pollQuestion : null,
        pollOptions: data.pollOn ? pollOptions : null,
      });

      if (createdPost?.id && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("hub:postCreated", { detail: createdPost })
        );
      }

      toast.success("Post publicado");
    } catch (error) {
      console.error(error);
      toast.error("Nao foi possivel publicar");
      throw error;
    }
  };

  const pinnedPostCount = posts.filter((post) => post.isPinned).length;
  const postsWithMediaCount = posts.filter(
    (post) => (post.mediaUrls ?? []).length > 0
  ).length;
  const postsWithPollCount = posts.filter((post) => Boolean(post.poll)).length;

  return (
    <div className="space-y-4 xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-5 xl:space-y-0">
      <div className="space-y-4">
        <section className="page-hero px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--color-title)]">
                <ScrollText className="h-4 w-4" />
                <span className="editorial-kicker">Feed</span>
              </div>
              <div className="space-y-1">
                <h2 className="heading-2 text-[var(--color-title-dark)]">
                  Cronica do evento
                </h2>
                <p className="body-small max-w-2xl text-[var(--color-text-muted)]">
                  O feed mistura tom editorial e ritmo de produto: cards
                  respiraveis, media consistente e interacoes com area de toque
                  real para funcionar bem em telemovel.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 self-start"
              onClick={() => void refresh()}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Atualizar
            </Button>
          </div>
        </section>

        {showComposer ? <PostComposer onSubmit={handleCreatePost} /> : null}

        {loading ? <FeedSkeleton count={3} /> : null}

        {!loading ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <HubPostCard
                key={post.id}
                post={post}
                index={index}
                isAdmin={isAdmin}
                openComments={openComments[post.id] ?? false}
                commentDraft={commentDrafts[post.id] ?? ""}
                comments={comments[post.id] ?? []}
                onToggleReaction={toggleReaction}
                onToggleComments={toggleComments}
                onVotePoll={votePoll}
                onAddComment={addComment}
                onCommentDraftChange={setCommentDraft}
                onToggleCommentReaction={toggleCommentReaction}
                onAdminPin={adminPin}
                onAdminDelete={adminDelete}
              />
            ))}

            {posts.length === 0 ? (
              <section className="editorial-shell rounded-[var(--radius-lg-token)] px-4 py-10 text-center sm:px-5">
                <p className="editorial-kicker">Ainda vazio</p>
                <h3 className="heading-3 mt-2 text-[var(--color-text-primary)]">
                  O arquivo deste ano ainda nao tem publicacoes
                </h3>
                <p className="body-small mt-2 text-[var(--color-text-muted)]">
                  Publica o primeiro post para abrir o feed do grupo.
                </p>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <FeedInsightCard
          label="Arquivo"
          value={posts.length}
          description="Numero total de publicacoes disponiveis no feed deste evento."
          icon={<ScrollText className="h-4 w-4" />}
        />
        <FeedInsightCard
          label="Momentos visuais"
          value={postsWithMediaCount}
          description="Posts com fotografias ou imagens que ajudam a dar ritmo ao feed."
          icon={<Camera className="h-4 w-4" />}
        />
        <FeedInsightCard
          label="Votacoes"
          value={postsWithPollCount}
          description="Blocos com participacao direta para dinamizar semanas mortas."
          icon={<Vote className="h-4 w-4" />}
        />
        <FeedInsightCard
          label="Destaques"
          value={pinnedPostCount}
          description="Posts fixados pelos admins para manter contexto editorial no topo."
          icon={<Pin className="h-4 w-4" />}
        />
      </aside>

      {showParticles ? (
        <Particles
          count={24}
          onComplete={() => setShowParticles(null)}
          className="pointer-events-none fixed inset-0 z-50"
        />
      ) : null}
    </div>
  );
}
