"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "./input";
import { GameObj, searchGames } from "@/services/GameService";

export default function CreateSessionPage() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!query) return;

    const timeout = setTimeout(async () => {
      try {
        await searchGames(query);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearch = async () => {
    try {
      await searchGames(query);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartSession = async () => {
    await searchGames(query);
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

// Required by GameService type
export type { GameObj };
