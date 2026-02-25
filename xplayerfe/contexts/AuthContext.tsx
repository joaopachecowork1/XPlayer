"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { xplayerFetch, ApiError } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  isLogged: boolean;
  loading: boolean;
  loginGoogle: () => void;
  logout: () => void;
};

type MeResponse = {
  user?: {
    id: string;
    email: string;
    displayName?: string;
    isAdmin: boolean;
  } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Small in-module cache to prevent duplicate /me calls
let meInFlight: Promise<MeResponse | null> | null = null;
let meCache: MeResponse | null = null;
let meCacheTs = 0;
const ME_CACHE_TTL_MS = 15_000;

async function fetchMeOnce(): Promise<MeResponse | null> {
  const now = Date.now();
  if (meCache && now - meCacheTs < ME_CACHE_TTL_MS) return meCache;
  if (meInFlight) return meInFlight;

  meInFlight = (async () => {
    try {
      const resp = await xplayerFetch<MeResponse>("/api/me", {});
      const normalized = resp ?? null;
      meCache = normalized;
      meCacheTs = Date.now();
      return normalized;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        return { user: null };
      }
      console.error("fetchMeOnce error", err);
      return { user: null };
    }
  })().finally(() => {
    meInFlight = null;
  });

  return meInFlight;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const loading = status === "loading" || isFetching;

  useEffect(() => {
    if (status !== "authenticated") {
      setUser(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsFetching(true);
      const me = await fetchMeOnce();
      if (cancelled) return;

      if (!me?.user) {
        setUser(null);
        setIsFetching(false);
        return;
      }

      setUser({
        id: me.user.id,
        email: me.user.email,
        name: me.user.displayName || session?.user?.name || undefined,
        isAdmin: Boolean(me.user.isAdmin),
      });

      setIsFetching(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.name]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLogged: status === "authenticated",
      loading,
      loginGoogle: () => signIn("google"),
      logout: () => signOut({ callbackUrl: "/login" }),
    }),
    [user, status, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
