"use client";

import { useEffect, useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { XPLAYER_API_URL } from "@/lib/api/xplayerClient";
import type { CanhoesCategoryResultDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageOff, Medal, Trophy } from "lucide-react";

function placeIcon(idx: number) {
  if (idx === 0) return <Trophy className="h-4 w-4" />;
  return <Medal className="h-4 w-4" />;
}

export function CanhoesGalaModule() {
  const [data, setData] = useState<CanhoesCategoryResultDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    canhoesRepo
      .getResults()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const totalVotes = useMemo(() => data.reduce((acc, c) => acc + (c.totalVotes ?? 0), 0), [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5" /> Gala
        </div>
        <Badge variant="outline">Total votos: {totalVotes}</Badge>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">A carregar resultados...</div>
      ) : data.length === 0 ? (
        <div className="text-sm text-muted-foreground">Sem resultados (ainda).</div>
      ) : (
        <div className="space-y-4">
          {data.map((cat) => (
            <Card key={cat.categoryId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{cat.categoryName}</span>
                  <Badge variant="secondary">{cat.totalVotes} votos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cat.top.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Sem nomeações aprovadas.</div>
                ) : (
                  <div className="grid gap-2">
                    {cat.top.map((n, idx) => (
                      <div key={n.nomineeId} className="flex items-center gap-3 rounded-lg border p-2">
                        <div className="h-12 w-12 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                          {n.imageUrl ? (
                            <img
                              src={`${XPLAYER_API_URL}${n.imageUrl}`}
                              alt={n.title}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-sm font-semibold">
                              {placeIcon(idx)} #{idx + 1}
                            </span>
                            <span className="truncate font-medium">{n.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{n.votes} votos</div>
                        </div>
                        {idx === 0 ? <Badge>Winner</Badge> : <Badge variant="outline">Top</Badge>}
                      </div>
                    ))}
                  </div>
                )}

                <Separator />
                <div className="text-xs text-muted-foreground">
                  Nota: só mostra até Top 3 (com imagem quando existir).
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
