"use client";

/**
 * Very small fetch wrapper for the XPlayer backend (via /api/proxy/*).
 *
 * Goals:
 * - Junior-friendly (one function, predictable behavior)
 * - Always return something (or undefined) without crashing on empty bodies
 * - Consistent errors (ApiError)
 */

export const XPLAYER_API_URL =
  process.env.NEXT_PUBLIC_XPLAYER_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function normalizePath(path: string) {
  let p = path.trim();
  if (p.startsWith("/")) p = p.slice(1);
  if (p.startsWith("api/")) p = p.slice(4);
  return p;
}

async function readBody(res: Response): Promise<unknown> {
  // 204 = empty by definition
  if (res.status === 204) return undefined;

  const text = await res.text();
  if (!text) return undefined;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      // If server lied about JSON, just return raw text.
      return text;
    }
  }
  return text;
}

/**
 * Main fetch: throws on non-2xx.
 */
export async function xplayerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalized = normalizePath(path);
  if (!normalized) {
    throw new ApiError("Invalid API path: path cannot be empty", 400);
  }
  const proxyUrl = `/api/proxy/${normalized}`;
  
  // Criar headers a partir do init
  const headers = new Headers(init?.headers || {});
  
  // Only set JSON header if caller didn't set anything and body is not FormData.
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  const { headers: _, ...restInit } = init || {};
  
  const res = await fetch(proxyUrl, {
    ...restInit, 
    headers,      
    credentials: "include",
    cache: "no-store",
  });

  if (res.ok) {
    return (await readBody(res)) as T;
  }

  const details = await readBody(res);
  const msg =
    typeof details === "object" && details && "message" in (details as any)
      ? String((details as any).message)
      : res.statusText || "Request failed";

  throw new ApiError(msg, res.status, details);
}