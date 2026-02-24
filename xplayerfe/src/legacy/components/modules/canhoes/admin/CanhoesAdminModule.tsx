"use client";

import { useEffect, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";


import type {
  AwardCategoryDto,
  CanhoesStateDto,
  NomineeDto,
  CategoryProposalDto,
  MeasureProposalDto,
} from "@/lib/api/types";
import { toast } from "sonner";
import { EventStateCard } from "./components/EventStateCard";
import CategoriesCard from "./components/CategoriesCard";
import { PendingNominees } from "./components/PendingNominees";
import { PendingProposals } from "./components/PendingProposals";
import { VotesAudit } from "./components/VotesAudit";

type VoteAuditRow = {
  categoryId: string;
  nomineeId: string;
  userId: string;
  updatedAtUtc: string;
};

export default function CanhoesAdminModule() {
  const [state, setState] = useState<CanhoesStateDto | null>(null);
  const [categories, setCategories] = useState<AwardCategoryDto[]>([]);
  const [pendingNominees, setPendingNominees] = useState<NomineeDto[]>([]);
  const [pendingCats, setPendingCats] = useState<CategoryProposalDto[]>([]);
  const [pendingMeasures, setPendingMeasures] = useState<MeasureProposalDto[]>([]);
  const [votes, setVotes] = useState<VoteAuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        canhoesRepo.getState(),
        canhoesRepo.adminListCategories(),
        canhoesRepo.adminPending(),
        canhoesRepo.adminVotes(),
      ]);

      if (results[0].status === "fulfilled") setState(results[0].value);
      if (results[1].status === "fulfilled") setCategories(results[1].value);
      
      if (results[2].status === "fulfilled") {
        const pending = results[2].value;
        setPendingNominees(pending.nominees ?? []);
        setPendingCats(pending.categoryProposals ?? []);
        setPendingMeasures(pending.measureProposals ?? []);
      }
      
      if (results[3].status === "fulfilled") {
        setVotes(results[3].value.votes ?? []);
      }

      // Log errors silently
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          console.error(`Failed to load admin data [${i}]:`, result.reason);
        }
      });
    } catch (error) {
      console.error("Admin load error:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPending = pendingNominees.length + pendingCats.length + pendingMeasures.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4" /> Admin — Canhões
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Admin</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
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
            onUpdate={loadData}
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesCard categories={categories} onUpdated={loadData} />
        </TabsContent>

        <TabsContent value="audit">
          <VotesAudit
            votes={votes}
            categories={categories}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}