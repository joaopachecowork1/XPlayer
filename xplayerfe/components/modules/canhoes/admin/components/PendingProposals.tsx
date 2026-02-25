"use client";

import { useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";
import type { CategoryProposalDto, MeasureProposalDto } from "@/lib/api/types";
import { toast } from "sonner";

type Props = {
  categoryProposals: CategoryProposalDto[];
  measureProposals: MeasureProposalDto[];
  loading: boolean;
  onUpdate: () => Promise<void>;
};

export function PendingProposals({ categoryProposals, measureProposals, loading, onUpdate }: Props) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

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

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {/* Category Proposals */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Propostas de Categorias ({categoryProposals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">A carregar...</div>
          ) : categoryProposals.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem pendentes.</div>
          ) : (
            categoryProposals.map((p) => {
              const busy = processingIds.has(p.id);
              return (
                <div key={p.id} className="rounded-lg border p-2 space-y-2">
                  <div className="font-medium">{p.name}</div>
                  {p.description && (
                    <div className="text-sm text-muted-foreground">{p.description}</div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        withProcessing(p.id, () => canhoesRepo.adminApproveCategoryProposal(p.id))
                      }
                    >
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() =>
                        withProcessing(p.id, () => canhoesRepo.adminRejectCategoryProposal(p.id))
                      }
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Measure Proposals */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gavel className="h-4 w-4" /> Propostas de Medidas ({measureProposals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">A carregar...</div>
          ) : measureProposals.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem pendentes.</div>
          ) : (
            measureProposals.map((p) => {
              const busy = processingIds.has(p.id);
              return (
                <div key={p.id} className="rounded-lg border p-2 space-y-2">
                  <div className="font-medium">{p.text}</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        withProcessing(p.id, () => canhoesRepo.adminApproveMeasureProposal(p.id))
                      }
                    >
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() =>
                        withProcessing(p.id, () => canhoesRepo.adminRejectMeasureProposal(p.id))
                      }
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}