"use client";

import { useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye } from "lucide-react";
import type { CanhoesStateDto } from "@/lib/api/types";
import { toast } from "sonner";

type Props = {
  state: CanhoesStateDto | null;
  onUpdate: () => Promise<void>;
};

export function EventStateCard({ state, onUpdate }: Props) {
  const [busy, setBusy] = useState(false);

  const updateState = async (patch: Partial<CanhoesStateDto>) => {
    if (!state) return;

    setBusy(true);
    try {
      await canhoesRepo.updateState({
        phase: (patch.phase ?? state.phase) as "nominations" | "voting" | "locked" | "gala",
        nominationsVisible: patch.nominationsVisible ?? state.nominationsVisible,
        resultsVisible: patch.resultsVisible ?? state.resultsVisible,
      });
      await onUpdate();
      toast.success("Estado atualizado");
    } catch (error) {
      console.error("Update state error:", error);
      toast.error("Erro ao atualizar estado");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Event State Controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Estado do Evento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {/* Phase */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Fase</div>
            <Select
              value={state?.phase ?? "nominations"}
              onValueChange={(v) => updateState({ phase: v as any })}
              disabled={busy}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nominations">Nominations</SelectItem>
                <SelectItem value="voting">Voting</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="gala">Gala</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nominations Visible */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Nominations Visible</div>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={busy}
              onClick={() =>
                updateState({ nominationsVisible: !state?.nominationsVisible })
              }
            >
              <Eye className="h-4 w-4 mr-2" />
              {state?.nominationsVisible ? "Sim" : "Não"}
            </Button>
          </div>

          {/* Results Visible */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Results Visible</div>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={busy}
              onClick={() => updateState({ resultsVisible: !state?.resultsVisible })}
            >
              <Eye className="h-4 w-4 mr-2" />
              {state?.resultsVisible ? "Sim" : "Não"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground px-1">
        💡 A votação só funciona em <strong>voting</strong>. Resultados aparecem quando{" "}
        <strong>resultsVisible=true</strong> ou fase <strong>gala</strong>.
      </div>
    </div>
  );
}