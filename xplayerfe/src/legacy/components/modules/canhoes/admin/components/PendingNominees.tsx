"use client";

import { useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Clock, X } from "lucide-react";
import type { AwardCategoryDto, NomineeDto } from "@/lib/api/types";
import { toast } from "sonner";

type Props = {
  nominees: NomineeDto[];
  categories: AwardCategoryDto[];
  loading: boolean;
  onUpdate: () => Promise<void>;
};

export function PendingNominees({ nominees, categories, loading, onUpdate }: Props) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const isProcessing = (id: string) => processingIds.has(id);

  const withProcessing = async (id: string, action: () => Promise<any>) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await action();
      await onUpdate();
      toast.success("Ação concluída");
    } catch (error) {
      console.error("Action error:", error);
      toast.error("Erro ao processar");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSetCategory = (id: string, categoryId: string) =>
    withProcessing(id, () =>
      canhoesRepo.adminSetNomineeCategory(id, { categoryId: categoryId || null })
    );

  const handleApprove = (id: string) =>
    withProcessing(id, () => canhoesRepo.approveNominee(id));

  const handleReject = (id: string) =>
    withProcessing(id, () => canhoesRepo.rejectNominee(id));

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" /> Nomeações ({nominees.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">A carregar...</div>
        ) : nominees.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sem pendentes.</div>
        ) : (
          nominees.map((n) => {
            const busy = isProcessing(n.id);
            return (
              <div key={n.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{n.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {n.categoryId ? categoryMap.get(n.categoryId) : "(sem categoria)"}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      disabled={busy || !n.categoryId}
                      onClick={() => handleApprove(n.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => handleReject(n.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      value={n.categoryId ?? ""}
                      onValueChange={(v) => handleSetCategory(n.id, v)}
                      disabled={busy}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">(sem categoria)</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Categoria obrigatória
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}