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
    if (IS_MOCK_MODE) return;

    if (status !== "authenticated") {
      setUser(null);
      return;
    }

    let cancelled = false;
    
    const bootstrap = async () => {
      setIsFetching(true);
      await refreshMe();
      
      if (cancelled) return;

      const me = meData;
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
