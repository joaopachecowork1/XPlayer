"use client";

import { useEffect, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { CanhoesStateDto, GalaMeasureDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Gavel } from "lucide-react";

export function CanhoesMeasuresModule() {
  const [state, setState] = useState<CanhoesStateDto | null>(null);
  const [measures, setMeasures] = useState<GalaMeasureDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [st, list] = await Promise.all([canhoesRepo.getState(), canhoesRepo.getMeasures()]);
      setState(st);
      setMeasures(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const canPropose = Boolean(text.trim().length >= 5) && state?.phase === "nominations";

  const propose = async () => {
    if (!canPropose) return;
    setBusy(true);
    try {
      await canhoesRepo.createMeasureProposal({ text: text.trim() });
      setText("");
      // Measures list only shows approved measures; proposal is handled in Admin.
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold flex items-center gap-2">
          <Gavel className="h-4 w-4" /> Medidas
        </div>
        {state ? <Badge variant="outline">Fase: {state.phase}</Badge> : null}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Propor medida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Texto</div>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: Quem perder paga 1 rodada" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Fica pendente até um admin aprovar.</div>
            <Button disabled={!canPropose || busy} onClick={() => void propose()}>
              {state?.phase !== "nominations" ? "Propostas fechadas" : busy ? "A enviar..." : "Propor"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Medidas aprovadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">A carregar...</div>
          ) : measures.length === 0 ? (
            <div className="text-sm text-muted-foreground">Ainda não há medidas.</div>
          ) : (
            measures.map((m) => (
              <div key={m.id} className="rounded-lg border p-2">
                <div className="font-medium">{m.text}</div>
                <div className="text-xs text-muted-foreground">{new Date(m.createdAtUtc).toLocaleString()}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
