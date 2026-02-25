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

  // UI de Loading muito mais elegante
  if (loading || !isLogged) {
    return (
      <div data-theme="canhoes" className="min-h-[100svh] flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950/35 via-background to-background">
         <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-sm text-muted-foreground animate-pulse">
           {loading ? "A preparar os Canhões..." : "A redirecionar..."}
         </p>
      </div>
    );
  }

  return <CanhoesAppChrome>{children}</CanhoesAppChrome>;
}