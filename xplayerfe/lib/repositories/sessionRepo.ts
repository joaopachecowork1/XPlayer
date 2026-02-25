"use client";

import { xplayerFetch } from "@/lib/api/xplayerClient";
import type { SessionDto, StartSessionRequest, StopSessionRequest } from "@/lib/api/types";

/**
 * Backend repository for Sessions.
 * Keeps network calls out of UI components.
 */

export const sessionRepo = {
  async getActive(): Promise<SessionDto | null> {
    // TODO(back-end): implement this endpoint.
    // Suggested: GET /api/sessions/active
    try {
      return await xplayerFetch<SessionDto>("/api/sessions/active");
    } catch {
      return null;
    }
  },

  async list(gameId?: string): Promise<SessionDto[]> {
    const q = gameId ? `?gameId=${encodeURIComponent(gameId)}` : "";
    return xplayerFetch<SessionDto[]>(`/api/sessions${q}`);
  },

  async start(req: StartSessionRequest): Promise<SessionDto> {
    return xplayerFetch<SessionDto>("/api/sessions/start", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  async stop(sessionId: string, req: StopSessionRequest): Promise<SessionDto> {
    return xplayerFetch<SessionDto>(`/api/sessions/${encodeURIComponent(sessionId)}/stop`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  },
};
