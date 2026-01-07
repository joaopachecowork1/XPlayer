const RAWG_API_KEY = "SUA_API_KEY";
const BASE_URL = "https://api.rawg.io/api/games";

export async function searchGames(query: string) {
  const res = await fetch(
    `${BASE_URL}?search=${encodeURIComponent(query)}&key=${RAWG_API_KEY}`
  );

  const data = await res.json();

  return data.results.map((g: any) => ({
    id: g.id,
    name: g.name
  }));
}
