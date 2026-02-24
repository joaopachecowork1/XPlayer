"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CanhoesAppChrome } from "@/components/canhoes/CanhoesAppChrome";
import { useAuth } from "@/hooks/useAuth";

export default function CanhoesAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLogged, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isLogged) {
      router.replace("/canhoes/login");
    }
  }, [loading, isLogged, router]);

  if (loading) {
    return <div className="min-h-[100svh] grid place-items-center text-sm text-muted-foreground">A verificar sessão...</div>;
  }

  if (!isLogged) {
    return <div className="min-h-[100svh] grid place-items-center text-sm text-muted-foreground">A redirecionar...</div>;
  }

  return <CanhoesAppChrome>{children}</CanhoesAppChrome>;
}
