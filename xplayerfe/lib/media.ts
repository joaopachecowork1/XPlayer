export const API_BASE =
  process.env.NEXT_PUBLIC_XPLAYER_API_URL ?? "http://localhost:63864";

export function absMediaUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return API_BASE + path;
  return API_BASE + "/" + path;
}
