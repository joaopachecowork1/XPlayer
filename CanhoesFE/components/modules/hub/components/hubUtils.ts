import { absMediaUrl } from "@/lib/media";

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

export { absMediaUrl };


