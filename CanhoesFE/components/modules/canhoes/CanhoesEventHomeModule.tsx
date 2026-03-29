"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gift,
  Loader2,
  MessageSquare,
  Sparkles,
  Vote,
} from "lucide-react";

import type {
  EventFeedPostDto,
  EventOverviewDto,
  EventSecretSantaOverviewDto,
  EventSummaryDto,
  EventVotingOverviewDto,
} from "@/lib/api/types";
import {
  formatPhaseWindow,
  getPhaseLabel,
  getPhaseSummary,
  openComposeSheet,
} from "@/lib/canhoesEvent";
import { IS_LOCAL_MODE } from "@/lib/mock";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HomeState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      event: EventSummaryDto;
      overview: EventOverviewDto;
      secretSanta: EventSecretSantaOverviewDto;
      voting: EventVotingOverviewDto;
      recentPosts: EventFeedPostDto[];
    };

type ActionLink = {
  href?: string;
  label: string;
  onClick?: () => void;
  tone?: "default" | "outline" | "secondary";
};

async function loadHomeState(): Promise<HomeState> {
  const events = await canhoesEventsRepo.listEvents();
  const activeEvent = events.find((event) => event.isActive) ?? events[0];

  if (!activeEvent) {
    return { status: "error" };
  }

  const [overview, secretSanta, voting, feedPosts] = await Promise.all([
    canhoesEventsRepo.getEventOverview(activeEvent.id),
    canhoesEventsRepo.getSecretSantaOverview(activeEvent.id),
    canhoesEventsRepo.getVotingOverview(activeEvent.id),
    canhoesEventsRepo.getFeedPosts(activeEvent.id),
  ]);

  return {
    status: "ready",
    event: activeEvent,
    overview,
    secretSanta,
    voting,
    recentPosts: feedPosts.slice(0, 3),
  };
}

