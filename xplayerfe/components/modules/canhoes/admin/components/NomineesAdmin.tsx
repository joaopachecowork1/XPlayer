"use client";

import { useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import type { AwardCategoryDto, NomineeDto } from "@/lib/api/types";
import { toast } from "sonner";

type StatusFilter = "all" | "pending" | "approved";

type Props = {
  nominees: NomineeDto[];
  categories: AwardCategoryDto[];
  loading: boolean;
  onUpdate: () => Promise<void>;
};

export function NomineesAdmin({ nominees, categories, loading, onUpdate }: Readonly<Props>) {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const filtered = useMemo(() => {
    if (filter === "all") return nominees;
    return nominees.filter((n) => n.status === filter);
  }, [nominees, filter]);

  const pendingCount = useMemo(() => nominees.filter((n) => n.status === "pending").length, [nominees]);
  const approvedCount = useMemo(() => nominees.filter((n) => n.status === "approved").length, [nominees]);

  const isProcessing = (id: string) => processingIds.has(id);

  const withProcessing = async (id: string, action: () => Promise<unknown>) => {
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
      canhoesRepo.adminSetNomineeCategory(id, { categoryId: (categoryId && categoryId !== "__none__") ? categoryId : null })
    );

  const handleApprove = (id: string) =>
    withProcessing(id, () => canhoesRepo.approveNominee(id));

  const handleReject = (id: string) =>
    withProcessing(id, () => canhoesRepo.rejectNominee(id));

  return (
    <Card className="canhoes-glass border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between text-primary/90">
          <span>Nomeações ({nominees.length})</span>
        </CardTitle>
        {/* Filter tabs */}
        <div className="flex gap-2 mt-2">
          {(["all", "pending", "approved"] as const).map((s) => {
            const labels: Record<StatusFilter, string> = { all: "Todas", pending: "Pendentes", approved: "Aprovadas" };
            const counts: Record<StatusFilter, number> = { all: nominees.length, pending: pendingCount, approved: approvedCount };
            return (
              <Button
                key={s}
                size="sm"
                variant={filter === s ? "default" : "ghost"}
                className="h-7 px-3 text-xs"
                onClick={() => setFilter(s)}
              >
                {labels[s]}
                <Badge variant="outline" className="ml-1 h-4 px-1 text-xs">{counts[s]}</Badge>
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">A carregar...</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sem nomeações.</div>
        ) : (
          filtered.map((n) => {
            const busy = isProcessing(n.id);
            return (
              <div key={n.id} className="rounded-lg border border-primary/20 bg-black/20 p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{n.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {n.categoryId ? categoryMap.get(n.categoryId) : "(sem categoria)"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={n.status === "approved" ? "default" : n.status === "rejected" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {n.status}
                    </Badge>
                    {n.status === "pending" && (
                      <Button
                        size="sm"
                        disabled={busy || !n.categoryId}
                        title={!n.categoryId ? "Atribua uma categoria primeiro" : "Aprovar"}
                        onClick={() => handleApprove(n.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {(n.status === "pending" || n.status === "approved") && (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        title={n.status === "approved" ? "Remover aprovação" : "Rejeitar"}
                        onClick={() => handleReject(n.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {n.status === "pending" && (
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
                          <SelectItem value="__none__">(sem categoria)</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {!n.categoryId && (
                      <div className="text-xs text-muted-foreground shrink-0">
                        Categoria obrigatória para aprovar
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {new Date(n.createdAtUtc).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
