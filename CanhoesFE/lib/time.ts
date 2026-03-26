/**
 * Small time helpers used across modules.
 * Keep these as pure functions (easy to test later).
 */

export function formatHMS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function formatHM(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h <= 0 ? `${m}m` : `${h}h ${m}m`;
}

export function progressInLevel(totalXP: number, xpPerLevel = 1000) {
  const xp = Math.max(0, Math.floor(totalXP || 0));
  const xpInLevel = xp % xpPerLevel;
  return (xpInLevel / xpPerLevel) * 100;
}
