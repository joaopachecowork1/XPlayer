"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from "@/lib/storage";
import { XPCalculator } from "@/lib/xp-calculator";
import { Session, SessionStatus } from "@/models/session";
import { BacklogGame } from "@/models/backlog";
import { useAuth } from "@/hooks/useAuth";
import { sessionRepo } from "@/lib/repositories/sessionRepo";
import { backlogRepo } from "@/lib/repositories/backlogRepo";
import type { SessionDto, BacklogGameDto } from "@/lib/api/types";

/**
 * Session/Backlog Store (no-backend mode)
 * - Single shared React context to keep all modules perfectly in sync.
 * - Persisted to localStorage per-user.
 *
 * FUTURE BACKEND:
 * Replace the persistence + mutations in this file with API calls.
 * Keep the store shape so UI modules remain unchanged.
 */

const LEGACY_KEYS = {
  active: "xplayer.activeSession",
  history: "xplayer.sessionHistory",
  backlog: "xplayer.backlog",
};

function scopedKey(userId: string | undefined, key: string) {
  // If auth is not ready yet, we still persist under a stable anon bucket.
  const uid = userId ?? "anon";
  return `xplayer.${uid}.${key}`;
}

type StartSessionPayload = {
  gameId: string;
  gameName: string;
  coverUrl?: string | null;
  released?: string | null;
  score?: number | null;
  platform?: string;
};

type Store = {
  activeSession: Session | null;
  history: Session[];
  backlog: BacklogGame[];

  // Derived
  isActive: boolean;
  elapsedSeconds: number;
  totals: { totalXP: number; totalPlaySeconds: number; level: number; xpToNext: number };

  // Actions
  startSession: (payload: StartSessionPayload) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => Promise<Session | null>;
  clearAllLocal: () => void;
};

const SessionContext = createContext<Store | null>(null);

function migrateLegacyIfNeeded(userId: string | undefined) {
  // Best-effort: if old unscoped keys exist and scoped keys are empty, move data.
  if (typeof window === "undefined") return;
  const aKey = scopedKey(userId, "activeSession");
  const hKey = scopedKey(userId, "sessionHistory");
  const bKey = scopedKey(userId, "backlog");

  if (!window.localStorage.getItem(aKey) && window.localStorage.getItem(LEGACY_KEYS.active)) {
    window.localStorage.setItem(aKey, window.localStorage.getItem(LEGACY_KEYS.active) as string);
    window.localStorage.removeItem(LEGACY_KEYS.active);
  }
  if (!window.localStorage.getItem(hKey) && window.localStorage.getItem(LEGACY_KEYS.history)) {
    window.localStorage.setItem(hKey, window.localStorage.getItem(LEGACY_KEYS.history) as string);
    window.localStorage.removeItem(LEGACY_KEYS.history);
  }
  if (!window.localStorage.getItem(bKey) && window.localStorage.getItem(LEGACY_KEYS.backlog)) {
    window.localStorage.setItem(bKey, window.localStorage.getItem(LEGACY_KEYS.backlog) as string);
    window.localStorage.removeItem(LEGACY_KEYS.backlog);
  }
}

function buildCompletedSession(active: Session, elapsedSeconds: number, userId?: string): Session {
  const endedAt = Date.now();
  const duration = Math.max(0, Math.floor(elapsedSeconds));
  const xpEarned = XPCalculator.calculateXP(duration, 0);

  return {
    ...active,
    userId: userId ?? active.userId,
    endTime: endedAt,
    duration,
    xpEarned,
    status: SessionStatus.COMPLETED,
    pausedAt: undefined,
  };
}

function toSession(dto: SessionDto): Session {
  return {
    id: dto.id,
    userId: dto.userId,
    gameId: dto.gameId,
    gameName: dto.gameName,
    coverUrl: dto.coverUrl ?? undefined,
    released: dto.released ?? undefined,
    score: dto.score ?? undefined,
    platform: dto.platform ?? undefined,
    status:
      dto.status === "ACTIVE"
        ? SessionStatus.ACTIVE
        : dto.status === "PAUSED"
          ? SessionStatus.PAUSED
          : SessionStatus.COMPLETED,
    startTime: Date.parse(dto.startedAt),
    endTime: dto.endedAt ? Date.parse(dto.endedAt) : undefined,
    duration: dto.durationSeconds ?? 0,
    xpEarned: dto.xpEarned ?? 0,
    createdAt: Date.parse(dto.startedAt),
    totalPausedMs: 0,
  };
}

