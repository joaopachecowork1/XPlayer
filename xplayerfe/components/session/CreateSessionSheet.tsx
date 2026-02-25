"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { rawgGetGameDetails, rawgSearchGames, type RawgGameSearchResult } from "@/lib/rawg";

export type CreateSessionResult = {
  gameId: string;
  gameName: string;
  coverUrl?: string | null;
  released?: string | null;
  score?: number | null;
  platform?: string;
  platformId?: number;
};

export type PresetGame = {
  gameId: string;
  gameName: string;
  coverUrl?: string | null;
  released?: string | null;
  score?: number | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (result: CreateSessionResult) => Promise<void> | void;
  disabled?: boolean;
  /** Optional: if provided, the sheet opens with this game already selected. */
  presetGame?: PresetGame | null;
};

export function CreateSessionSheet({ open, onOpenChange, onStart, disabled, presetGame }: Props) {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<RawgGameSearchResult[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [selectedGame, setSelectedGame] = useState<RawgGameSearchResult | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<Awaited<ReturnType<typeof rawgGetGameDetails>> | null>(null);

  const [platformId, setPlatformId] = useState<string | undefined>(undefined);
  const [platformOptions, setPlatformOptions] = useState<{ id: number; name: string }[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [starting, setStarting] = useState(false);

  // When a sheet is opened from a specific game (Backlog detail), we lock the selection until the user clicks "Alterar".
  const [lockedSelection, setLockedSelection] = useState(false);

  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    if (!open) return;

    // When opened from a backlog game, keep the selection fixed unless user clicks "Alterar".
    if (lockedSelection) return;

    if (presetGame) {
      setLockedSelection(true);
      setGames([]);
      setQuery(presetGame.gameName);
      setSelectedGame({
        id: Number(presetGame.gameId),
        name: presetGame.gameName,
        background_image: presetGame.coverUrl ?? null,
        released: presetGame.released ?? null,
        // These are optional; kept empty until details fetch.
        platforms: [],
        short_screenshots: [],
      } as unknown as RawgGameSearchResult);
      return;
    }

    // No preset: normal search mode.
    setLockedSelection(false);
  }, [open, presetGame]);

  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (!q) {
      setGames([]);
      setLoadingGames(false);
      lastQueryRef.current = "";
      return;
    }

    lastQueryRef.current = q;
    const t = setTimeout(async () => {
      setLoadingGames(true);
      try {
        const results = await rawgSearchGames(q, 12);
        // Evita atualizar resultados antigos.
        if (lastQueryRef.current === q) {
          setGames(results);
        }
      } catch (e) {
        console.error(e);
        if (lastQueryRef.current === q) setGames([]);
      } finally {
        if (lastQueryRef.current === q) setLoadingGames(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [query, open, lockedSelection]);

  useEffect(() => {
    // Quando escolhe um jogo, obter plataformas (e restringir seleção às suportadas).
    const run = async () => {
      if (!selectedGame) {
        setPlatformOptions([]);
        setPlatformId(undefined);
        setSelectedDetails(null);
        return;
      }

      // Primeiro, tenta usar plataformas do próprio resultado de pesquisa.
      const fromSearch = (selectedGame.platforms ?? [])
        .map((p) => p.platform)
        .filter(Boolean);

      if (fromSearch.length > 0) {
        setPlatformOptions(fromSearch);
      } else {
        setPlatformOptions([]);
      }

      // Depois, busca detalhes para garantir que temos as plataformas corretas.
      setLoadingPlatforms(true);
      try {
        const details = await rawgGetGameDetails(selectedGame.id);
        setSelectedDetails(details);
        const platforms = (details.platforms ?? []).map((p) => p.platform);
        setPlatformOptions(platforms);
        // Se a plataforma selecionada deixou de ser válida, limpar.
        if (platformId) {
          const idNum = Number(platformId);
          if (!platforms.some((p) => p.id === idNum)) {
            setPlatformId(undefined);
          }
        }
      } catch (e) {
        console.error(e);
        setSelectedDetails(null);
        // Se falhar, fica com o melhor esforço (search).
      } finally {
        setLoadingPlatforms(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGame?.id]);

  const canStart = !!selectedGame && !starting && !disabled;

  const handleStart = async () => {
    if (!selectedGame) return;
    setStarting(true);
    try {
      const selectedPlatform = platformId
        ? platformOptions.find((p) => p.id === Number(platformId))
        : undefined;
      // RAWG sometimes returns null for background_image. Use a sensible fallback order.
      const coverUrl =
        selectedDetails?.background_image ??
        selectedDetails?.background_image_additional ??
        selectedDetails?.short_screenshots?.[0]?.image ??
        selectedGame.background_image ??
        selectedGame.short_screenshots?.[0]?.image ??
        null;

      await onStart({
        gameId: String(selectedGame.id),
        gameName: selectedGame.name,
        coverUrl,
        released: selectedDetails?.released ?? selectedGame.released,
        score: selectedDetails?.metacritic ?? null,
        platform: selectedPlatform?.name,
        platformId: selectedPlatform?.id,
      });
      // Reset for next time.
      setQuery("");
      setGames([]);
      setSelectedGame(null);
      setPlatformId(undefined);
      setPlatformOptions([]);
      onOpenChange(false);
    } finally {
      setStarting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0 sm:max-w-none">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-lg">Criar Sessão</SheetTitle>
          <SheetDescription>
            Seleciona um jogo e, se quiseres, a plataforma.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium">Jogo</label>
              {selectedGame && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => {
                    setLockedSelection(false);
                    setSelectedGame(null);
                    setSelectedDetails(null);
                    setPlatformId(undefined);
                    setPlatformOptions([]);
                    setQuery("");
                    setGames([]);
                  }}
                >
                  Alterar
                </Button>
              )}
            </div>

            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar jogo…"
              inputMode="search"
              className="h-11"
              disabled={!!selectedGame && lockedSelection}
            />

            {selectedGame ? (
              <div className="rounded-md border p-3 flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
                  {(selectedDetails?.background_image ?? selectedGame.background_image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(selectedDetails?.background_image ?? selectedGame.background_image) as string}
                      alt={selectedGame.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">—</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{selectedGame.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedDetails?.released ?? selectedGame.released ?? ""}</p>
                </div>
              </div>
            ) : (
              <div className="max-h-[38vh] overflow-auto rounded-md border">
                {!query.trim() ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    Começa a escrever para pesquisar jogos.
                  </div>
                ) : loadingGames ? (
                  <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    A procurar jogos…
                  </div>
                ) : games.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    Nenhum jogo encontrado.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {games.map((g) => (
                      <li key={g.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedGame(g)}
                          className={cn(
                            "w-full text-left px-4 py-3 flex items-center justify-between",
                            "hover:bg-muted/50 active:bg-muted"
                          )}
                        >
                          <span className="font-medium">{g.name}</span>
                          <span className="text-xs text-muted-foreground">Selecionar</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Plataforma (opcional)</label>
            <Select value={platformId} onValueChange={(v) => setPlatformId(v)} disabled={!selectedGame || loadingPlatforms || platformOptions.length === 0}>
              <SelectTrigger className="h-11">
                <SelectValue
                  placeholder={
                    !selectedGame
                      ? "Seleciona um jogo primeiro"
                      : loadingPlatforms
                      ? "A carregar plataformas…"
                      : platformOptions.length === 0
                      ? "Sem plataformas disponíveis"
                      : "Escolher plataforma"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="button" className="h-11 flex-1" onClick={handleStart} disabled={!canStart}>
              {starting ? "A iniciar…" : "Começar"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
