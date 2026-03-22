"use client";

import { useEffect, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { CanhoesStateDto, GalaMeasureDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Flame, Gavel } from "lucide-react";

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

  const isNominations = state?.phase === "nominations";
  const canPropose = Boolean(text.trim().length >= 5) && isNominations;
  let proposeLabel = "Propostas fechadas";
  if (isNominations) {
    proposeLabel = busy ? "A enviar..." : "Propor";
  }

  let measuresBody: React.ReactNode;
  if (loading) {
    measuresBody = <div className="text-sm text-muted-foreground">A carregar...</div>;
  } else if (measures.length === 0) {
    measuresBody = <div className="text-sm text-muted-foreground">Ainda não há medidas.</div>;
  } else {
    measuresBody = measures.map((m) => (
      <div key={m.id} className="canhoes-chip rounded-lg p-2">
        <div className="font-medium">{m.text}</div>
        <div className="text-xs text-muted-foreground">{new Date(m.createdAtUtc).toLocaleString()}</div>
      </div>
    ));
  }

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div
          className="canhoes-title flex items-center gap-2"
          style={{ fontSize: "17px" }}
        >
          <Flame className="h-4 w-4" style={{ color: "#ff8c00" }} /> Medidas
        </div>
        {state ? <Badge variant="outline">Fase: {state.phase}</Badge> : null}
      </div>

      <Card className="canhoes-glass rounded-2xl">
        <CardHeader className="pb-1.5">
          <CardTitle
            className="canhoes-label text-sm inline-flex items-center gap-2"
            style={{ color: "rgba(0,255,68,0.80)" }}
          >
            <Gavel className="h-4 w-4" style={{ color: "#ffe135" }} />Propor medida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Texto</div>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: Quem perder paga 1 rodada" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Fica pendente até um admin aprovar.</div>
            <Button className="canhoes-tap h-9" disabled={!canPropose || busy} onClick={() => void propose()}>
              {proposeLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="canhoes-glass rounded-2xl">
        <CardHeader className="pb-1.5">
          <CardTitle className="text-base">Medidas aprovadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {measuresBody}
        </CardContent>
      </Card>
    </div>
  );
}
