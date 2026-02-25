export type MockGame = {
  id: string;
  name: string;
};

// Lightweight offline-friendly fallback list.
// You can replace this with RAWG integration or your own DB later.
export const MOCK_GAMES: MockGame[] = [
  { id: "elden-ring", name: "Elden Ring" },
  { id: "baldurs-gate-3", name: "Baldur's Gate 3" },
  { id: "the-witcher-3", name: "The Witcher 3" },
  { id: "cyberpunk-2077", name: "Cyberpunk 2077" },
  { id: "hades", name: "Hades" },
  { id: "minecraft", name: "Minecraft" },
  { id: "fortnite", name: "Fortnite" },
  { id: "league-of-legends", name: "League of Legends" },
  { id: "counter-strike-2", name: "Counter-Strike 2" },
  { id: "valorant", name: "VALORANT" },
  { id: "fifa-24", name: "EA SPORTS FC 24" },
  { id: "rocket-league", name: "Rocket League" },
];

export const PLATFORMS: string[] = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X|S",
  "Xbox One",
  "Nintendo Switch",
  "Mobile",
];
