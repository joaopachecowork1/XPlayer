"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { IS_MOCK_MODE, MOCK_AUTH_USER } from "@/lib/mock";
import { useAuthCache } from "@/hooks/useAuthCache";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { data: meData, loading: meLoading, refresh: refreshMe } = useAuthCache();
  
  // In mock mode, start with the mock admin user already populated.
  const [user, setUser] = useState<AuthUser | null>(IS_MOCK_MODE ? MOCK_AUTH_USER : null);
  const [isFetching, setIsFetching] = useState(false);

  const loading = status === "loading" || isFetching || meLoading;

  useEffect(() => {
    // Mock mode: skip real authentication entirely.
    if (IS_MOCK_MODE) {
      console.log("[AuthContext] Mock mode active - using mock user");
      return;
    }

    console.log("[AuthContext] Session status:", status, "isAuthenticated:", status === "authenticated");

    if (status !== "authenticated") {
      setUser(null);
      return;
    }

    let cancelled = false;
    
    const bootstrap = async () => {
      console.log("[AuthContext] Fetching user data...");
      setIsFetching(true);
      await refreshMe();
      
      if (cancelled) return;

      console.log("[AuthContext] User data received:", meData);

      if (!meData?.user) {
        console.warn("[AuthContext] No user data - setting user to null");
        setUser(null);
        setIsFetching(false);
        return;
      }

      const newUser = {
        id: meData.user.id,
        email: meData.user.email,
        name: meData.user.displayName || session?.user?.name || undefined,
        isAdmin: Boolean(meData.user.isAdmin),
      };
      
      console.log("[AuthContext] Setting user:", newUser);
      setUser(newUser);
      setIsFetching(false);
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.name, refreshMe, meData]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: IS_MOCK_MODE ? MOCK_AUTH_USER : user,
      isLogged: IS_MOCK_MODE ? true : status === "authenticated",
      loading: IS_MOCK_MODE ? false : loading,
      loginGoogle: () => { if (!IS_MOCK_MODE) signIn("google"); },
      logout: () => { if (!IS_MOCK_MODE) signOut({ callbackUrl: "/canhoes/login" }); },
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
