"use client";

import { useMe } from "@/lib/useMe";
import React from "react";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };

export default function RequireAdmin({ children, fallback }: Props) {
  const { me, loading, error } = useMe();

  if (loading) return <div className="p-6">A carregar…</div>;
  if (error) {
    if ((error as any)?.response?.status === 403) {
      return fallback ?? <div className="p-6 text-red-600">Sem permissões para aceder a este módulo.</div>;
    }
    return <div className="p-6 text-red-600">Erro a carregar sessão.</div>;
  }
  if (!me) return <div className="p-6">Sessão não encontrada.</div>;
  if (!me.isAdmin) {
    return fallback ?? <div className="p-6 text-red-600">Sem permissões para aceder a este módulo.</div>;
  }
  return <>{children}</>;
}