export function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function readLocalStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<T>(window.localStorage.getItem(key));
}

export function writeLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeLocalStorage(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
