"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AuthWrapper({ children, redirectTo = "/login" }: { children: ReactNode; redirectTo?: string }) {
  const { isLogged, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isLogged) router.push(redirectTo);
    else setReady(true);
  }, [loading, isLogged, router, redirectTo]);

  if (!ready) return null;
  return <>{children}</>;
}
