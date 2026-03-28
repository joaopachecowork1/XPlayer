"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

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

  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setUser(null);
      return;
    }

    // Se já temos user definido, não faz nada
    if (user) return;

    // Usa dados da sessão NextAuth diretamente
    const sessionUser = session?.user as
      | {
          email?: string | null;
          id?: string | null;
          isAdmin?: boolean | null;
          name?: string | null;
        }
      | undefined;
    
    const userData = {
      id: sessionUser?.id || "unknown",
      email: sessionUser?.email || "",
      name: sessionUser?.name || sessionUser?.email?.split("@")[0] || "",
      isAdmin: Boolean(sessionUser?.isAdmin),
    };

    console.log("[AuthContext] Setting user from NextAuth:", userData);
    setUser(userData);
  }, [session?.user, status, user]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLogged: status === "authenticated",
      loading: status === "loading",
      loginGoogle: () => signIn("google"),
      logout: () => signOut({ callbackUrl: "/canhoes/login", redirect: true }),
    }),
    [user, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
