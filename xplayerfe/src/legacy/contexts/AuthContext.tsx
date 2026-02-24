"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { ApiError, xplayerFetchSafe } from "@/lib/api/xplayerClient";

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
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Small in-module cache to prevent duplicate /me calls (dev StrictMode double effects, etc.)
let meInFlight: Promise<MeResponse | null> | null = null;
let meCache: MeResponse | null = null;
let meCacheTs = 0;
const ME_CACHE_TTL_MS = 15_000;

const LOGGING_OUT_KEY = "xplayer:loggingOut";

function isUnauthorized(err: unknown) {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

function isLoggingOut(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LOGGING_OUT_KEY) === "1";
}

function setLoggingOutFlag(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) window.localStorage.setItem(LOGGING_OUT_KEY, "1");
  else window.localStorage.removeItem(LOGGING_OUT_KEY);
}

function clearMeCache() {
  meCache = null;
  meCacheTs = 0;
  meInFlight = null;
}

async function fetchMeOnceSafe(): Promise<
  | { ok: true; data: MeResponse | null }
  | { ok: false; error: ApiError }
> {
  const now = Date.now();
  if (meCache && now - meCacheTs < ME_CACHE_TTL_MS) return { ok: true, data: meCache };
  if (meInFlight) return { ok: true, data: await meInFlight };

  meInFlight = (async () => {
    const resp = await xplayerFetchSafe<MeResponse>("/me", {});
    if (!resp.ok) throw resp.error;

    const normalized = resp.data ?? null;
    meCache = normalized;
    meCacheTs = Date.now();
    return normalized;
  })().finally(() => {
    meInFlight = null;
  });

  try {
    const data = await meInFlight;
    return { ok: true, data };
  } catch (e) {
    const err = e instanceof ApiError ? e : new ApiError("Request failed", 500, e);
    return { ok: false, error: err };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const loading = status === "loading" || isFetching;

  useEffect(() => {
    // If we're in the middle of logging out, do NOT auto relogin.
    if (isLoggingOut()) {
      setUser(null);
      setIsFetching(false);
      return;
    }

    // Not authenticated -> reset and clear loggingOut flag
    if (status !== "authenticated") {
      setUser(null);
      setLoggingOutFlag(false);
      return;
    }

    // Authenticated but missing idToken (old cookie / incomplete session) -> force relogin
    if (!(session as any)?.idToken) {
      void (async () => {
        // avoid loops: don't try if we're logging out
        if (isLoggingOut()) return;

        await signOut({ redirect: false });
        await signIn("google");
      })();
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsFetching(true);

      const me = await fetchMeOnceSafe();
      if (cancelled) return;

      if (!me.ok) {
        // If backend says unauthorized, session/token is stale -> force relogin
        if (isUnauthorized(me.error)) {
          // avoid loops: don't try if we're logging out
          if (!isLoggingOut()) {
            await signOut({ redirect: false });
            await signIn("google");
          }
          return;
        }

        console.error("Auth bootstrap /me failed:", me.error);
        setUser(null);
        setIsFetching(false);
        return;
      }

      if (!me.data?.user) {
        setUser(null);
        setIsFetching(false);
        return;
      }

      setUser({
        id: me.data.user.id,
        email: me.data.user.email,
        name: me.data.user.displayName || session?.user?.name || undefined,
        isAdmin: Boolean(me.data.user.isAdmin),
      });

      setIsFetching(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [status, session]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLogged: status === "authenticated",
      loading,
      loginGoogle: () => signIn("google"),
      logout: () => {
        // Hard logout: prevents "signOut didn't work" cases with stale cookies.
        setLoggingOutFlag(true);
        clearMeCache();
        // Also call next-auth signOut (best effort, no redirect) to invalidate server session state.
        void signOut({ redirect: false });
        // Force redirect through the NextAuth endpoint to clear cookies reliably.
        window.location.href = "/api/auth/signout?callbackUrl=/login";
      },
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
