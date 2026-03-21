"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CanhoesChrome } from "@/components/chrome/canhoes/CanhoesChrome";
import { useAuth } from "@/hooks/useAuth";

export default function CanhoesAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
      <div data-theme="canhoes" className="min-h-[100svh] flex flex-col items-center justify-center bg-[linear-gradient(160deg,#1a3320_0%,#0d1f12_100%)]">
         <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-sm text-muted-foreground animate-pulse">
           {loading ? "A preparar os Canhões..." : "A redirecionar..."}
         </p>
      </div>
    );
  }

  return <CanhoesChrome>{children}</CanhoesChrome>;
}