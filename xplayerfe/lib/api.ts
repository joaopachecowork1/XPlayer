// ✅ Compatibility facade.
//
// The codebase historically had multiple "xplayerFetch" wrappers.
// The only one that works reliably with NextAuth + backend auth is the
// proxy-based client under src/lib/api/xplayerClient.ts.
//
// Keep this file so existing imports ("@/lib/api") keep working.

export { ApiError, xplayerFetch, xplayerFetchOrNull } from "@/lib/api/xplayerClient";
