import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

/**
 * Local persistence layer.
 *
 * Today: we persist to localStorage so the app works without a backend.
 * Future: replace these helpers with authenticated API calls + DB.
 */

export function userKey(userId: string | undefined, key: string) {
  return `xplayer.${userId ?? "anon"}.${key}`;
}

/**
 * Best-effort migration: if we find legacy keys (non user-scoped),
 * move them into the current user scope.
 */
export function migrateLegacyKey<T>(
  userId: string | undefined,
  legacyKey: string,
  scopedKey: string
) {
  const existing = readLocalStorage<T>(scopedKey);
  if (existing != null) return;

  const legacy = readLocalStorage<T>(legacyKey);
  if (legacy == null) return;

  writeLocalStorage(scopedKey, legacy);
}
