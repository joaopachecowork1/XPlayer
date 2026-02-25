import { XPLAYER_API_URL } from "@/lib/api/xplayerClient";

export function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
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
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // If backend returns "/uploads/...", keep it as a same-origin path.
  // In dev we add a Next rewrite to proxy /uploads/* -> backend, which avoids
  // mixed-content + CORS issues and makes images load reliably.
  if (url.startsWith("/uploads/")) return url;

  if (url.startsWith("/")) return `${XPLAYER_API_URL}${url}`;
  return `${XPLAYER_API_URL}/${url}`;
}
