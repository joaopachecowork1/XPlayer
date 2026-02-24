"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GameList } from "./GameList";
import { SelectedGameCard } from "./SelectedGameCard";

import { rawgSearchGames } from "@/lib/rawg";

interface Platform {
  platform: {
    id: number;
    name: string;
  };
}

export interface GameResult {
  id: number;
  name: string;
  background_image: string;
  released: string;
  platforms?: Platform[];
}

async function searchGames(query: string): Promise<GameResult[]> {
  // Reuse the shared RAWG client (no duplicated key/base URL).
  return (await rawgSearchGames(query, 10)) as unknown as GameResult[];
}

export default function GameSearchDropdown() {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<GameResult[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setGames([]);
      setIsOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchGames(query);
        setGames(results);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
        setGames([]);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGameSelect = (game: GameResult) => {
    setSelectedGame(game);
    setQuery(game.name);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Criar Nova Sessão</h2>
        <p className="text-muted-foreground">
          Pesquisa um jogo para começar uma nova sessão
        </p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Pesquisar jogo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (games.length > 0) setIsOpen(true);
            }}
            className="pl-10 pr-10"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 animate-spin" />
          )}
        </div>

        {isOpen && games.length > 0 && (
          <GameList games={games} onSelect={handleGameSelect} />
        )}

        {isOpen && !loading && query && games.length === 0 && (
          <Card className="absolute z-10 w-full mt-2 p-4 text-center">
            <p className="text-muted-foreground">Nenhum jogo encontrado</p>
          </Card>
        )}
      </div>

      {selectedGame && <SelectedGameCard game={selectedGame} />}
    </div>
  );
}