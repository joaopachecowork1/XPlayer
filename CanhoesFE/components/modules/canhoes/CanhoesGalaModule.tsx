"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageOff, Medal, Trophy } from "lucide-react";

import { absMediaUrl } from "@/lib/media";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { CanhoesCategoryResultDto } from "@/lib/api/types";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function getPlacementIcon(position: number) {
  return position === 0 ? (
    <Trophy className="h-4 w-4 text-[var(--color-fire)]" />
  ) : (
    <Medal className="h-4 w-4 text-[var(--color-beige)]" />
  );
}

export function CanhoesGalaModule() {
  const [resultsByCategory, setResultsByCategory] = useState<CanhoesCategoryResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    canhoesRepo
      .getResults()
      .then(setResultsByCategory)
      .finally(() => setIsLoading(false));
  }, []);

  const totalVotes = useMemo(
    () => resultsByCategory.reduce((voteCount, categoryResult) => voteCount + (categoryResult.totalVotes ?? 0), 0),
    [resultsByCategory]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="canhoes-section-title flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[var(--color-fire)]" />
            Gala
          </h1>
          <p className="body-small text-[var(--color-text-muted)]">Resultados finais por categoria, em formato legível em mobile.</p>
        </div>

        <Badge variant="outline">Total votos: {totalVotes}</Badge>
      </div>

      {isLoading ? <p className="body-small text-[var(--color-text-muted)]">A carregar resultados...</p> : null}

      {!isLoading && resultsByCategory.length === 0 ? (
        <p className="body-small text-[var(--color-text-muted)]">Sem resultados ainda.</p>
      ) : null}

      {!isLoading ? (
        <div className="space-y-4">
          {resultsByCategory.map((categoryResult) => (
            <Card key={categoryResult.categoryId}>
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                  <span>{categoryResult.categoryName}</span>
                  <Badge variant="secondary">{categoryResult.totalVotes} votos</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {categoryResult.top.length === 0 ? (
                  <p className="body-small text-[var(--color-text-muted)]">Sem nomeações aprovadas.</p>
                ) : null}

                <div className="space-y-3">
                  {categoryResult.top.map((nominee, index) => (
                    <div key={nominee.nomineeId} className="canhoes-list-item flex items-center gap-3 p-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                        {nominee.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={absMediaUrl(nominee.imageUrl)}
                            alt={nominee.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <ImageOff className="h-4 w-4 text-[var(--color-text-muted)]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-text-primary)]">
                            {getPlacementIcon(index)} #{index + 1}
                          </span>
                          <span className="truncate font-semibold text-[var(--color-text-primary)]">{nominee.title}</span>
                        </div>
                        <p className="body-small text-[var(--color-text-muted)]">{nominee.votes} votos</p>
                      </div>

                      <Badge variant={index === 0 ? "default" : "outline"}>{index === 0 ? "Winner" : "Top"}</Badge>
                    </div>
                  ))}
                </div>

                <Separator />
                <p className="body-small text-[var(--color-text-muted)]">Só mostra o Top 3, com imagem quando existir.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}


