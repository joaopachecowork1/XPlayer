export interface BacklogGame {
  gameId: string;
  gameName: string;

  /** Epoch milliseconds. */
  addedAt: number;


  sessionsCount: number;

  /** Last time we played this game (epoch ms). */
  lastPlayedAt?: number;

  /** Aggregates (client-side for now). */
  totalPlaySeconds: number;
  totalXP: number;

  /** Optional metadata for nicer UI (populated from RAWG when available). */
  coverUrl?: string;
  released?: string | null;
  score?: number | null; // e.g. RAWG metacritic
}
