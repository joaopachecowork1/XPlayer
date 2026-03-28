import { CANHOES_API_URL } from "@/lib/api/canhoesClient";

function normalizeMediaPath(path: string) {
  return path.trim().replaceAll("\\", "/");
}

export function absMediaUrl(path: string | null | undefined) {
  if (!path) return "";

  const normalizedPath = normalizeMediaPath(path);
  if (!normalizedPath) return "";

  const uploadsIndex = normalizedPath.toLowerCase().indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return normalizedPath.slice(uploadsIndex);
  }

  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    try {
      const parsedUrl = new URL(normalizedPath);
      if (parsedUrl.pathname.startsWith("/uploads/")) {
        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }
    } catch {
      return normalizedPath;
    }

    return normalizedPath;
  }

  if (normalizedPath.startsWith("uploads/")) {
    return `/${normalizedPath}`;
  }

  if (normalizedPath.startsWith("/uploads/")) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith("/")) {
    return `${CANHOES_API_URL}${normalizedPath}`;
  }

  return `${CANHOES_API_URL}/${normalizedPath}`;
}
