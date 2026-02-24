"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { AwardCategoryDto } from "@/lib/api/types";

type VoteAuditRow = {
  categoryId: string;
  nomineeId: string;
  userId: string;
  updatedAtUtc: string;
};

type Props = {
  votes: VoteAuditRow[];
  categories: AwardCategoryDto[];
  loading: boolean;
};

const MAX_DISPLAY = 200;

export function VotesAudit({ votes, categories, loading }: Props) {
  const [search, setSearch] = useState("");

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return votes.slice(0, MAX_DISPLAY);

    const term = search.toLowerCase();
    return votes
      .filter(
        (v) =>
          v.nomineeId.toLowerCase().includes(term) ||
          v.userId.toLowerCase().includes(term) ||
          categoryMap.get(v.categoryId)?.toLowerCase().includes(term)
      )
      .slice(0, MAX_DISPLAY);
  }, [votes, search, categoryMap]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Auditoria de Votos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">A carregar...</div>
        ) : votes.length === 0 ? (
          <div className="text-sm text-muted-foreground">Ainda não há votos.</div>
        ) : (
          <>
            <Input
              placeholder="Pesquisar por categoria, nominee ou user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="text-xs text-muted-foreground">
              {filtered.length} de {votes.length} votos
              {filtered.length >= MAX_DISPLAY && ` (mostrando ${MAX_DISPLAY} max)`}
            </div>

            <Separator />

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filtered.map((v, idx) => (
                <div
                  key={`${v.userId}:${v.categoryId}:${idx}`}
                  className="rounded-lg border p-2 space-y-1"
                >
                  <div className="text-sm font-medium">
                    {categoryMap.get(v.categoryId) ?? v.categoryId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Nominee: {v.nomineeId}
                  </div>
                  <div className="text-xs text-muted-foreground">User: {v.userId}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(v.updatedAtUtc).toLocaleString("pt-PT")}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}