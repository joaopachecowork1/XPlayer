"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { CanhoesChrome } from "@/components/chrome/canhoes/CanhoesChrome";
import { useAuth } from "@/hooks/useAuth";

function AuthLoadingState({ label }: Readonly<{ label: string }>) {
  return (
    <div
      data-theme="canhoes"
      className="bg-circuit min-h-[100svh] flex flex-col items-center justify-center bg-[var(--bg-void)] text-[var(--text-primary)]"
    >
      <div className="mb-4 h-10 w-10 rounded-full border-4 border-[var(--moss)] border-t-transparent animate-spin" />
      <p className="font-[var(--font-mono)] text-sm uppercase tracking-[0.14em] text-[var(--beige)]/76 animate-pulse">
        {label}
      </p>
    </div>
  );
}

export default function CanhoesAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isLogged, loading, user } = useAuth();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (loading && !user) {
        router.replace("/canhoes/login");
      }
    }, 8000);

    if (!loading && !isLogged) {
      router.replace("/canhoes/login");
    }

    return () => window.clearTimeout(timeoutId);
  }, [isLogged, loading, router, user]);

  if (loading && !user) {
    return <AuthLoadingState label="A preparar os Canhoes..." />;
  }

  if (!loading && !isLogged) {
    return <AuthLoadingState label="A redirecionar..." />;
  }

  return <CanhoesChrome>{children}</CanhoesChrome>;
}
