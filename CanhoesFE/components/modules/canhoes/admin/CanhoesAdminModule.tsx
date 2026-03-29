"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";

import type {
  AwardCategoryDto,
  CanhoesStateDto,
  CategoryProposalDto,
  MeasureProposalDto,
  NomineeDto,
  PublicUserDto,
} from "@/lib/api/types";

import { AdminDashboard } from "./components/AdminDashboard";
import { CategoriesAdmin } from "./components/CategoriesAdmin";
import { EventStateCard } from "./components/EventStateCard";
import { NomineesAdmin } from "./components/NomineesAdmin";
import { PendingProposals } from "./components/PendingProposals";
import { UsersAdmin } from "./components/UsersAdmin";
import { VotesAudit } from "./components/VotesAudit";

type VoteAuditRow = {
  categoryId: string;
  nomineeId: string;
  userId: string;
  updatedAtUtc: string;
};

type ProposalsPayload<T> =
  | T[]
  | {
      pending?: T[];
      approved?: T[];
      rejected?: T[];
    }
  | null
  | undefined;

function normalizeProposals<T>(payload: ProposalsPayload<T>): T[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const grouped = payload as { pending?: T[]; approved?: T[]; rejected?: T[] };
  return [
    ...(Array.isArray(grouped.pending) ? grouped.pending : []),
    ...(Array.isArray(grouped.approved) ? grouped.approved : []),
    ...(Array.isArray(grouped.rejected) ? grouped.rejected : []),
  ];
}

const EMPTY_PENDING = {
  nominees: [],
  categoryProposals: [],
  measureProposals: [],
};
const EMPTY_HISTORY = { categoryProposals: [], measureProposals: [] };
const EMPTY_VOTES = { votes: [] };
const EMPTY_MEASURES: MeasureProposalDto[] = [];

const safe = async <T,>(promise: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await promise;
  } catch {
    return fallback;
  }
};

