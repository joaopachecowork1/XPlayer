"use client";

import React from "react";
import { AuthProvider as AuthContextProvider } from "@/contexts/AuthContext";

// App-level auth providers:
// - NextAuth session
// - AuthContext (single /me fetch for the whole app)
export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
