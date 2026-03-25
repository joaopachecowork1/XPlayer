"use client";

/**
 * Very small fetch wrapper for the XPlayer backend (via /api/proxy/*).
 *
 * Goals:
 * - Junior-friendly
 * - Safe defaults for auth bootstrap (avoid crashing on 401)
 * - Still allow "strict" mode when you want to throw on 401
 *
 * Mock mode: when `NEXT_PUBLIC_MOCK_AUTH=true` (non-production only),
 * all requests are intercepted and return static fixtures from
 * `lib/mock/mockFetch`.  This allows fully offline development.
 */

export const XPLAYER_API_URL =
  process.env.NEXT_PUBLIC_XPLAYER_API_URL || "http://localhost:5000";

// ── Mock mode intercept ──────────────────────────────────────────────────────
// Hard-guarded behind NODE_ENV !== 'production' so this code is dead in prod.
const IS_MOCK_MODE =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

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

type XplayerRequestInit = RequestInit & {
  /**
   * xplayer options:
   * - throwOnUnauthorized: if true, 401/403 will throw (default: false)
   */
  xplayer?: {
    throwOnUnauthorized?: boolean;
  };
};

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
      return text;
    }
  }
  return text;
}

function isUnauthorizedStatus(status: number) {
  return status === 401 || status === 403;
}

/**
 * Main fetch.
 *
 * Default behavior:
 * - Throws on non-2xx EXCEPT 401/403, which returns null (so app doesn't crash on bootstrap)
 * - If you want strict unauthorized behavior: pass { xplayer: { throwOnUnauthorized: true } }
 *
 * In mock mode (`NEXT_PUBLIC_MOCK_AUTH=true`, non-production only) the real
 * network request is skipped and a static fixture is returned instead.
 */
export async function xplayerFetch<T>(path: string, init?: XplayerRequestInit): Promise<T> {
  if (IS_MOCK_MODE) {
    // Lazy-import to keep mock code out of the production bundle analysis path.
    const { getMockResponse } = await import("@/lib/mock/mockFetch");
    const proxyPath = `/api/proxy/${normalizePath(path)}`;
    return getMockResponse<T>(proxyPath, init?.method || "GET");
  }

  const normalized = normalizePath(path);
  if (!normalized) {
    throw new ApiError("Invalid API path: path cannot be empty", 400);
  }

  const proxyUrl = `/api/proxy/${normalized}`;

  const headers = new Headers(init?.headers || {});
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // remove custom key before passing to fetch
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { headers: _ignoredHeaders, xplayer, ...restInit } = init || {};

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
    typeof details === "object" && details !== null && "message" in details
      ? String((details as { message: unknown }).message)
      : res.statusText || "Request failed";

  // ✅ default: DON'T crash on 401/403 (bootstrap loads)
  const throwOnUnauthorized = Boolean(xplayer?.throwOnUnauthorized);
  if (isUnauthorizedStatus(res.status) && !throwOnUnauthorized) {
    // return null in a typed-safe-ish way
    return null as unknown as T;
  }

  throw new ApiError(msg, res.status, details);
}

/**
 * Convenience: explicit helper that returns null on 401/403 (and throws on others).
 */
export async function xplayerFetchOrNull<T>(
  path: string,
  init?: XplayerRequestInit
): Promise<T | null> {
  try {
    // force "non-throw on unauthorized"
    const data = await xplayerFetch<T>(path, { ...(init || {}), xplayer: { throwOnUnauthorized: false } });
    return (data ?? null) as T | null;
  } catch (e) {
    if (e instanceof ApiError && isUnauthorizedStatus(e.status)) return null;
    throw e;
  }
}

/**
 * Safe wrapper: never throws.
 */
export type XplayerSafeResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export async function xplayerFetchSafe<T>(
  path: string,
  init?: XplayerRequestInit
): Promise<XplayerSafeResult<T>> {
  try {
    const data = await xplayerFetch<T>(path, init);
    return { ok: true, data };
  } catch (e) {
    const err = e instanceof ApiError ? e : new ApiError("Request failed", 500, e);
    return { ok: false, error: err };
  }
}