export default function CanhoesAdminModule() {
  const [state, setState] = useState<CanhoesStateDto | null>(null);
  const [categories, setCategories] = useState<AwardCategoryDto[]>([]);
  const [allNominees, setAllNominees] = useState<NomineeDto[]>([]);
  const [pendingNominees, setPendingNominees] = useState<NomineeDto[]>([]);
  const [pendingCategoryProposals, setPendingCategoryProposals] = useState<
    CategoryProposalDto[]
  >([]);
  const [pendingMeasureProposals, setPendingMeasureProposals] = useState<
    MeasureProposalDto[]
  >([]);
  const [votes, setVotes] = useState<VoteAuditRow[]>([]);
  const [allCategoryProposals, setAllCategoryProposals] = useState<
    CategoryProposalDto[]
  >([]);
  const [allMeasureProposals, setAllMeasureProposals] = useState<
    MeasureProposalDto[]
  >([]);
  const [members, setMembers] = useState<PublicUserDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        nextState,
        nextCategories,
        pendingPayload,
        nextNominees,
        votesPayload,
        historyPayload,
        measuresPayload,
        membersPayload,
      ] = await Promise.all([
        safe<CanhoesStateDto | null>(canhoesRepo.getState(), null),
        safe<AwardCategoryDto[]>(canhoesRepo.adminGetAllCategories(), []),
        safe<{
          nominees: NomineeDto[];
          categoryProposals: CategoryProposalDto[];
          measureProposals: MeasureProposalDto[];
        }>(canhoesRepo.adminPending(), EMPTY_PENDING),
        safe<NomineeDto[]>(canhoesRepo.adminGetAllNominees(), []),
        safe<{ votes: VoteAuditRow[] }>(canhoesRepo.adminVotes(), EMPTY_VOTES),
        safe<{
          categoryProposals: ProposalsPayload<CategoryProposalDto>;
          measureProposals: ProposalsPayload<MeasureProposalDto>;
        }>(canhoesRepo.adminProposalsHistory(), EMPTY_HISTORY),
        safe<MeasureProposalDto[]>(
          canhoesRepo.adminListMeasureProposals(),
          EMPTY_MEASURES
        ),
        safe<PublicUserDto[]>(canhoesRepo.getMembers(), []),
      ]);

      setState(nextState);
      setCategories(nextCategories);
      setAllNominees(nextNominees);
      setPendingNominees(pendingPayload.nominees ?? []);
      setPendingCategoryProposals(pendingPayload.categoryProposals ?? []);
      setPendingMeasureProposals(
        (pendingPayload.measureProposals ?? []).filter(
          (proposal) => proposal.status === "pending"
        )
      );
      setVotes(votesPayload.votes ?? []);
      setAllCategoryProposals(
        normalizeProposals(historyPayload.categoryProposals)
      );
      setMembers(membersPayload ?? []);

      const fallbackMeasures = Array.isArray(historyPayload.measureProposals)
        ? (historyPayload.measureProposals as MeasureProposalDto[])
        : normalizeProposals(historyPayload.measureProposals);

      setAllMeasureProposals(
        (measuresPayload?.length ?? 0) > 0 ? measuresPayload : fallbackMeasures
      );
    } catch (error) {
      console.error("Admin load error:", error);
      toast.error("Erro ao carregar dados do admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const pendingReviewCount =
    pendingNominees.length +
    pendingCategoryProposals.length +
    pendingMeasureProposals.length;

  const adminTabs = [
    { value: "dashboard", label: "Painel", count: 0 },
    { value: "nominees", label: "Nomeacoes", count: pendingNominees.length },
    { value: "pending", label: "Propostas", count: pendingReviewCount },
    { value: "state", label: "Estado", count: 0 },
    { value: "categories", label: "Categorias", count: 0 },
    { value: "users", label: "Membros", count: 0 },
    { value: "audit", label: "Auditoria", count: votes.length },
  ] as const;

  const overviewItems = useMemo(
    () => [
      { label: "Categorias", value: categories.length },
      { label: "Membros", value: members.length },
      { label: "Pendentes", value: pendingReviewCount },
      { label: "Votos", value: votes.length },
    ],
    [categories.length, members.length, pendingReviewCount, votes.length]
  );

  return (
    <Tabs defaultValue="dashboard" className="space-y-4 xl:grid xl:grid-cols-[19rem_minmax(0,1fr)] xl:gap-5 xl:space-y-0">
      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <section className="page-hero px-4 py-4 sm:px-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--color-title)]">
              <Shield className="h-4 w-4" />
              <span className="editorial-kicker">Admin</span>
            </div>

            <div className="space-y-2">
              <h2 className="heading-2 text-[var(--color-title-dark)]">
                Centro de controlo
              </h2>
              <p className="body-small text-[var(--color-text-muted)]">
                Moderacao, curadoria e estado do evento num painel mais legivel,
                com blocos compactos em mobile e hierarquia forte em desktop.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {overviewItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-3 shadow-[var(--shadow-panel)]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {pendingReviewCount > 0 ? (
                <Badge variant="secondary">
                  {pendingReviewCount} pendentes
                </Badge>
              ) : (
                <Badge variant="outline">Sem fila critica</Badge>
              )}
              {state ? (
                <Badge variant="outline">Fase: {state.phase}</Badge>
              ) : null}
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => void loadData()}
              disabled={loading}
            >
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Atualizar painel
            </Button>
          </div>
        </section>

        <TabsList className="scrollbar-none h-auto w-full justify-start gap-2 overflow-x-auto border border-[var(--color-moss)]/15 bg-[var(--color-bg-surface-alt)]/78 p-2 xl:flex-col xl:overflow-visible">
          {adminTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="w-full shrink-0 justify-between rounded-[var(--radius-md-token)] px-3 py-3 xl:w-full"
            >
              <span>{tab.label}</span>
              {tab.count > 0 ? (
                <Badge
                  variant="secondary"
                  className="min-w-5 justify-center rounded-full px-1.5 text-[11px]"
                >
                  {tab.count}
                </Badge>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </aside>

      <div className="space-y-4">
        <TabsContent value="dashboard" className="space-y-4">
          <AdminDashboard
            categories={categories}
            allNominees={allNominees}
            pendingNominees={pendingNominees}
            pendingCategoryProposals={pendingCategoryProposals}
            pendingMeasureProposals={pendingMeasureProposals}
            members={members}
            totalVotes={votes.length}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="nominees" className="space-y-4">
          <NomineesAdmin
            nominees={allNominees}
            categories={categories}
            loading={loading}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <PendingProposals
            categoryProposals={pendingCategoryProposals}
            measureProposalsAll={allMeasureProposals}
            loading={loading}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="state" className="space-y-4">
          <EventStateCard
            state={state}
            categories={categories}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoriesAdmin
            categories={categories}
            categoryProposals={allCategoryProposals}
            measureProposals={allMeasureProposals}
            loading={loading}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersAdmin members={members} loading={loading} />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <VotesAudit votes={votes} categories={categories} loading={loading} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
