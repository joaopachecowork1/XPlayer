"use client";

/**
 * RAWG client (tiny, junior-friendly).
 *
 * Goal: keep RAWG fetch logic in ONE place (no duplication across components).
 *
 * Optional env:
 *   NEXT_PUBLIC_RAWG_API_KEY=...  (recommended)
 */

const BASE_URL = "https://api.rawg.io/api/games";

function rawgKey() {
  // NOTE: client-side env vars MUST be prefixed with NEXT_PUBLIC_ in Next.
  return process.env.NEXT_PUBLIC_RAWG_API_KEY ?? "";
}

function rawgUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  const key = rawgKey();
  if (key) url.searchParams.set("key", key);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export type RawgPlatformRef = {
  platform: { id: number; name: string };
};

export type RawgGameSearchResult = {
  id: number;
  name: string;
  background_image: string | null;
  short_screenshots?: { id: number; image: string }[];
  released: string | null;
  platforms?: RawgPlatformRef[];
};

export type RawgGameDetails = {
  id: number;
  name: string;
  background_image: string | null;
  background_image_additional?: string | null;
  short_screenshots?: { id: number; image: string }[];
  released: string | null;
  metacritic?: number | null;
  rating?: number | null;
  ratings_count?: number | null;
  platforms?: RawgPlatformRef[];
};

export async function rawgSearchGames(query: string, pageSize = 10): Promise<RawgGameSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const res = await fetch(
    rawgUrl("", {
      search: q,
      page_size: pageSize,
    })
  );
  if (!res.ok) throw new Error("Failed to fetch games");
  const data = await res.json();
  return (data?.results ?? []) as RawgGameSearchResult[];
}

export async function rawgGetGameDetails(gameId: number): Promise<RawgGameDetails> {
  const res = await fetch(rawgUrl(`/${gameId}`));
  if (!res.ok) throw new Error("Failed to fetch game details");
  return (await res.json()) as RawgGameDetails;
}
