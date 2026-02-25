"use client";

import { useEffect, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import type {
  AwardCategoryDto,
  CanhoesStateDto,
  NomineeDto,
  CategoryProposalDto,
  MeasureProposalDto,
} from "@/lib/api/types";

import { EventStateCard } from "./components/EventStateCard";
import { PendingNominees } from "./components/PendingNominees";
import { PendingProposals } from "./components/PendingProposals";
import { VotesAudit } from "./components/VotesAudit";
import { CategoriesAdmin } from "./components/CategoriesAdmin";

type VoteAuditRow = {
  categoryId: string;
  nomineeId: string;
  userId: string;
  updatedAtUtc: string;
};

const safe = async <T,>(p: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await p;
  } catch {
    return fallback;
  }
};

export default function CanhoesAdminModule() {
  const [state, setState] = useState<CanhoesStateDto | null>(null);
  const [categories, setCategories] = useState<AwardCategoryDto[]>([]);
  const [pendingNominees, setPendingNominees] = useState<NomineeDto[]>([]);
  const [pendingCats, setPendingCats] = useState<CategoryProposalDto[]>([]);
  const [pendingMeasures, setPendingMeasures] = useState<MeasureProposalDto[]>(
    []
  );
  const [votes, setVotes] = useState<VoteAuditRow[]>([]);
  const [allCategoryProposals, setAllCategoryProposals] = useState<
    CategoryProposalDto[]
  >([]);
  const [allMeasureProposals, setAllMeasureProposals] = useState<
    MeasureProposalDto[]
  >([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [st, cats, pend, votesResp, hist] = await Promise.all([
        safe<CanhoesStateDto | null>(
          canhoesRepo.getState(),
          null as unknown as CanhoesStateDto
        ),
        safe<AwardCategoryDto[]>(
          canhoesRepo.adminGetAllCategories(),
          [] as AwardCategoryDto[]
        ),
        safe<{ nominees: NomineeDto[]; categoryProposals: CategoryProposalDto[]; measureProposals: MeasureProposalDto[] }>(
          canhoesRepo.adminPending(),
          { nominees: [], categoryProposals: [], measureProposals: [] }
        ),
        safe<{ votes: VoteAuditRow[] }>(
          canhoesRepo.adminVotes(),
          { votes: [] }
        ),
        safe<{ categoryProposals: CategoryProposalDto[]; measureProposals: MeasureProposalDto[] }>(
          canhoesRepo.adminProposalsHistory(),
          { categoryProposals: [], measureProposals: [] }
        ),
      ]);

      setState(st);
      setCategories(cats);
      setPendingNominees(pend.nominees ?? []);
      setPendingCats(pend.categoryProposals ?? []);
      setPendingMeasures(pend.measureProposals ?? []);
      setVotes(votesResp.votes ?? []);
      setAllCategoryProposals(hist.categoryProposals ?? []);
      setAllMeasureProposals(hist.measureProposals ?? []);
    } catch (err) {
      console.error("Admin load error:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPending =
    pendingNominees.length + pendingCats.length + pendingMeasures.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4" /> Admin — Canhões
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Admin</Badge>
          <Button variant="ghost" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pendentes
            {totalPending > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalPending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="state">Estado</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="audit">
            Auditoria
            {votes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {votes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          <PendingNominees
            nominees={pendingNominees}
            categories={categories}
            loading={loading}
            onUpdate={loadData}
          />

          <PendingProposals
            categoryProposals={pendingCats}
            measureProposals={pendingMeasures}
            loading={loading}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="state">
          <EventStateCard
            state={state}
            categories={categories}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesAdmin
            categories={categories}
            categoryProposals={allCategoryProposals}
            measureProposals={allMeasureProposals}
            loading={loading}
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="audit">
          <VotesAudit votes={votes} categories={categories} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
