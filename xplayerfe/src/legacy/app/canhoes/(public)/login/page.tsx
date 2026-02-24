"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function CanhoesLoginPage() {
  const router = useRouter();
  const { isLogged, loading, loginGoogle } = useAuth();

  useEffect(() => {
    if (!loading && isLogged) router.replace("/canhoes");
  }, [loading, isLogged, router]);

  return (
    <div className="min-h-[100svh] grid place-items-center p-4">
      <Card className="w-full max-w-md bg-background/70 backdrop-blur border">
        <CardHeader className="space-y-2">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" /> Canhões do Ano
          </div>
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <div className="text-sm text-muted-foreground">
            Login rápido para aceder ao hub, stickers, votações e amigo secreto.
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={() => loginGoogle()} disabled={loading}>
            <Chrome className="mr-2 h-4 w-4" /> Continuar com Google
          </Button>
          <div className="text-xs text-muted-foreground">
            Nota: esta área é só para o módulo <b>Canhões</b>. O resto do XPlayer fica fora daqui.
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Funciona bem em mobile e desktop.
        </CardFooter>
      </Card>
    </div>
  );
}
