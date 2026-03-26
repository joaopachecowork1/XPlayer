"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CanhoesChrome } from "@/components/chrome/canhoes/CanhoesChrome";
import { useAuth } from "@/hooks/useAuth";
import { IS_MOCK_MODE } from "@/lib/mock";
import { DevModeBanner } from "@/components/dev/DevModeBanner";

export default function CanhoesAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isLogged, loading, user } = useAuth();

  useEffect(() => {
    if (IS_MOCK_MODE) return;
    
    // Timeout de segurança: se após 5s ainda estiver loading, assume erro e vai para login
    const timeout = setTimeout(() => {
      if (loading && !user) {
        console.warn("[CanhoesAppLayout] Timeout - auth still loading after 5s, redirecting to login");
        router.replace("/canhoes/login");
      }
    }, 5000);

    if (!loading && !isLogged) {
      router.replace("/canhoes/login");
    }

    return () => clearTimeout(timeout);
  }, [loading, isLogged, user, router]);

  // Loading screen com timeout visual
  if (!IS_MOCK_MODE && (loading || !isLogged)) {
    return (
      <div data-theme="canhoes" className="min-h-[100svh] flex flex-col items-center justify-center bg-[var(--bg-base)]">
        <div className="h-10 w-10 border-4 border-[var(--color-moss)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[var(--color-text-muted)] animate-pulse">{loading ? "A preparar os Canhões..." : "A redirecionar..."}</p>
        {/* Debug info (remove em produção) */}
        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          {loading ? "Loading..." : !isLogged ? "Not logged" : "Unknown"}
        </p>
      </div>
    );
  }

  return (
    <>
      <CanhoesChrome>{children}</CanhoesChrome>
      <DevModeBanner />
    </>
  );
}
