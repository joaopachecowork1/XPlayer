const RAWG_API_KEY = "61371c565b6c444c80736a29fc5d6628";
const BASE_URL = "https://api.rawg.io/api/games";

export interface GameObj {
  id: number;
  name: string;
  background_image: string;
  released: string;
}
export async function searchGames(query: string): Promise<GameObj[]> {
  if (!query) return [];
  const res = await fetch(`${BASE_URL}/search?key=${RAWG_API_KEY}&q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to fetch games");
  return res.json();
}
