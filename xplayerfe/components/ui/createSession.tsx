"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import { Input } from "./input";
import { GameObj, searchGames } from "@/services/GameService";
import Game from "../game/game";

export default function CreateSessionPage() {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<GameObj[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameObj | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setGames([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchGames(query);
        setGames(res);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await searchGames(query);
      setGames(res);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  const handleStartSession = async () => {
    searchGames(query);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Criar Sessão</h2>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Pesquisar jogo</label>
        <Input
          placeholder="Escreve o nome do jogo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Button onClick={handleSearch}>Pesquisar</Button>

      

      <Button onClick={handleStartSession} className="mt-4">
        Iniciar Sessão
      </Button>
    </div>
  );
}
