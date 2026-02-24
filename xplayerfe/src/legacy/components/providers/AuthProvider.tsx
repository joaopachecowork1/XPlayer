"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider as AuthContextProvider } from "@/contexts/AuthContext";

// App-level auth providers:
// - NextAuth session
// - AuthContext (single /me fetch for the whole app)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}
