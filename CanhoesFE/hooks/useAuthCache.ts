"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { canhoesFetch, ApiError } from "@/lib/api";

/**
 * Tipo de resposta da API /api/me
 */
export type MeResponse = {
  user?: {
    id: string;
    email: string;
    displayName?: string;
    isAdmin: boolean;
  } | null;
};

/**
 * Configuração do cache
 */
const ME_CACHE_TTL_MS = 15_000; // 15 segundos

/**
 * Cache em módulo (singleton) para prevenir chamadas duplicadas
 */
let meInFlight: Promise<MeResponse | null> | null = null;
let meCache: MeResponse | null = null;
let meCacheTs = 0;

/**
 * Fetch único com cache - previne chamadas duplicadas de /api/me
 * quando múltiplos componentes pedem auth ao mesmo tempo.
 */
async function fetchMeOnce(): Promise<MeResponse | null> {
  const now = Date.now();

  // Retorna cache se válido
  if (meCache && now - meCacheTs < ME_CACHE_TTL_MS) {
    return meCache;
  }

  // Retorna request em andamento se existir
  if (meInFlight) {
    return meInFlight;
  }

  // Faz novo fetch
  meInFlight = (async () => {
    try {
      const resp = await canhoesFetch<MeResponse>("/api/me", {});
      const normalized = resp ?? null;
      meCache = normalized;
      meCacheTs = Date.now();
      return normalized;
    } catch (err) {
      // 401/404 = não autenticado, não é erro real
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        return { user: null };
      }
      console.error("fetchMeOnce error", err);
      return { user: null };
    }
  })().finally(() => {
    meInFlight = null;
  });

  return meInFlight;
}

/**
 * Hook para gerir cache de auth
 *
 * Propósito:
 * - Fazer fetch de /api/me com cache de 15s
 * - Prevenir chamadas duplicadas quando múltiplos componentes pedem auth
 * - Invalidar cache manualmente quando necessário
 *
 * Uso:
 * ```tsx
 * const { data, loading, refresh, clearCache } = useAuthCache();
 * ```
 */
export function useAuthCache() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(false);

  // Função para fazer fetch
  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMeOnce();
      if (!abortRef) {
        setData(result);
      }
    } finally {
      if (!abortRef) {
        setLoading(false);
      }
    }
  }, []);

  // Clear cache manual
  const clearCache = useCallback(() => {
    meCache = null;
    meCacheTs = 0;
    meInFlight = null;
    setData(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  return {
    data,
    loading,
    refresh: fetchMe,
    clearCache,
  };
}

/**
 * Exporta para compatibilidade
 */
export { fetchMeOnce };
