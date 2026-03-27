"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CanhoesChrome } from "@/components/chrome/canhoes/CanhoesChrome";
import { useAuth } from "@/hooks/useAuth";
import { DevModeBanner } from "@/components/dev/DevModeBanner";

export default function CanhoesAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isLogged, loading, user } = useAuth();

  useEffect(() => {
    // Timeout de segurança: se após 8s ainda estiver loading, força redirect para login
    const timeout = setTimeout(() => {
      if (loading && !user) {
        console.warn("[CanhoesAppLayout] Timeout - auth still loading after 8s, redirecting to login");
        router.replace("/canhoes/login");
      }
    }, 8000);

    // Se não está loading e não está logged, vai para login
    if (!loading && !isLogged) {
      router.replace("/canhoes/login");
    }

    return () => clearTimeout(timeout);
  }, [loading, isLogged, user, router]);

  // Loading screen - só mostra se estiver loading E não tiver user
  if (loading && !user) {
    return (
      <div data-theme="canhoes" className="min-h-[100svh] flex flex-col items-center justify-center bg-[var(--bg-base)]">
        <div className="h-10 w-10 border-4 border-[var(--color-moss)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[var(--color-text-muted)] animate-pulse">A preparar os Canhões...</p>
      </div>
    );
  }

  // Se não está loading mas também não está logged, mostra loading breve antes de redirect
  if (!loading && !isLogged) {
    return (
      <div data-theme="canhoes" className="min-h-[100svh] flex flex-col items-center justify-center bg-[var(--bg-base)]">
        <div className="h-10 w-10 border-4 border-[var(--color-moss)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[var(--color-text-muted)] animate-pulse">A redirecionar...</p>
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