function toBacklog(dto: BacklogGameDto): BacklogGame {
  return {
    gameId: dto.gameId,
    gameName: dto.gameName,
    coverUrl: dto.coverUrl ?? undefined,
    released: dto.released ?? undefined,
    score: dto.score ?? undefined,
    totalPlaySeconds: dto.totalPlaySeconds,
    totalXP: dto.totalXP,
    sessionsCount: dto.sessionsCount,
    lastPlayedAt: dto.lastPlayedAt ? Date.parse(dto.lastPlayedAt) : undefined,
    addedAt: Date.now(),
  };
}

function useSessionStore(userId: string | undefined): Store {
  // Hydrate (client-only)
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [history, setHistory] = useState<Session[]>([]);
  const [backlog, setBacklog] = useState<BacklogGame[]>([]);
  const [now, setNow] = useState(() => Date.now());
  // Once we successfully fetch from backend, we treat it as the source of truth.
  // We keep localStorage as a fallback for the *active session* only.
  const [backendReady, setBackendReady] = useState(false);

  // Hydration + optional migration
  useEffect(() => {
    migrateLegacyIfNeeded(userId);

    setActiveSession(readLocalStorage<Session>(scopedKey(userId, "activeSession")));
    setHistory(readLocalStorage<Session[]>(scopedKey(userId, "sessionHistory")) ?? []);
    setBacklog(readLocalStorage<BacklogGame[]>(scopedKey(userId, "backlog")) ?? []);
  }, [userId]);

  // Fetch latest data from backend (best-effort).
  // If backend is not ready or unreachable, the app still works from localStorage.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [b, s, a] = await Promise.all([
          backlogRepo.list(),
          sessionRepo.list(),
          sessionRepo.getActive(),
        ]);

        if (cancelled) return;
        setBacklog(b.map(toBacklog));
        setHistory(s.map(toSession));
        if (a) setActiveSession(toSession(a));
        setBackendReady(true);
      } catch {
        // ignore: localStorage fallback will keep the app usable
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Persist
  useEffect(() => {
    const k = scopedKey(userId, "activeSession");
    if (activeSession) writeLocalStorage(k, activeSession);
    else removeLocalStorage(k);
  }, [activeSession, userId]);

  // We only persist history/backlog locally while the backend is not available.
  // This keeps the app usable during early development or if the API is down.
  useEffect(() => {
    if (backendReady) return;
    writeLocalStorage(scopedKey(userId, "sessionHistory"), history);
  }, [history, userId, backendReady]);

  useEffect(() => {
    if (backendReady) return;
    writeLocalStorage(scopedKey(userId, "backlog"), backlog);
  }, [backlog, userId, backendReady]);

  // UI tick: for display only (truth is timestamps).
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const isActive = activeSession?.status === SessionStatus.ACTIVE;

  const elapsedSeconds = useMemo(() => {
    if (!activeSession) return 0;

    const baseEnd =
      activeSession.status === SessionStatus.PAUSED
        ? activeSession.pausedAt ?? activeSession.startTime
        : now;

    const totalPausedMs = activeSession.totalPausedMs ?? 0;
    const ms = Math.max(0, baseEnd - activeSession.startTime - totalPausedMs);
    return Math.floor(ms / 1000);
  }, [activeSession, now]);

  const totals = useMemo(() => {
    const totalXP = history.reduce((sum, s) => sum + (s.xpEarned ?? 0), 0);
    const totalPlaySeconds = history.reduce((sum, s) => sum + (s.duration ?? 0), 0);
    const level = XPCalculator.calculateLevel(totalXP);
    const xpToNext = XPCalculator.calculateXPToNextLevelFromTotal(totalXP);
    return { totalXP, totalPlaySeconds, level, xpToNext };
  }, [history]);

  const startSession: Store["startSession"] = async (payload) => {
    const startedAt = Date.now();
    const s: Session = {
      id: (globalThis.crypto?.randomUUID?.() ?? String(startedAt)),
      userId,
      startTime: startedAt,
      duration: 0,
      xpEarned: 0,
      status: SessionStatus.ACTIVE,
      createdAt: startedAt,
      gameId: payload.gameId,
      gameName: payload.gameName,
      platform: payload.platform,
      coverUrl: payload.coverUrl ?? undefined,
      released: payload.released ?? undefined,
      score: payload.score ?? undefined,
      totalPausedMs: 0,
    };

    setActiveSession(s);

    setBacklog((prev) => {
      const existing = prev.find((g) => g.gameId === payload.gameId);
      if (existing) {
        // Keep metadata fresh if we have it now.
        return prev.map((g) =>
          g.gameId !== payload.gameId
            ? g
            : {
                ...g,
                gameName: payload.gameName ?? g.gameName,
                coverUrl: payload.coverUrl ?? g.coverUrl,
                released: payload.released ?? g.released,
                score: payload.score ?? g.score,
              }
        );
      }

      const item: BacklogGame = {
        gameId: payload.gameId,
        gameName: payload.gameName,
        addedAt: startedAt,
        sessionsCount: 1,
        totalPlaySeconds: 0,
        totalXP: 0,
        coverUrl: payload.coverUrl ?? undefined,
        released: payload.released ?? undefined,
        score: payload.score ?? undefined,
      };
      return [item, ...prev];
    });

    // Persist to backend (best-effort). UI stays responsive even if the call fails.
    try {
      const created = await sessionRepo.start({
        gameId: payload.gameId,
        gameName: payload.gameName,
        coverUrl: payload.coverUrl ?? null,
        released: payload.released ?? null,
        score: payload.score ?? null,
        platform: payload.platform ?? null,
        startedAt: new Date(startedAt).toISOString(),
      });
      // Backend becomes the source of truth once available.
      setBackendReady(true);
      setActiveSession(toSession(created));
      // Refresh backlog in the background to keep aggregates aligned.
      backlogRepo.list().then((b) => setBacklog(b.map(toBacklog))).catch(() => {});
    } catch {
      // If backend fails, we keep local session running.
      // TODO(back-end): once stable, consider showing a subtle "offline" badge.
    }
  };

  const pauseSession = () => {
    if (!activeSession || activeSession.status !== SessionStatus.ACTIVE) return;
    setActiveSession({ ...activeSession, status: SessionStatus.PAUSED, pausedAt: Date.now() });
  };

  const resumeSession = () => {
    if (!activeSession || activeSession.status !== SessionStatus.PAUSED) return;
    const pausedAt = activeSession.pausedAt ?? Date.now();
    const pausedMs = Math.max(0, Date.now() - pausedAt);
    setActiveSession({
      ...activeSession,
      status: SessionStatus.ACTIVE,
      pausedAt: undefined,
      totalPausedMs: (activeSession.totalPausedMs ?? 0) + pausedMs,
    });
  };

  const stopSession: Store["stopSession"] = async () => {
    if (!activeSession) return null;

    const completed = buildCompletedSession(activeSession, elapsedSeconds, userId);
    const endedAt = completed.endTime ?? Date.now();

    setActiveSession(null);
    setHistory((prev) => [completed, ...prev]);

    setBacklog((prev) => {
      const idx = prev.findIndex((g) => g.gameId === completed.gameId);
      if (idx === -1) return prev;

      const item = prev[idx];
      const updated: BacklogGame = {
        ...item,
        gameName: completed.gameName ?? item.gameName,
        lastPlayedAt: endedAt,
        totalPlaySeconds: (item.totalPlaySeconds ?? 0) + (completed.duration ?? 0),
        totalXP: (item.totalXP ?? 0) + (completed.xpEarned ?? 0),
      };
      const next = [...prev];
      next[idx] = updated;
      return next;
    });

    // Persist stop to backend (best-effort). Backend is the source of truth when available.
    try {
      await sessionRepo.stop(completed.id, { endedAt: new Date(endedAt).toISOString() });
      // Optional: refresh lists from backend to keep totals perfectly aligned.
      const [b, s] = await Promise.all([backlogRepo.list(), sessionRepo.list()]);
      setBacklog(b.map(toBacklog));
      setHistory(s.map(toSession));
      setBackendReady(true);
    } catch {
      // ignore
    }

    return completed;
  };

  const clearAllLocal = () => {
    removeLocalStorage(scopedKey(userId, "activeSession"));
    removeLocalStorage(scopedKey(userId, "sessionHistory"));
    removeLocalStorage(scopedKey(userId, "backlog"));
    setActiveSession(null);
    setHistory([]);
    setBacklog([]);
  };

  return {
    activeSession,
    history,
    backlog,
    isActive,
    elapsedSeconds,
    totals,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    clearAllLocal,
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const store = useSessionStore(user?.id);
  return React.createElement(SessionContext.Provider, { value: store }, children);
}

export function useSession(): Store {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider />");
  return ctx;
}
