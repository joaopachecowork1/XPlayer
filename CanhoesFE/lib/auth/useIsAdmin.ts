"use client";

import { useAuth } from "@/hooks/useAuth";

export function useIsAdmin() {
  const { user } = useAuth();
  return Boolean(user?.isAdmin);
}
