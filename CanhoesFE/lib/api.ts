// ✅ Compatibility facade.
//
// The codebase historically had multiple "canhoesFetch" wrappers.
// The only one that works reliably with NextAuth + backend auth is the
// proxy-based client under src/lib/api/canhoesClient.ts.
//
// Keep this file so existing imports ("@/lib/api") keep working.

export { ApiError, canhoesFetch, canhoesFetchOrNull } from "@/lib/api/canhoesClient";

