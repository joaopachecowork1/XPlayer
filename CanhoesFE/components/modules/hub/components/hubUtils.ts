import { CANHOES_API_URL } from "@/lib/api/canhoesClient";

export function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts.at(-1)?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

export function formatDateTime(value: string | Date) {
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  } catch {
    return "";
  }
}

// Backend returns "/uploads/...". In dev frontend is a different origin.
export function absMediaUrl(url: string) {
  if (!url) return "";

  const raw = url.trim();
  if (!raw) return "";

  // Some backend responses may contain Windows separators.
  const normalized = raw.replaceAll("\\", "/");

  const uploadsIndex = normalized.toLowerCase().indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return normalized.slice(uploadsIndex);
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      const parsed = new URL(normalized);
      // Backend may return absolute local URLs (e.g. localhost) that break on phones.
      // Prefer same-origin /uploads so Next rewrite can proxy consistently.
      if (parsed.pathname.startsWith("/uploads/")) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return normalized;
    }
    return normalized;
  }

  if (normalized.startsWith("uploads/")) {
    return `/${normalized}`;
  }

  // If backend returns "/uploads/...", keep it as a same-origin path.
  // In dev we add a Next rewrite to proxy /uploads/* -> backend, which avoids
  // mixed-content + CORS issues and makes images load reliably.
  if (normalized.startsWith("/uploads/")) return normalized;

  if (normalized.startsWith("/")) return `${CANHOES_API_URL}${normalized}`;
  return `${CANHOES_API_URL}/${normalized}`;
}


