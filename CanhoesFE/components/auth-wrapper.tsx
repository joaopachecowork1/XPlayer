"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * AuthWrapper (NON-invasive):
 * - Por omissão, NÃO faz login automático nem redireciona.
 * - Se `required` = true, mostra um CTA com botão para login.
 */
export default function AuthWrapper({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  const { isLogged, loading, loginGoogle } = useAuth();

  if (!required) return <>{children}</>;

  if (loading) return <div className="p-6 text-sm text-muted-foreground">A carregar…</div>;

  if (!isLogged) {
    return (
      <div className="p-6 text-sm">
        Precisas de iniciar sessão para aceder a esta página.&nbsp;
        <button
          onClick={loginGoogle}
          className="underline underline-offset-4 hover:opacity-90"
        >
          Entrar com Google
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
