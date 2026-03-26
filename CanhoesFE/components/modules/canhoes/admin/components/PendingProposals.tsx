"use client";

import { useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gavel } from "lucide-react";
import type { CategoryProposalDto, MeasureProposalDto } from "@/lib/api/types";
import { toast } from "sonner";

type Props = {
  categoryProposals: CategoryProposalDto[];
  measureProposalsAll: MeasureProposalDto[];
  loading: boolean;
  onUpdate: () => Promise<void>;
};

type MeasureFilter = "pending" | "approved" | "rejected";

function measureFilterLabel(status: MeasureFilter) {
  if (status === "pending") return "Pendentes";
  if (status === "approved") return "Aprovadas";
  return "Rejeitadas";
}

export function PendingProposals({ categoryProposals, measureProposalsAll, loading, onUpdate }: Readonly<Props>) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [measureFilter, setMeasureFilter] = useState<MeasureFilter>("pending");
  const [measureDrafts, setMeasureDrafts] = useState<Record<string, string>>({});

  const withProcessing = async (id: string, action: () => Promise<void>) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await action();
      await onUpdate();
      toast.success("Ação concluída");
    } catch (error) {
      console.error("Proposal action error:", error);
      toast.error("Erro ao processar proposta");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filteredMeasureProposals = useMemo(
    () => (measureProposalsAll ?? []).filter((proposal) => proposal.status === measureFilter),
    [measureProposalsAll, measureFilter]
  );

  const setMeasureDraft = (id: string, text: string) => {
    setMeasureDrafts((prev) => ({ ...prev, [id]: text }));
  };

  const getMeasureDraft = (proposal: MeasureProposalDto) => {
    return measureDrafts[proposal.id] ?? proposal.text;
  };

  let categoryBody: React.ReactNode;
  if (loading) {
    categoryBody = <div className="text-sm text-muted-foreground">A carregar...</div>;
  } else if (categoryProposals.length === 0) {
    categoryBody = <div className="text-sm text-muted-foreground">Sem pendentes.</div>;
  } else {
    categoryBody = categoryProposals.map((p) => {
      const busy = processingIds.has(p.id);
      return (
        <div key={p.id} className="rounded-lg border border-primary/20 bg-black/20 p-2 space-y-2">
          <div className="font-medium">{p.name}</div>
          {p.description && (
            <div className="text-sm text-muted-foreground">{p.description}</div>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                withProcessing(p.id, async () => {
                  await canhoesRepo.adminApproveCategoryProposal(p.id);
                })
              }
            >
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() =>
                withProcessing(p.id, async () => {
                  await canhoesRepo.adminRejectCategoryProposal(p.id);
                })
              }
            >
              Rejeitar
            </Button>
          </div>
        </div>
      );
    });
  }

  let measureBody: React.ReactNode;
  if (loading) {
    measureBody = <div className="text-sm text-muted-foreground">A carregar...</div>;
  } else if (filteredMeasureProposals.length === 0) {
    measureBody = <div className="text-sm text-muted-foreground">Sem propostas neste estado.</div>;
  } else {
    measureBody = filteredMeasureProposals.map((p) => {
      const busy = processingIds.has(p.id);
      const draftText = getMeasureDraft(p);
      return (
        <div key={p.id} className="rounded-lg border border-primary/20 bg-black/20 p-2 space-y-2">
          <Input
            value={draftText}
            onChange={(e) => setMeasureDraft(p.id, e.target.value)}
            className="bg-black/30 border-primary/30 text-foreground placeholder:text-slate-400"
            placeholder="Texto da proposta"
            disabled={busy}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={busy || !draftText.trim()}
              onClick={() =>
                withProcessing(p.id, async () => {
                  await canhoesRepo.adminUpdateMeasureProposal(p.id, { text: draftText.trim() });
                })
              }
            >
              Guardar texto
            </Button>
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                withProcessing(p.id, async () => {
                  const normalized = draftText.trim();
                  if (normalized && normalized !== p.text) {
                    await canhoesRepo.adminUpdateMeasureProposal(p.id, { text: normalized });
                  }
                  await canhoesRepo.adminApproveMeasureProposal(p.id);
                })
              }
            >
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() =>
                withProcessing(p.id, async () => {
                  await canhoesRepo.adminRejectMeasureProposal(p.id);
                })
              }
            >
              Rejeitar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() =>
                withProcessing(p.id, async () => {
                  await canhoesRepo.adminDeleteMeasureProposal(p.id);
                })
              }
            >
              Apagar
            </Button>
          </div>
        </div>
      );
    });
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {/* Category Proposals */}
      <Card className="canhoes-glass border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-primary/90">
            Propostas de Categorias ({categoryProposals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categoryBody}
        </CardContent>
      </Card>

      {/* Measure Proposals */}
      <Card className="canhoes-glass border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-primary/90">
            <Gavel className="h-4 w-4" /> Propostas de Medidas ({measureProposalsAll.length})
          </CardTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["pending", "approved", "rejected"] as MeasureFilter[]).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={measureFilter === status ? "default" : "outline"}
                className="h-7 rounded-full px-3 text-xs"
                onClick={() => setMeasureFilter(status)}
              >
                {measureFilterLabel(status)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {measureBody}
        </CardContent>
      </Card>
    </div>
  );
}