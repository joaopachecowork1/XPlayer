"use client";

import { xplayerFetch } from "@/lib/api/xplayerClient";
import type { BacklogGameDto } from "@/lib/api/types";

/**
 * Backend repository for Backlog.
 */
export const backlogRepo = {
  async list(): Promise<BacklogGameDto[]> {
    return xplayerFetch<BacklogGameDto[]>("/api/backlog");
  },
};