export function CanhoesEventHomeModule() {
  const [homeState, setHomeState] = useState<HomeState>({ status: "loading" });

  useEffect(() => {
    let isCancelled = false;

    async function hydrateHome() {
      try {
        // The home is the event dashboard. It preloads the small overview
        // endpoints together so the first screen can answer "what now?".
        const nextHomeState = await loadHomeState();
        if (!isCancelled) setHomeState(nextHomeState);
      } catch {
        if (!isCancelled) setHomeState({ status: "error" });
      }
    }

    void hydrateHome();
    return () => {
      isCancelled = true;
    };
  }, []);

  // This block translates raw overview data into the current "do this now"
  // copy shown at the top of the event dashboard.
  const homeCopy = useMemo(() => {
    if (homeState.status !== "ready") return null;

    const { overview, secretSanta, voting } = homeState;
    const phaseType = overview.activePhase?.type;

    const primaryAction: ActionLink = (() => {
      switch (phaseType) {
        case "DRAW":
          if (secretSanta.hasAssignment) {
            return { href: "/canhoes/amigo-secreto", label: "Ver amigo secreto" };
          }
          if (overview.permissions.canManage && !secretSanta.hasDraw) {
            return { href: "/canhoes/admin", label: "Abrir sorteio" };
          }
          return { href: "/canhoes/wishlist", label: "Ver wishlists" };
        case "PROPOSALS":
          return {
            href: "/canhoes/categorias",
            label: overview.permissions.canSubmitProposal ? "Enviar proposta" : "Ver categorias",
          };
        case "VOTING":
          return {
            href: "/canhoes/votacao",
            label: voting.remainingVoteCount > 0 ? "Votar agora" : "Rever votacao",
          };
        case "RESULTS":
          return {
            href: IS_LOCAL_MODE ? "/canhoes/categorias" : "/canhoes/gala",
            label: IS_LOCAL_MODE ? "Ver ranking" : "Abrir gala",
          };
        default:
          return { href: "/canhoes/categorias", label: "Explorar evento" };
      }
    })();

    const secondaryAction: ActionLink =
      phaseType === "DRAW"
        ? { href: "/canhoes/wishlist", label: "Abrir wishlist", tone: "outline" }
        : { label: "Criar post", onClick: openComposeSheet, tone: "outline" };

    const alerts = [
      !secretSanta.hasDraw
        ? "O sorteio ainda não foi gerado para este ciclo."
        : null,
      secretSanta.hasDraw && !secretSanta.hasAssignment
        ? "Já existe sorteio, mas ainda não tens atribuição disponível."
        : null,
      overview.permissions.canSubmitProposal && overview.myProposalCount === 0
        ? "Ainda não submeteste nenhuma proposta nesta fase."
        : null,
      voting.remainingVoteCount > 0
        ? `Faltam ${voting.remainingVoteCount} categorias por votar.`
        : null,
      secretSanta.myWishlistItemCount === 0
        ? "A tua wishlist ainda está vazia. Dá pistas antes do sorteio fechar."
        : null,
    ].filter(Boolean) as string[];

    return { alerts, primaryAction, secondaryAction };
  }, [homeState]);

  if (homeState.status === "loading") {
    return (
      <div className="space-y-4">
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
          <CardContent className="flex min-h-[16rem] items-center justify-center">
            <div className="flex items-center gap-3 text-[var(--beige)]/76">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--neon-green)]" />
              <span className="font-[var(--font-mono)] text-sm uppercase tracking-[0.16em]">
                A preparar contexto do evento
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (homeState.status === "error" || !homeCopy) {
    return (
      <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
        <CardContent className="space-y-3 py-8 text-center">
          <p className="heading-3 text-[var(--text-primary)]">Não foi possível montar a home do evento.</p>
          <p className="body-small text-[var(--beige)]/76">
            O feed continua disponível, mas falta contexto para perceber a fase atual.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Tentar outra vez</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { event, overview, recentPosts, secretSanta, voting } = homeState;
  const phaseLabel = getPhaseLabel(overview.activePhase?.type);
  const phaseSummary = getPhaseSummary(overview.activePhase?.type);
  const phaseDeadline = formatPhaseWindow(overview.activePhase);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[var(--radius-lg-token)] border border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
        <div className="space-y-4 px-4 py-5 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--border-neon)]/60 bg-[var(--accent)] text-[var(--neon-green)]">
              {phaseLabel}
            </Badge>
            {overview.nextPhase ? (
              <Badge variant="outline" className="border-[var(--border-subtle)] bg-transparent text-[var(--beige)]">
                Próxima: {getPhaseLabel(overview.nextPhase.type)}
              </Badge>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[var(--beige)]/68">
              {event.name}
            </p>
            <h1 className="heading-1 text-[var(--text-primary)] [text-shadow:var(--glow-green-sm)]">
              O que deves fazer agora?
            </h1>
            <p className="body-base max-w-3xl text-[var(--beige)]/82">{phaseSummary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Votos fechados"
              value={`${voting.submittedVoteCount}/${voting.categoryCount}`}
              hint={voting.categoryCount > 0 ? `${voting.remainingVoteCount} por fechar` : "Sem categorias abertas"}
            />
            <MetricCard
              label="A tua wishlist"
              value={String(secretSanta.myWishlistItemCount)}
              hint={secretSanta.hasAssignment ? "Ligada ao amigo secreto" : "Prepara antes do draw"}
            />
            <MetricCard
              label="Feed recente"
              value={String(overview.counts.feedPostCount)}
              hint="Posts já publicados neste ciclo"
            />
            <MetricCard
              label="Membros"
              value={String(overview.counts.memberCount)}
              hint={`${overview.counts.pendingProposalCount} pendentes`}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ActionButton action={homeCopy.primaryAction} />
            <ActionButton action={homeCopy.secondaryAction} />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border-subtle)] pt-4 text-sm text-[var(--beige)]/76">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[var(--neon-cyan)]" />
              {phaseDeadline ? `Fecha a ${phaseDeadline}` : "Sem prazo definido"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--neon-green)]" />
              {overview.permissions.canManage ? "Tens permissões de gestão." : "Fluxo principal de membro."}
            </span>
          </div>
        </div>
      </section>

      {homeCopy.alerts.length > 0 ? (
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
              <Clock3 className="h-4 w-4 text-[var(--neon-amber)]" />
              Alertas do momento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {homeCopy.alerts.map((alert) => (
              <div
                key={alert}
                className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 py-3 text-sm text-[var(--beige)]/82"
              >
                {alert}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[var(--fire)]" />
              Feed recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length === 0 ? (
              <div className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-4 text-sm text-[var(--text-muted)]">
                Ainda não existem posts neste evento.
              </div>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="canhoes-list-item space-y-2 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {post.userName}
                    </p>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(post.createdAt).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-[var(--text-primary)]">{post.content}</p>
                </div>
              ))
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={openComposeSheet}>
                Publicar no feed
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-[var(--fire)]" />
                Amigo secreto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {secretSanta.hasAssignment && secretSanta.assignedUser ? (
                <div className="canhoes-list-item space-y-2 px-3 py-3">
                  <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Pessoa atribuída
                  </p>
                  <p className="text-base font-semibold text-[var(--text-primary)]">
                    {secretSanta.assignedUser.name}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {secretSanta.assignedWishlistItemCount} itens na wishlist.
                  </p>
                </div>
              ) : (
                <div className="canhoes-list-item space-y-2 px-3 py-3">
                  <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Estado
                  </p>
                  <p className="text-sm text-[var(--text-primary)]">
                    {secretSanta.hasDraw
                      ? "O sorteio existe mas ainda não tens atribuição disponível."
                      : "Ainda não existe sorteio gerado."}
                  </p>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" asChild>
                  <Link href="/canhoes/amigo-secreto">Abrir sorteio</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/canhoes/wishlist">Gerir wishlist</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-4 w-4 text-[var(--fire)]" />
                Checklist desta fase
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ChecklistItem
                done={secretSanta.myWishlistItemCount > 0}
                label="Tens wishlist preenchida"
              />
              <ChecklistItem
                done={overview.myProposalCount > 0 || !overview.permissions.canSubmitProposal}
                label="Estado das tuas propostas"
                hint={
                  overview.permissions.canSubmitProposal
                    ? `${overview.myProposalCount} propostas feitas`
                    : "Sem propostas abertas nesta fase"
                }
              />
              <ChecklistItem
                done={voting.remainingVoteCount === 0}
                label="Votação deste ciclo"
                hint={
                  voting.categoryCount > 0
                    ? `${voting.submittedVoteCount} / ${voting.categoryCount} categorias`
                    : "Sem votações abertas"
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  hint,
  label,
  value,
}: Readonly<{
  hint: string;
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-3">
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--beige)]/62">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--beige)]/72">{hint}</p>
    </div>
  );
}

function ActionButton({ action }: Readonly<{ action: ActionLink }>) {
  if (action.href) {
    return (
      <Button variant={action.tone ?? "default"} asChild>
        <Link href={action.href}>
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button variant={action.tone ?? "default"} onClick={action.onClick}>
      {action.label}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

function ChecklistItem({
  done,
  hint,
  label,
}: Readonly<{
  done: boolean;
  hint?: string;
  label: string;
}>) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-3">
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
          done
            ? "border-[var(--border-neon)]/40 bg-[var(--accent)] text-[var(--success)]"
            : "border-[var(--border-moss)] bg-[var(--bg-void)] text-[var(--neon-amber)]"
        }`}
      >
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--text-primary)]">
          {label}
        </span>
        {hint ? (
          <span className="mt-1 block text-xs text-[var(--text-muted)]">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}
