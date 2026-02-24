"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CanhoesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CanhoesErrorBoundary]", error);
  }, [error]);

  return (
    <div className="p-6 space-y-3">
      <div className="text-lg font-semibold">Canhões do Ano</div>
      <div className="text-sm text-muted-foreground">
        Houve um erro ao carregar esta secção. (ver consola para detalhes)
      </div>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Tentar novamente</Button>
        <Button variant="outline" onClick={() => location.reload()}>
          Recarregar
        </Button>
      </div>
    </div>
  );
}
