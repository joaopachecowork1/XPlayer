"use client";

import { useEffect, useState } from "react";
import { searchGames } from "@/services/GameService";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

import { Check, ChevronsUpDown } from "lucide-react";
import { createSession } from "@/services/SessionService";

type Game = {
  id: number;
  name: string;
};

export default function CreateSession() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [selected, setSelected] = useState<Game | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // 🔹 API EXTERNA (RAWG)
  useEffect(() => {
    if (!query) return;

    searchGames(query).then(setGames);
  }, [query]);

  async function handleStartSession() {
    if (!selected || !token) return;

    await createSession(token, selected.id, selected.name);
    alert("Session started 🎮");
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Start a Session</h1>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selected ? selected.name : "Select a game"}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-full">
          <Command>
            <CommandInput
              placeholder="Search game..."
              value={query}
              onValueChange={setQuery}
            />

            <CommandList>
              {games.map((g) => (
                <CommandItem
                  key={g.id}
                  onSelect={() => {
                    setSelected(g);
                    setOpen(false);
                  }}
                >
                  {g.name}
                  {selected?.id === g.id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        className="w-full"
        disabled={!selected}
        onClick={handleStartSession}
      >
        Start Session
      </Button>
    </div>
  );
}
