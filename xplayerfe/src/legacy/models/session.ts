export enum SessionStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  PAUSED = "PAUSED"
}

export interface Session {
  id: string;
  userId?: string;
  /**
   * Epoch milliseconds.
   * Using numbers avoids Date serialization issues and is resilient to app backgrounding.
   */
  startTime: number;
  endTime?: number;
  duration: number; // em segundos
  taskId?: string;
  xpEarned: number;
  status: SessionStatus;
  createdAt: number;

  // Game metadata for the session.
  gameId?: string;
  gameName?: string;
  platform?: string;

  /** RAWG background_image (used in Backlog/Sessions lists). */
  coverUrl?: string;
  /** RAWG metacritic score, when available. */
  score?: number;
  /** RAWG release date (YYYY-MM-DD), when available. */
  released?: string;

  // Pause bookkeeping.
  pausedAt?: number;
  totalPausedMs?: number;
}