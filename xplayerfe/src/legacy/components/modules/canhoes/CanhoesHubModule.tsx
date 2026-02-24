"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { CanhoesStateDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Gavel,
  Sparkles,
  Sticker,
  Swords,
  Trophy,
  Vote,
  Megaphone,
} from "lucide-react";

function PhaseBadge({ state }: { state: CanhoesStateDto }) {
  const label =
    state.phase === "nominations"
      ? "Nomeações abertas"
      : state.phase === "voting"
      ? "Votações abertas"
      : state.phase === "locked"
      ? "Votações fechadas"
      : "Modo Gala";
  return <Badge variant="outline" className="border-primary/40 text-primary">{label}</Badge>;
}

export function CanhoesHubModule() {
  const [state, setState] = useState<CanhoesStateDto | null>(null);

  const primaryCta = useMemo(() => {
    if (!state) return { label: "Abrir votações", href: "/canhoes/votacao", disabled: true };
    if (state.phase === "voting") return { label: "Votar agora", href: "/canhoes/votacao", disabled: false };
    return { label: "Votações fechadas", href: "/canhoes/votacao", disabled: true };
  }, [state]);

  useEffect(() => {
    canhoesRepo.getState().then(setState).catch(() => setState(null));
  }, []);

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="relative overflow-hidden border-primary/20 bg-card/30">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Canhões do Ano
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">
                A cerimónia anual oficial (não oficial) para premiar o caos.
              </div>
            </div>
            {state ? <PhaseBadge state={state} /> : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link href={primaryCta.href} className="sm:flex-1">
              <Button className="w-full" disabled={primaryCta.disabled}>
                <Vote className="h-4 w-4 mr-2" /> {primaryCta.label}
              </Button>
            </Link>
            <Link href="/canhoes/stickers" className="sm:flex-1">
              <Button className="w-full" variant="secondary">
                <Sticker className="h-4 w-4 mr-2" /> Submeter sticker
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/canhoes/categorias">
              <Button size="sm" variant="outline">
                <Sparkles className="h-4 w-4 mr-2" /> Propor categoria
              </Button>
            </Link>
            <Link href="/canhoes/medidas">
              <Button size="sm" variant="outline">
                <Gavel className="h-4 w-4 mr-2" /> Propor medida
              </Button>
            </Link>
            <Link href="/canhoes/gala">
              <Button size="sm" variant="outline">
                <Megaphone className="h-4 w-4 mr-2" /> Modo gala
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="bg-border/60" />
          <div className="pt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-background/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sticker className="h-4 w-4" /> Sticker do Ano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Upload do sticker. Entra como pendente até a Comissão validar.
                </div>
                <Link href="/canhoes/stickers">
                  <Button className="w-full" variant="secondary">
                    Abrir <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-background/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Vote className="h-4 w-4" /> Votações por categorias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Um voto por categoria. Podes alterar até fechar.
                </div>
                <Link href="/canhoes/votacao">
                  <Button className="w-full" disabled={state?.phase !== "voting"}>
                    {state?.phase === "voting" ? "Votar" : "Indisponível"} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-background/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Swords className="h-4 w-4" /> Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Aprovar pendentes, gerir categorias e controlar fases.
                </div>
                <Link href="/canhoes/admin">
                  <Button className="w-full" variant="outline">
                    Abrir <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </CardContent>

        {/* Decorative */}
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      </Card>
    </div>
  );
}
